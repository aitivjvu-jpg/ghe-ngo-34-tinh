/**
 * Server chung cho mọi game live TikTok. Game riêng KHÔNG cần sửa file này,
 * trừ khi cần thêm API mới (thêm vào cuối, chỗ "API riêng của game").
 *
 * - Kết nối phòng live TikTok (tiktok-live-connector 2.x, proto v3)
 * - Đẩy sự kiện xuống trình duyệt qua SSE: /api/tiktok/events
 * - Lệnh từ trang điều khiển -> trang stage: /api/control
 * - Giọng đọc tiếng Việt: /api/tts (Edge TTS, lỗi thì Google)
 * - Giả lập sự kiện để test không cần live: /api/test/emit
 */
import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { TikTokLiveConnection, WebcastEvent, ControlEvent } from 'tiktok-live-connector';
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3010;

// Giọng đọc. Đổi ở đây nếu game cần giọng khác (vi-VN-HoaiMyNeural = nữ)
const TTS_VOICE = process.env.TTS_VOICE || 'vi-VN-NamMinhNeural';
const TTS_PITCH = process.env.TTS_PITCH || '-4%';

// Chặn DNS rebinding: trang web lạ trỏ tên miền của nó về 127.0.0.1 thì Host/Origin sẽ khác các tên dưới đây
const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', 'lvh.me']);
const hostOk = (h?: string) => !!h && LOCAL_HOSTS.has(h.replace(/:\d+$/, '').toLowerCase());
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (!hostOk(req.headers.host) || (origin && !hostOk(origin.replace(/^https?:\/\//, '')))) return res.status(403).end();
  next();
});

app.use(express.json());
app.use('/assets', express.static(path.join(__dirname, 'public', 'assets')));

// ---------- SSE ----------
interface LiveStats {
  isConnected: boolean;
  isConnecting: boolean;
  username: string;
  roomId: string;
  viewerCount: number;
  totalLikes: number;
  error?: string;
}

const emptyStats = (): LiveStats => ({
  isConnected: false,
  isConnecting: false,
  username: '',
  roomId: '',
  viewerCount: 0,
  totalLikes: 0,
  error: '',
});

let liveStats = emptyStats();
let sseClients: express.Response[] = [];
// Các trang stage đang mở (theo thứ tự mở). Chỉ trang mở SAU CÙNG được phát tiếng, tránh 2 giọng đọc đè nhau
// khi lỡ có 2 nguồn Link trong LIVE Studio hoặc mở thêm ?view=stage ở trình duyệt khác.
let stageIds: string[] = [];
const announceSpeaker = () => broadcast('speaker', { id: stageIds[stageIds.length - 1] ?? null, count: stageIds.length });
let activeConn: InstanceType<typeof TikTokLiveConnection> | null = null;
let lastRateControl: { action: string; text: string } | null = null;

// Tên kênh (giọng đọc + tiêu đề) lưu ở settings.json cạnh file này, tắt server mở lại vẫn còn
const SETTINGS_FILE = path.join(__dirname, 'settings.json');
let lastNameControl: { action: string; text: string } | null = null;
// tài khoản TikTok đang cần giữ kết nối: rớt thì tự kết nối lại, tắt server bật lại cũng tự kết nối
let wantUser = '';
let settings: { channelName?: string; tiktokUser?: string; tieuDe?: string } = {};
try {
  settings = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'));
  if (typeof settings.channelName === 'string' && settings.channelName.trim()) {
    lastNameControl = { action: 'setName', text: settings.channelName.trim() };
  }
  if (typeof settings.tiktokUser === 'string') wantUser = settings.tiktokUser;
} catch {
  // chưa lưu tên nào: dùng tên mặc định trong config.ts
}
const saveSettings = (patch: typeof settings) => {
  settings = { ...settings, ...patch };
  try {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
  } catch (err) {
    console.error('Không lưu được settings.json:', err);
  }
};

function broadcast(eventType: string, data: unknown) {
  const payload = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(payload);
    } catch {
      // trình duyệt đã đóng
    }
  }
}

app.get('/api/tiktok/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();
  res.write(`event: status\ndata: ${JSON.stringify(liveStats)}\n\n`);
  res.write(`event: caiDat\ndata: ${JSON.stringify(caiDat())}\n\n`);
  if (lastRateControl) res.write(`event: control\ndata: ${JSON.stringify(lastRateControl)}\n\n`);
  if (lastNameControl) res.write(`event: control\ndata: ${JSON.stringify(lastNameControl)}\n\n`);
  sseClients.push(res);
  const stageId = typeof req.query.stage === 'string' ? req.query.stage.slice(0, 40) : '';
  if (stageId) {
    stageIds = [...stageIds.filter((x) => x !== stageId), stageId];
    announceSpeaker();
  } else res.write(`event: speaker\ndata: ${JSON.stringify({ id: stageIds[stageIds.length - 1] ?? null, count: stageIds.length })}\n\n`);

  const heartbeat = setInterval(() => {
    try {
      res.write(': keep-alive\n\n');
    } catch {
      clearInterval(heartbeat);
    }
  }, 20000);

  req.on('close', () => {
    clearInterval(heartbeat);
    sseClients = sseClients.filter((c) => c !== res);
    if (stageId) {
      stageIds = stageIds.filter((x) => x !== stageId);
      announceSpeaker();
    }
  });
});

app.get('/api/tiktok/status', (_req, res) => res.json({ success: true, data: liveStats }));

// ---------- Đọc dữ liệu TikTok (proto v3) ----------
const userOf = (data: any) => data?.user?.displayId || data?.user?.uniqueId || data?.uniqueId || 'nguoi-xem';
const nickOf = (data: any) => data?.user?.nickname || data?.nickname || data?.uniqueId || 'Bạn';
const avatarOf = (data: any) => data?.user?.avatarThumb?.urlList?.[0] || '';

// ---------- Tự kết nối lại (treo live cả ngày) ----------
// Rớt kết nối / hết phiên live / chưa live: thử lại sau 15 giây, rồi 30, 60, tối đa 2 phút một lần, cho tới khi được.
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let reconnectTries = 0;
function scheduleReconnect(why: string) {
  if (!wantUser || reconnectTimer) return;
  const delay = Math.min(120_000, 15_000 * 2 ** reconnectTries);
  reconnectTries++;
  console.log(`[TikTok] ${why}. Tự kết nối lại @${wantUser} sau ${delay / 1000} giây`);
  liveStats = { ...liveStats, isConnected: false, isConnecting: false, error: `${why}. Tự kết nối lại sau ${delay / 1000} giây` };
  broadcast('status', liveStats);
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    connectTikTok(wantUser).catch((err) => scheduleReconnect(`Chưa kết nối lại được (${err instanceof Error ? err.message : err})`));
  }, delay);
}
const stopReconnect = () => {
  if (reconnectTimer) clearTimeout(reconnectTimer);
  reconnectTimer = null;
  reconnectTries = 0;
};

app.post('/api/tiktok/connect', async (req, res) => {
  const cleanUser = String(req.body?.username || '').replace(/^@/, '').trim();
  if (!cleanUser) return res.status(400).json({ success: false, error: 'Chưa nhập username TikTok' });
  stopReconnect();
  wantUser = cleanUser;
  saveSettings({ tiktokUser: cleanUser });
  try {
    const state = await connectTikTok(cleanUser);
    return res.json({ success: true, roomId: state?.roomId });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    scheduleReconnect(`Không kết nối được: ${msg}`);
    return res.status(400).json({
      success: false,
      error: `Không kết nối được @${cleanUser}: ${msg}. Tài khoản phải đang LIVE trên TikTok. Server sẽ tự thử lại.`,
    });
  }
});

async function connectTikTok(cleanUser: string) {
  if (activeConn) {
    try {
      activeConn.disconnect();
    } catch {
      // bỏ qua
    }
    activeConn = null;
  }

  liveStats = { ...emptyStats(), isConnecting: true, username: cleanUser };
  broadcast('status', liveStats);

  const conn = new TikTokLiveConnection(cleanUser, {
    processInitialData: true,
    // Lấy danh sách quà cần gói trả phí Euler Stream; sự kiện quà đã có tên và kim cương
    enableExtendedGiftInfo: false,
  });

  conn.on(ControlEvent.CONNECTED, (state: { roomId?: string }) => {
    console.log(`[TikTok] Đã kết nối @${cleanUser}, room ${state?.roomId}`);
    liveStats = { ...liveStats, isConnected: true, isConnecting: false, roomId: state?.roomId || '', error: '' };
    broadcast('status', liveStats);
    reconnectTries = 0;
  });

  // kết nối cũ bị thay bằng kết nối mới thì không tự nối lại (activeConn đã khác)
  conn.on(ControlEvent.DISCONNECTED, () => {
    console.log(`[TikTok] Mất kết nối @${cleanUser}`);
    if (activeConn !== conn) return;
    liveStats = { ...liveStats, isConnected: false, isConnecting: false };
    broadcast('status', liveStats);
    scheduleReconnect('Mất kết nối TikTok');
  });

  conn.on(WebcastEvent.STREAM_END, () => {
    if (activeConn !== conn) return;
    liveStats = { ...liveStats, isConnected: false, isConnecting: false, error: 'Phiên live đã kết thúc' };
    broadcast('status', liveStats);
    scheduleReconnect('Phiên live đã kết thúc');
  });

  conn.on(WebcastEvent.CHAT, (data: any) => {
    broadcast('chat', {
      username: userOf(data),
      nickname: nickOf(data),
      comment: data?.content || data?.comment || '', // proto v3: chữ nằm ở `content`
      avatar: avatarOf(data),
      timestamp: Date.now(),
      // giờ TikTok gắn lúc người xem gửi (ms): xếp ai trả lời nhanh nhất theo giờ này, không theo lúc bot nhận
      createTime: Number(data?.common?.createTime) || Date.now(),
    });
  });

  // TikTok gửi lại quà combo với repeatCount cộng dồn; chỉ chuyển phần mới
  const streakCounts = new Map<string, number>();
  conn.on(WebcastEvent.GIFT, (data: any) => {
    const username = userOf(data);
    const giftId = data?.giftId || 0;
    const key = `${username}_${giftId}`;
    const total = data?.repeatCount || 1;
    const delta = total - (streakCounts.get(key) || 0);
    const isStreakable = (data?.gift?.type ?? data?.giftDetails?.giftType ?? data?.giftType) === 1;
    if (isStreakable && !data?.repeatEnd) streakCounts.set(key, total);
    else streakCounts.delete(key);
    if (delta <= 0) return;

    broadcast('gift', {
      username,
      nickname: nickOf(data),
      giftName: data?.gift?.name || data?.giftDetails?.giftName || data?.giftName || 'Quà',
      giftId,
      diamondCount: data?.gift?.diamondCount || data?.diamondCount || data?.giftDetails?.diamondCount || 1,
      repeatCount: delta,
      avatar: avatarOf(data),
      timestamp: Date.now(),
    });
  });

  conn.on(WebcastEvent.MEMBER, (data: any) => {
    broadcast('member', { username: userOf(data), nickname: nickOf(data), avatar: avatarOf(data), timestamp: Date.now() });
  });

  conn.on(WebcastEvent.FOLLOW, (data: any) => {
    broadcast('follow', { username: userOf(data), nickname: nickOf(data), avatar: avatarOf(data), timestamp: Date.now() });
  });

  conn.on(WebcastEvent.SHARE, (data: any) => {
    broadcast('share', { username: userOf(data), nickname: nickOf(data), avatar: avatarOf(data), timestamp: Date.now() });
  });

  conn.on(WebcastEvent.ROOM_USER, (data: any) => {
    if (typeof data?.viewerCount === 'number') {
      liveStats.viewerCount = data.viewerCount;
      broadcast('roomUser', { viewerCount: data.viewerCount });
    }
  });

  conn.on(WebcastEvent.LIKE, (data: any) => {
    if (typeof data?.totalLikeCount === 'number') liveStats.totalLikes = data.totalLikeCount;
    broadcast('like', {
      username: userOf(data),
      nickname: nickOf(data),
      likeCount: data?.likeCount || 1,
      totalLikes: liveStats.totalLikes,
    });
  });

  conn.on(ControlEvent.ERROR, (err: unknown) => {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`[TikTok] Lỗi @${cleanUser}:`, msg);
    liveStats.error = msg;
    broadcast('status', liveStats);
  });

  activeConn = conn;

  try {
    // Chưa LIVE thì thư viện có thể treo mãi ở "Đang kết nối": hỏi TikTok trước, báo lỗi ngay
    const live = await conn.fetchIsLive().catch(() => true); // hỏi lỗi thì cứ thử kết nối
    if (!live) throw new Error('TikTok báo tài khoản này CHƯA LIVE. Bấm Phát trực tiếp trong LIVE Studio trước rồi mới kết nối');
    return await Promise.race([
      conn.connect(),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error('quá 30 giây không vào được phòng live')), 30_000)),
    ]);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    liveStats = { ...liveStats, isConnected: false, isConnecting: false, error: msg };
    broadcast('status', liveStats);
    if (activeConn === conn) {
      try {
        conn.disconnect();
      } catch {
        // bỏ qua
      }
      activeConn = null;
    }
    throw err;
  }
}

app.post('/api/tiktok/disconnect', (_req, res) => {
  // chủ kênh tự ngắt: thôi tự kết nối lại, bật server lại cũng không tự kết nối
  stopReconnect();
  wantUser = '';
  saveSettings({ tiktokUser: '' });
  try {
    activeConn?.disconnect();
  } catch {
    // bỏ qua
  }
  activeConn = null;
  liveStats = emptyStats();
  broadcast('status', liveStats);
  res.json({ success: true });
});

// ---------- Lệnh từ trang điều khiển (chỉ trang stage làm theo) ----------
const CONTROL_ACTIONS = ['speak', 'setRate', 'reset', 'setName', 'custom'];
app.post('/api/control', (req, res) => {
  const { action, text } = req.body || {};
  if (!CONTROL_ACTIONS.includes(action)) return res.status(400).json({ success: false, error: 'Lệnh không hợp lệ' });
  if (action === 'speak' && (typeof text !== 'string' || !text.trim())) {
    return res.status(400).json({ success: false, error: 'Chưa nhập nội dung cần đọc' });
  }
  const payload = { action, text: typeof text === 'string' ? text.trim().slice(0, 1000) : undefined };
  if (action === 'setRate' && payload.text) lastRateControl = { action, text: payload.text };
  if (action === 'setName') {
    // Chỉ chữ thường, tối đa 40 ký tự
    const name = (payload.text || '').replace(/[\x00-\x1f\x7f]/g, '').trim().slice(0, 40);
    if (!name) return res.status(400).json({ success: false, error: 'Chưa nhập tên kênh' });
    payload.text = name;
    lastNameControl = { action, text: name };
    try {
      saveSettings({ channelName: name });
    } catch (err) {
      console.error('Không lưu được settings.json:', err);
    }
  }
  broadcast('control', payload);
  res.json({ success: true, pages: sseClients.length });
});

// ---------- Giả lập sự kiện (test không cần live) ----------
const TEST_EVENTS = ['chat', 'gift', 'member', 'follow', 'share', 'like'];
app.post('/api/test/emit', (req, res) => {
  const { type, data } = req.body || {};
  if (!TEST_EVENTS.includes(type)) return res.status(400).json({ success: false, error: 'Loại sự kiện không hợp lệ' });
  const event = { timestamp: Date.now(), avatar: '', ...(data || {}) };
  if (type === 'like') {
    liveStats.totalLikes += Number(event.likeCount) || 1;
    event.totalLikes = liveStats.totalLikes;
  }
  broadcast(type, event);
  res.json({ success: true });
});

// ---------- Ghe Ngo 34 Tỉnh ----------
// Cài đặt hiển thị ở trang điều khiển: tên game trên đầu màn hình. Trống = dùng mặc định trong config.ts
const caiDat = () => ({ tieuDe: settings.tieuDe ?? '' });
app.get('/api/cai-dat', (_req, res) => res.json(caiDat()));
app.post('/api/cai-dat', (req, res) => {
  const sach = (x: unknown) => (typeof x === 'string' ? x.replace(/\s+/g, ' ').trim().slice(0, 24) : undefined);
  const tieuDe = sach(req.body?.tieuDe);
  if (tieuDe !== undefined) saveSettings({ tieuDe });
  broadcast('caiDat', caiDat());
  res.json({ success: true, ...caiDat() });
});

// Trang stage chạy game, gửi ảnh chụp lên đây; trang điều khiển vẽ lại ảnh chụp đó (xem trước luôn khớp live)
app.post('/api/game/state', (req, res) => {
  broadcast('gamestate', req.body || {});
  res.json({ success: true });
});

// Bảng vàng hôm nay: tỉnh nào thắng bao nhiêu vòng trong ngày (giờ máy), sang ngày mới làm lại.
// Tắt bật server giữa buổi live vẫn nhớ.
const BANG_FILE = path.join(__dirname, 'data', 'bang-vang.json');
type BangVang = { ngay: string; thang: Record<string, number> };
const homNay = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
function docBang(): BangVang {
  try {
    const b = JSON.parse(fs.readFileSync(BANG_FILE, 'utf8')) as BangVang;
    if (b.ngay === homNay() && b.thang) return b;
  } catch {
    // chưa có file
  }
  return { ngay: homNay(), thang: {} };
}
app.get('/api/bang-vang', (_req, res) => res.json(docBang()));
app.post('/api/bang-vang', (req, res) => {
  const tinh = typeof req.body?.tinh === 'string' ? req.body.tinh.slice(0, 40) : '';
  if (!tinh) return res.status(400).json({ success: false });
  const b = docBang();
  b.thang[tinh] = (b.thang[tinh] ?? 0) + 1;
  try {
    fs.mkdirSync(path.dirname(BANG_FILE), { recursive: true });
    fs.writeFileSync(BANG_FILE, JSON.stringify(b));
  } catch (err) {
    console.error('Không lưu được data/bang-vang.json:', err);
  }
  res.json(b);
});

// ---------- Giọng đọc ----------
const escapeXml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function splitText(text: string, max = 190): string[] {
  const chunks: string[] = [];
  let rest = text.trim();
  while (rest.length > max) {
    const win = rest.slice(0, max + 1);
    let cut = Math.max(win.lastIndexOf('. '), win.lastIndexOf('! '), win.lastIndexOf('? '));
    if (cut < max / 2) cut = Math.max(win.lastIndexOf(', '), win.lastIndexOf('; '));
    if (cut < max / 2) cut = win.lastIndexOf(' ');
    if (cut <= 0) cut = max - 1;
    chunks.push(rest.slice(0, cut + 1).trim());
    rest = rest.slice(cut + 1).trim();
  }
  if (rest) chunks.push(rest);
  return chunks;
}

async function edgeTts(text: string, rate: number): Promise<Buffer> {
  const tts = new MsEdgeTTS();
  try {
    await tts.setMetadata(TTS_VOICE, OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3);
    const { audioStream } = tts.toStream(escapeXml(text), { rate: `${Math.round((rate - 1) * 100)}%`, pitch: TTS_PITCH });
    const chunks: Buffer[] = [];
    const read = (async () => {
      for await (const c of audioStream) chunks.push(c as Buffer);
    })();
    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Edge TTS timeout')), 20000));
    await Promise.race([read, timeout]);
    if (chunks.length === 0) throw new Error('Edge TTS không trả âm thanh');
    return Buffer.concat(chunks);
  } finally {
    tts.close();
  }
}

async function googleTts(text: string): Promise<Buffer> {
  const parts: Buffer[] = [];
  for (const chunk of splitText(text)) {
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=vi&client=tw-ob&q=${encodeURIComponent(chunk)}`;
    const r = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Referer: 'https://translate.google.com/',
      },
    });
    if (!r.ok) throw new Error(`Google TTS lỗi ${r.status}`);
    parts.push(Buffer.from(await r.arrayBuffer()));
  }
  return Buffer.concat(parts);
}

const ttsCache = new Map<string, Buffer>();
let edgeNghiDen = 0;
let edgeDaBao = false;
// Giọng VieNeu (E:\02_AI\VieNeu-TTS chạy server ở cổng 8000, card đồ hoạ tạo giọng).
// Vừa tạo vừa phát nên gần như không phải chờ. VieNeu chưa bật hoặc lỗi thì tự quay về giọng Edge.
// Đổi giọng: đặt biến VIENEU_VOICE (vd "Thiện Minh"); để trống = chỉ dùng Edge.
const VIENEU_URL = process.env.VIENEU_URL || 'http://127.0.0.1:8000';
const VIENEU_VOICE = process.env.VIENEU_VOICE ?? 'Adam bựa';
const vieneuCache = new Map<string, Buffer>();
// VieNeu chưa bật / đang nạp mô hình: lỗi 1 lần thì khỏi gọi lại trong 30 giây (đỡ chờ, đỡ rác log)
let vieneuNghiDen = 0;
let vieneuDaBao = false;
async function vieneuTts(text: string, res: express.Response): Promise<boolean> {
  if (Date.now() < vieneuNghiDen && !vieneuCache.has(text)) return false;
  const cached = vieneuCache.get(text);
  if (cached) {
    res.setHeader('Content-Type', 'audio/wav');
    res.send(cached);
    return true;
  }
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 5000); // chỉ chờ tối đa 5 giây cho tới byte đầu
  try {
    const r = await fetch(`${VIENEU_URL}/v1/audio/speech`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'vieneu', voice: VIENEU_VOICE, input: text, response_format: 'wav' }),
      signal: ctrl.signal,
    });
    clearTimeout(timer);
    if (!r.ok || !r.body) throw new Error(`HTTP ${r.status}`);
    res.setHeader('Content-Type', 'audio/wav');
    res.setHeader('Cache-Control', 'no-store');
    const parts: Buffer[] = [];
    for await (const chunk of r.body as unknown as AsyncIterable<Uint8Array>) {
      const b = Buffer.from(chunk);
      parts.push(b);
      res.write(b);
    }
    res.end();
    if (vieneuDaBao) {
      vieneuDaBao = false;
      console.log('[Giọng] VieNeu đã chạy lại');
    }
    vieneuCache.set(text, Buffer.concat(parts));
    if (vieneuCache.size > 100) vieneuCache.delete(vieneuCache.keys().next().value!);
    return true;
  } catch (err) {
    clearTimeout(timer);
    if (res.headersSent) {
      res.end();
      return true;
    }
    vieneuNghiDen = Date.now() + 30_000;
    if (!vieneuDaBao) {
      vieneuDaBao = true;
      console.warn(`[Giọng] VieNeu chưa trả lời ở ${VIENEU_URL} (${err instanceof Error ? err.message : err}). Tạm dùng giọng Edge, 30 giây thử lại VieNeu một lần.`);
    }
    return false;
  }
}

app.get('/api/tts', async (req, res) => {
  try {
    const raw = String(req.query.text || '').trim().slice(0, 1500);
    if (!raw) return res.status(400).send('Thiếu text');
    const rate = Math.min(1.5, Math.max(0.5, Number(req.query.rate) || 1));
    if (VIENEU_VOICE && (await vieneuTts(raw, res))) return;
    // Edge / Google không hiểu thẻ cảm xúc [cười] [thở dài]...: bỏ đi để khỏi đọc thành chữ
    const text = raw.replace(/\[[^\]]*\]\s*/g, '').trim();
    if (!text) return res.status(204).end();
    const key = `${rate}|${text}`;
    let audio = ttsCache.get(key);
    if (!audio) {
      if (Date.now() < edgeNghiDen) audio = await googleTts(text);
      else
        try {
          audio = await edgeTts(text, rate);
          if (edgeDaBao) {
            edgeDaBao = false;
            console.log('[Giọng] Edge đã chạy lại');
          }
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          // 429 = Edge chặn tạm vì gọi dồn dập: nghỉ 60 giây, trong lúc đó dùng giọng Google
          edgeNghiDen = Date.now() + (msg.includes('429') ? 60_000 : 15_000);
          if (!edgeDaBao) {
            edgeDaBao = true;
            console.warn(`[Giọng] Edge lỗi (${msg}). Tạm dùng giọng Google ${msg.includes('429') ? 60 : 15} giây.`);
          }
          audio = await googleTts(text);
        }
      ttsCache.set(key, audio);
      if (ttsCache.size > 200) ttsCache.delete(ttsCache.keys().next().value!);
    }
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(audio);
  } catch (err) {
    console.error('TTS lỗi:', err);
    res.status(500).json({ error: 'TTS failed' });
  }
});

// ---------- API riêng của game: thêm bên dưới ----------

// ---------- Khởi động ----------
async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      // LIVE_MODE=1 (BAT-LIVE.bat): tắt tự tải lại, sửa code không làm trang stage reset giữa live
      // Live: tắt hẳn kênh tự tải lại (ws) để không đụng cổng 24678 của game khác đang chạy.
      // Lúc sửa code: dùng cổng riêng 24681 cho kênh tự tải lại, game khác giữ 24678, 24680.
      server:
        process.env.LIVE_MODE === '1'
          ? { middlewareMode: true, hmr: false, ws: false }
          : { middlewareMode: true, hmr: { port: 24681 } },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => res.sendFile(path.join(__dirname, 'dist', 'index.html')));
  }

  // Chỉ nghe trên máy này: API không có đăng nhập, người cùng Wi-Fi không được điều khiển giọng đọc
  app.listen(PORT, '127.0.0.1', () => {
    console.log(`Server chạy ở http://localhost:${PORT}  |  Link LIVE Studio: http://lvh.me:${PORT}/?view=stage`);
    // lần trước đang kết nối mà server bị tắt / bật lại: tự kết nối lại tài khoản đó
    if (wantUser) {
      console.log(`[TikTok] Tự kết nối lại @${wantUser} (lần trước đang kết nối)`);
      connectTikTok(wantUser).catch((err) => scheduleReconnect(`Chưa kết nối được (${err instanceof Error ? err.message : err})`));
    }
  });
}

start();
