import { useEffect, useState } from 'react';
import { useLiveEvents } from '../live/useLiveEvents';
import type { LiveStatus } from '../live/types';
import { voice, speakableName } from '../live/voice';
import { containsBanned } from '../live/bannedWords';
import { NameBatcher } from '../live/scoreboard';
import { GiftThanker, makePicker, OncePerPerson } from '../live/chatter';
import { IS_STAGE, MUTE } from '../live/page';
import { sfx } from './sfx';
import { GAME } from './config';
import { DuaGhe, type Ev, type View } from './dua';
import { SO_TINH } from './tinh';

const pick = makePicker();
const post = (url: string, body: unknown) =>
  fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).catch(() => undefined);

/**
 * Trang stage chạy game thật (DuaGhe) và gửi ảnh chụp lên server.
 * Trang điều khiển chỉ vẽ lại ảnh chụp đó, không tự chạy game.
 */
export function useGame() {
  const [status, setStatus] = useState<LiveStatus | null>(null);
  const [view, setView] = useState<View | null>(null);
  const [channelName, setChannelName] = useState(GAME.defaultChannelName);
  const [caiDatGoc, setCaiDat] = useState({ tieuDe: '' });
  const caiDat = { tieuDe: caiDatGoc.tieuDe || GAME.tieuDeMacDinh };
  const [room] = useState(() => new DuaGhe());
  if (import.meta.env.DEV) Object.assign(window as any, { __room: room, __sfx: sfx }); // để thử trong trình duyệt
  const [talk] = useState(() => ({
    greeter: new NameBatcher(
      GAME.greetEveryMs,
      GAME.namesPerGreeting,
      (names) => voice.say(GAME.greeting(joinNames(names))),
      () => voice.waiting >= 1,
    ),
    gifts: new GiftThanker(GAME.giftThanksCooldownMs, GAME.bigGiftCoins),
    follows: new OncePerPerson(),
    lenLuc: 0,
    binhLuc: 0,
  }));

  const safeName = (nickname: string, username: string) => (containsBanned(nickname) ? username : nickname);

  // Lời bình theo sự kiện của game. Câu quan trọng đi làn ưu tiên để lời chào không chen trước.
  const speak = (ev: Ev) => {
    const L = GAME.loi;
    const now = Date.now();
    switch (ev.t) {
      case 'chuyen': {
        voice.say(pick(L.chuyen)?.(ev.chang) ?? '', true);
        if (room.ghe.has(room.chang.nha)) voice.say(pick(L.sanNha)?.(ev.nha) ?? '', true);
        return;
      }
      case 'len':
        if (ev.tinhMoi) return voice.say(pick(L.tinhMoi)?.(ev.tinh) ?? '');
        // phòng đông: không đọc từng người, 1 câu mỗi 6 giây
        if (now - talk.lenLuc > 6000 && voice.waiting < 2) {
          talk.lenLuc = now;
          voice.say(pick(L.len)?.(speakableName(ev.name), ev.tinh) ?? '');
        }
        return;
      case 'lenCap':
        return voice.say(pick(L.lenCap)?.(ev.tinh, ev.cap) ?? '', true);
      case 'caChep':
        return voice.say(pick(L.caChep)?.(ev.tinh) ?? '', true);
      case 'vuMon':
        return voice.say(pick(L.vuMon)?.(ev.tinh) ?? '', true);
      case 'caChepTruot':
        return voice.say(pick(L.caChepTruot)?.(ev.tinh) ?? '');
      case 'sucRong':
        return voice.say(pick(L.sucRong)?.(ev.tinh) ?? '', true);
      case 'songHep':
        return voice.say(pick(L.songHep) ?? '', true);
      case 'senNo':
        return voice.say(pick(L.senNo) ?? '', true);
      case 'vuot':
        return voice.say(pick(L.vuot)?.(ev.tinh) ?? '', true);
      case 'daiChien':
        return voice.say(pick(L.daiChien)?.(ev.a, ev.b) ?? '');
      case 'nuocRut':
        return voice.say(pick(L.nuocRut)?.(ev.dau, String(ev.cach)) ?? '', true);
      case 'tiepSuc':
        return voice.say(pick(L.tiepSuc)?.(speakableName(ev.name), ev.tinh) ?? '');
      case 'ketQua': {
        voice.stop(); // bỏ lời bình cũ còn tồn, đọc kết quả ngay
        const nhat = ev.top[0];
        if (!nhat) return voice.say(L.khongAi, true);
        voice.say(pick(L.ketQua)?.(nhat.tinh, String(nhat.m)) ?? '', true);
        if (ev.lienTiep >= 2) voice.say(L.lienTiep(nhat.tinh, ev.lienTiep), true);
        return;
      }
      case 'thang':
        // ghi bảng vàng hôm nay (chỉ trang chính, tránh cộng 2 lần)
        if (voice.speaker)
          void post('/api/bang-vang', { tinh: ev.tinh })
            .then((r) => r?.json())
            .then((b) => b?.thang && (room.bang = b.thang));
        return;
      case 'sacPhong':
        return voice.say(L.sacPhong(speakableName(ev.name), ev.tinh, ev.nhip, ev.danhHieu), true);
      case 'chonSong':
        return voice.say(L.chonSong(ev.ten[0] ?? '', ev.ten[1] ?? '', ev.ten[2] ?? ''), true);
      case 'chotSong':
        return voice.say(L.chotSong(ev.chang), true);
      case 'qua': {
        if (!talk.gifts.shouldThank(ev.name, ev.coins, voice.waitingPriority)) return;
        const ten = speakableName(ev.name);
        return voice.say(ev.tinh ? pick(L.camQua)!(ten, ev.tinh, String(ev.giay)) : L.camQuaChuaGhe(ten), true);
      }
    }
  };

  // Bình luận chen vào lúc giọng rảnh giữa vòng đua
  const binh = (now: number) => {
    if (room.phase !== 'dua' || voice.busy || voice.quietForMs(now) < 6000 || now - talk.binhLuc < 12_000) return;
    talk.binhLuc = now;
    const v = room.view(now);
    const B = GAME.loi.binh;
    const [a, b] = v.ghe;
    const r = Math.random();
    let line: string | undefined;
    if (a && b && a.m - b.m < 15 && a.m > 20) line = pick(B.sat)?.(a.ten, b.ten);
    else if (a && r < 0.35) line = pick(B.dan)?.(a.ten, String(Math.round(a.m - (b?.m ?? 0))));
    else if (v.ghe.length >= 3 && r < 0.55) line = pick(B.cuoi)?.(v.ghe[v.ghe.length - 1].ten);
    else line = pick(B.moi)?.(String(SO_TINH - v.soDangDua));
    if (line) voice.say(line);
  };

  useLiveEvents({
    onStatus: setStatus,
    onGameState: (s) => !IS_STAGE && setView(s),
    onCaiDat: setCaiDat,

    onChat: (e) => {
      if (!IS_STAGE) return;
      room.chat({ id: e.username, name: safeName(e.nickname, e.username), avatar: e.avatar, comment: e.comment }, Date.now());
    },

    onGift: (e) => {
      if (!IS_STAGE) return;
      const name = safeName(e.nickname, e.username);
      room.qua({ id: e.username, name, gift: e.giftName, count: e.repeatCount, coins: e.diamondCount * e.repeatCount }, Date.now());
    },

    onMember: (e) => {
      if (!IS_STAGE) return;
      const spoken = speakableName(safeName(e.nickname, e.username));
      if (spoken !== 'bạn') talk.greeter.add(e.username, spoken);
    },

    // Tim = chèo
    onLike: (e) => {
      if (IS_STAGE) room.tim(e.username, e.likeCount, Date.now());
    },

    onFollow: (e) => {
      if (!IS_STAGE) return;
      if (talk.follows.first(e.username)) voice.say(GAME.thankFollow(speakableName(safeName(e.nickname, e.username))));
    },

    onControl: (c) => {
      if (c.action === 'setName' && c.text) setChannelName(c.text);
      if (!IS_STAGE) return;
      const now = Date.now();
      if (c.action === 'speak' && c.text) voice.say(c.text, true);
      if (c.action === 'setRate' && c.text) voice.rate = Number(c.text) || 1;
      if (c.action === 'reset') {
        voice.stop();
        room.xoaHet(now);
      }
      if (c.action === 'custom' && c.text === 'vongmoi') {
        voice.stop();
        room.vongMoi(now);
      }
      if (c.action === 'custom' && c.text === 'nuocrut') room.toiNuocRut(now);
    },
  });

  // Vòng chạy game trên trang stage
  useEffect(() => {
    if (!IS_STAGE) return;
    let lastPost = 0;
    let prev: View | null = null;
    fetch('/api/bang-vang')
      .then((r) => r.json())
      .then((b) => b?.thang && (room.bang = b.thang))
      .catch(() => {});
    [...GAME.loi.songHep, ...GAME.loi.senNo].forEach((t) => voice.prefetch(t));
    if (MUTE) sfx.volume = sfx.musicVolume = 0;
    sfx.loadFiles();
    const id = setInterval(() => {
      const now = Date.now();
      room.tick(now);
      room.lay().forEach(speak);
      binh(now);
      const v = room.view(now);
      setView(v);
      if (voice.speaker) sfx.watch(prev, v, voice.busy);
      else sfx.music('tat');
      prev = v;
      if (voice.speaker && now - lastPost >= 500) {
        lastPost = now;
        void post('/api/game/state', v);
      }
    }, 250);
    const share = setInterval(() => {
      const line = pick(GAME.shareLines);
      if (line) voice.say(line);
    }, GAME.shareReminderEveryMs);
    return () => {
      clearInterval(id);
      clearInterval(share);
    };
  }, []);

  return { status, channelName, view, caiDat };
}

export type GameState = ReturnType<typeof useGame>;

// ['An', 'Bình', 'Chi'] -> 'An, Bình và Chi'
function joinNames(names: string[]) {
  return names.length > 1 ? `${names.slice(0, -1).join(', ')} và ${names[names.length - 1]}` : names[0] ?? '';
}
