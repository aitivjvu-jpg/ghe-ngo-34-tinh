/**
 * Màn hình 1080x1920 đưa vào TikTok LIVE Studio. Vẽ theo View của lõi (dua.ts).
 * Bố cục từ trên xuống: tên game + đồng hồ + ô chặng · 3 bước chơi · dòng thông báo · bến chờ
 * · đường đua 6 làn · đoàn ghe đang đuổi · chân trang.
 */
import { useEffect, useState } from 'react';
import type { GameState } from './useGame';
import type { GheView, View } from './dua';
import { GAME } from './config';
import { mauTinh } from './tinh';
import { saoText } from './chang';
import { VetNuoc } from './ve/Ghe';
import { NenSong } from './ve/Song';

// tâm 6 làn: nằm gọn trong lòng sông (ảnh nền: bờ mỗi bên 170 px, nước 170-910)
const LAN_X = [232, 355, 478, 601, 724, 847];
const Y_DAU = 565; // mũi ghe dẫn đầu
const TAM = 420; // ghe càng xa càng lùi xuống, tối đa chừng này px (nhãn vẫn ghi đúng số mét)
// Ghe là ảnh Gemini vẽ (public/assets/ghe/cap0-3.png, đã tách nền): cao theo cấp, ngang = cao × tỉ lệ ảnh
const CAO_GHE = [250, 275, 295, 315];
const TI_LE_GHE = 0.29;
const anhGhe = (cap: number) => `/assets/ghe/cap${Math.min(3, Math.max(0, cap))}.png`;

const vien = (mau: string, d = 4) =>
  ({ textShadow: `0 ${d}px 0 #2a0d18, ${d}px 0 0 #2a0d18, -${d}px 0 0 #2a0d18, 0 -${d}px 0 #2a0d18, ${d}px ${d}px 0 #2a0d18, -${d}px ${d}px 0 #2a0d18, ${d}px -${d}px 0 #2a0d18, -${d}px -${d}px 0 #2a0d18, 0 ${d * 2}px 0 #0006`, color: mau }) as const;

export function GameStage({ game }: { game: GameState }) {
  const v = game.view;
  const [nhay, setNhay] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setNhay((x) => x + 1), 1500);
    return () => clearInterval(id);
  }, []);
  if (!v) return <div className="flex h-full items-center justify-center text-4xl text-white/60">Đang mở game…</div>;
  const dau = v.ghe[0];
  const kh = GAME.khauHieu[Math.floor(nhay / 4) % GAME.khauHieu.length](dau?.ten ?? '', v.soDangDua);
  const chinh = v.ghe.filter((g) => g.lan >= 0);
  const duoi = v.ghe.filter((g) => g.lan < 0).slice(0, GAME.soDuoi);
  const nghi = v.phase !== 'dua' && v.phase !== 'chuyen';

  return (
    <div className="relative h-full w-full overflow-hidden font-sans text-white">
      <NenSong changId={v.chang.id} nhanh={v.nuocRut} songHep={v.songHep} />
      {v.senNo && <SenNo />}
      {/* nền tối trên / dưới cho dễ đọc chữ */}
      <div className="absolute inset-x-0 top-0 h-[420px] bg-gradient-to-b from-[#071a1f] via-[#071a1fcc] to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-[470px] bg-gradient-to-t from-[#071a1f] via-[#071a1fd0] to-transparent" />

      {/* ---------- Đường đua ---------- */}
      {chinh.map((g) => (
        <GheChinh key={g.tinh} g={g} dauM={dau?.m ?? 0} nuocRut={v.nuocRut} />
      ))}
      {v.hoChe.map((h) => {
        const g = chinh.find((x) => x.tinh === h.tinh);
        if (!g) return null;
        return (
          <div key={h.id} className="ho-che absolute whitespace-nowrap rounded-2xl bg-white px-4 py-1 text-[26px] font-extrabold text-[#2a0d18] shadow-lg" style={{ left: g.lan >= 3 ? LAN_X[g.lan] - 200 : LAN_X[g.lan] + 34, top: yMui(g, dau?.m ?? 0) + 120 }}>
            {h.text}
          </div>
        );
      })}
      {v.timNguoi.map((h) => {
        const g = chinh.find((x) => x.tinh === h.tinh);
        if (!g) return null;
        return (
          <div key={h.id} className="tim-bay absolute whitespace-nowrap text-[24px] font-bold text-pink-200" style={{ left: LAN_X[g.lan] - 60, top: yMui(g, dau?.m ?? 0) + 220, ...vien('#ffd1e8', 2) }}>
            ♥ {h.name}
          </div>
        );
      })}
      {v.soDangDua === 0 && v.phase === 'dua' && (
        <div className="absolute inset-x-0 top-[700px] text-center">
          <div className="text-[110px] font-extrabold leading-none" style={vien('#5eead4', 6)}>GÕ TÊN TỈNH</div>
          <div className="mt-4 text-[38px] font-bold" style={vien('#fff', 3)}>để hạ thủy ghe quê bạn · rồi thả tim để chèo</div>
        </div>
      )}

      {/* ---------- Đoàn ghe đang đuổi ---------- */}
      {duoi.length > 0 && (
        <div className="absolute inset-x-0 top-[1450px] h-[400px]">
          <div className="flex justify-between px-10 text-[24px] font-bold">
            <span className="text-amber-200">còn {v.conLenSong} m lên sông</span>
            <span className="text-pink-300">ĐOÀN GHE ĐANG ĐUỔI · thả tim để lên sông</span>
          </div>
          <div className="mt-4 grid grid-cols-5 gap-y-3 px-6">
            {duoi.map((g) => (
              <div key={g.tinh} className="flex flex-col items-center">
                <div className={g.tangToc ? 'lap-lanh' : ''}>
                  <img src={anhGhe(g.cap)} width={110 * TI_LE_GHE} height={110} alt="" />
                </div>
                <div className="mt-1 whitespace-nowrap rounded-full border-2 bg-[#0b2530e6] px-3 text-[22px] font-bold" style={{ borderColor: mauTinh(g.tinh).vien }}>
                  {g.hang}. {g.ten}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---------- Đầu màn hình ---------- */}
      <div className="absolute left-10 top-12">
        <div className="flex items-baseline gap-4">
          <span className="text-[86px] font-extrabold leading-none tracking-tight" style={vien('#ffc93c', 5)}>{game.caiDat.tieuDe}</span>
          <span className="text-[40px] font-extrabold" style={vien('#fff', 3)}>{GAME.tieuDePhu}</span>
        </div>
        <div className="mt-3 max-w-[570px] truncate text-[27px] font-semibold text-pink-300">{kh}</div>
      </div>
      <div className={`absolute left-[620px] top-10 w-[210px] rounded-2xl border-[3px] bg-[#0b2530e6] py-2 text-center ${v.nuocRut ? 'border-pink-400' : nghi ? 'border-slate-400' : 'border-teal-300'}`}>
        <div className={`text-[20px] font-bold ${v.nuocRut ? 'text-pink-300' : 'text-teal-200'}`}>
          {v.phase === 'chuyen' ? 'XUẤT PHÁT' : nghi ? 'NGHỈ' : v.nuocRut ? 'NƯỚC RÚT · CÒN' : `VÒNG ${v.vong} · CÒN`}
        </div>
        <div className={`font-mono text-[66px] font-extrabold leading-none ${v.nuocRut && v.con <= 10 ? 'nhap-nhay-chu text-pink-300' : ''}`}>{mmss(v.con)}</div>
      </div>
      <div className="absolute left-[846px] top-10 w-[210px] rounded-2xl border-[3px] border-amber-400 bg-[#2a1a08e6] py-2 text-center">
        <div className="truncate px-2 text-[17px] font-bold text-amber-300">
          {v.chang.ten.toUpperCase()} {saoText(v.chang.sao)}
        </div>
        <div className="text-[50px] font-extrabold leading-tight">{v.phase === 'dua' && dau ? `+${v.dauCach} M` : '—'}</div>
        <div className="text-[16px] text-amber-100/80">{v.phase === 'dua' ? 'ghe đầu đang dẫn' : 'nghỉ giữa vòng'}</div>
      </div>

      {/* 3 bước chơi */}
      <div className="absolute left-8 right-8 top-[212px] flex gap-3">
        {[
          ['1', 'GÕ TÊN TỈNH', 'chỉ 1 lần', '#2dd4bf'],
          ['2', 'THẢ TIM', 'để chèo · +1m', '#fbbf24'],
          ['3', 'TẶNG QUÀ', 'ghe tăng tốc', '#f472b6'],
        ].map(([so, ten, phu, mau], i) => {
          const sang = nhay % 3 === i;
          return (
            <div
              key={so}
              className="flex flex-1 items-center gap-2 rounded-full border-[3px] px-3 py-1.5 transition-colors duration-500"
              style={{ borderColor: mau, background: sang ? mau : '#0b2530e6', color: sang ? '#1a0b10' : '#fff' }}
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full text-[22px] font-extrabold" style={{ background: sang ? '#1a0b10' : mau, color: sang ? mau : '#1a0b10' }}>
                {so}
              </span>
              <span className="text-[24px] font-extrabold">{ten}</span>
              <span className="truncate text-[17px] opacity-80">{phu}</span>
            </div>
          );
        })}
      </div>

      {/* dòng hiệu ứng + thông báo */}
      <div className="absolute inset-x-0 top-[282px] flex flex-col items-center gap-2">
        {v.pills.map((p) => (
          <div key={p} className="rounded-full border-2 border-amber-400 bg-[#3a2508ee] px-6 py-1 text-[24px] font-bold text-amber-200">
            {p}
          </div>
        ))}
        {v.daiChien && (
          <div className="w-[720px] rounded-full border-2 border-pink-400 bg-[#2a0d18ee] px-6 py-1 text-center text-[22px] font-extrabold text-pink-200">
            ĐẠI CHIẾN {v.daiChien.a.toUpperCase()} – {v.daiChien.b.toUpperCase()}
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/20">
              <div className="h-full rounded-full bg-pink-400" style={{ width: `${(v.daiChien.ma / (v.daiChien.ma + v.daiChien.mb)) * 100}%` }} />
            </div>
          </div>
        )}
        {v.ticker && !v.dauBox && (
          <div key={v.ticker.id} className="tha-xuong max-w-[1000px] truncate rounded-full border-2 border-white/30 bg-[#0b2530ee] px-6 py-1 text-[23px] font-semibold">
            {v.ticker.text}
          </div>
        )}
      </div>

      {/* bến chờ */}
      {v.benCho.length > 0 && !v.dauBox && (
        <div className="absolute left-8 right-8 top-[398px] flex items-center gap-2 overflow-hidden">
          <span className="shrink-0 rounded-full bg-amber-300 px-4 py-1 text-[22px] font-extrabold text-[#2a0d18]">BẾN CHỜ</span>
          {v.benCho.map((n) => (
            <span key={n} className="shrink-0 rounded-full border-2 border-teal-300/60 bg-[#0b2530e6] px-4 py-1 text-[22px] font-semibold">
              ⛵ {n}
            </span>
          ))}
        </div>
      )}
      {v.dauBox && (
        <div className="absolute left-1/2 top-[392px] -translate-x-1/2 rounded-2xl border-[3px] border-white/60 bg-[#0b2530ee] px-8 py-2 text-center">
          <div className="text-[44px] font-extrabold leading-tight">
            {v.dauBox.tinh.toUpperCase()} DẪN {v.dauBox.cach} M
          </div>
          <div className="text-[22px] text-amber-200">{v.dauBox.duoi} đang đuổi</div>
        </div>
      )}

      {/* thông báo lên ghe */}
      {v.toast && (
        <div key={v.toast.id} className="toast-vao absolute left-1/2 top-[560px] w-[860px] -translate-x-1/2 rounded-2xl border-[3px] bg-[#0b1d26f2] px-6 py-3 text-center" style={{ borderColor: mauTinh(v.toast.tinh).vien }}>
          <div className="truncate text-[40px] font-extrabold">{v.toast.text} ✓</div>
          <div className="text-[24px] text-white/80">Không cần gõ nữa · THẢ TIM ♥ để chèo</div>
        </div>
      )}

      {/* chữ lớn sự kiện */}
      {v.banner && (
        <div key={v.banner.id} className="banner-vao pointer-events-none absolute inset-x-0 top-[700px] text-center">
          <div className="px-6 text-[112px] font-extrabold leading-none" style={vien(MAU_BANNER[v.banner.mau], 7)}>{v.banner.tieuDe}</div>
          <div className="mx-auto mt-4 max-w-[980px] text-[36px] font-bold" style={vien('#fff', 3)}>{v.banner.phu}</div>
        </div>
      )}

      {v.quaLon && <QuaLon q={v.quaLon} />}
      {v.phase === 'chuyen' && <ManChuyen v={v} />}
      {v.ketQua && <KetQua v={v} />}
      {v.sacPhong && <SacPhong v={v} />}
      {v.chonSong && <ChonSong v={v} />}

      {/* chân trang */}
      <div className="absolute inset-x-8 bottom-6 flex justify-between text-[22px] font-semibold">
        <span className="rounded-full bg-black/50 px-4 py-1">
          <span className="text-red-500">●</span> TRỰC TIẾP · {gioNay()}
        </span>
        <span className="rounded-full bg-black/50 px-4 py-1 text-white/80">Giọng bình luận do AI tạo</span>
      </div>
    </div>
  );
}

const MAU_BANNER = { vang: '#ffd54a', hong: '#ff6fb5', xanh: '#7ef0d8', trang: '#f4f4f4', do: '#ff5a4f' } as const;

// Cách ghe đầu 50 m lùi ~100 px, 200 m lùi ~280 px, xa hơn nữa thì dồn sát đáy đường đua
function yMui(g: GheView, dauM: number) {
  return Y_DAU + TAM * (1 - Math.exp(-(dauM - g.m) / 180));
}

function GheChinh({ g, dauM, nuocRut }: { g: GheView; dauM: number; nuocRut: boolean }) {
  const h = CAO_GHE[g.cap] ?? 250;
  const w = h * TI_LE_GHE;
  const x = LAN_X[g.lan];
  const y = yMui(g, dauM);
  const mau = mauTinh(g.tinh);
  const manh = g.tangToc ? 1 : nuocRut ? 0.6 : 0.3;
  return (
    <div className="absolute" style={{ left: x - w / 2, top: y, width: w, transition: 'top 0.3s linear' }}>
      {/* nhãn mét trên mũi */}
      <div className="absolute -top-[46px] left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#0b2530dd] px-3 text-[22px] font-extrabold">
        {g.hang === 1 || Math.round(dauM - g.m) === 0 ? `${Math.round(g.m)} m` : `-${Math.round(dauM - g.m)} m`}
      </div>
      {g.sucRong && <div className="suc-rong absolute -inset-x-6 -inset-y-4 rounded-full" />}
      <div className="absolute left-1/2 -translate-x-1/2" style={{ top: h - 10 }}>
        <VetNuoc w={w} manh={manh} />
      </div>
      {g.tangToc && (
        <div className="absolute -left-10 top-10 text-[34px] leading-none">
          <span className="tang-toc">💨</span>
        </div>
      )}
      {/* lượn theo dòng sông: mỗi làn lệch nhịp nhau */}
      <div className="luon" style={{ animationDuration: `${nuocRut || g.tangToc ? 2.2 : 3.4}s`, animationDelay: `${-g.lan * 0.7}s` }}>
        <img
          src={anhGhe(g.cap)}
          width={w}
          height={h}
          alt=""
          className={`nhip-cheo ${g.cap === 2 ? 'sang-hong' : g.cap === 3 ? 'sang-vang' : ''}`}
          style={{ animationDuration: `${g.tangToc ? 0.45 : nuocRut ? 0.6 : 0.95}s` }}
        />
      </div>
      {g.caChep && (
        <div className="absolute left-1/2 top-[30%] -translate-x-1/2 text-center">
          <div className="ca-chep-vong mx-auto h-[150px] w-[150px] rounded-full border-[6px] border-dashed border-amber-300" />
          <div className="absolute left-1/2 top-[38px] -translate-x-1/2 text-[60px]">🐟</div>
          <div className="mt-2 whitespace-nowrap rounded-full bg-amber-400 px-4 text-[22px] font-extrabold text-[#2a0d18]">
            CÁ CHÉP {g.caChep.co}/{g.caChep.can} ♥ · {g.caChep.con}s
          </div>
        </div>
      )}
      {/* cờ đuôi + bảng tên */}
      <div className="absolute left-1/2 -translate-x-1/2 text-center" style={{ top: h + 8 }}>
        <div className="mx-auto w-fit whitespace-nowrap rounded-md px-2 text-[18px] font-extrabold text-[#1a0b10]" style={{ background: mau.vien }}>
          {g.ngan} · 🛶{g.so}
          {g.sanNha ? ' 🏠' : ''}
        </div>
        <div className="mt-1 max-w-[124px] truncate whitespace-nowrap rounded-full border-2 bg-[#0b2530ee] px-2 text-[18px] font-bold" style={{ borderColor: mau.vien }}>
          {g.hang}. {g.ten}
        </div>
      </div>
    </div>
  );
}

function SenNo() {
  return (
    <div className="pointer-events-none absolute inset-0">
      {Array.from({ length: 14 }, (_, i) => (
        <div key={i} className="sen-roi absolute text-[54px]" style={{ left: 60 + ((i * 151) % 960), animationDelay: `${(i % 7) * 0.6}s` }}>
          🪷
        </div>
      ))}
    </div>
  );
}

function QuaLon({ q }: { q: NonNullable<View['quaLon']> }) {
  return (
    <div key={q.id} className="qua-lon pointer-events-none absolute inset-x-0 top-[1080px] text-center">
      <div className="text-[200px] leading-none">💐</div>
      <div className="mt-2 text-[40px] font-extrabold" style={vien('#ffd54a', 3)}>
        {q.name} tặng {q.gift}
        {q.count > 1 ? ` ×${q.count}` : ''}
      </div>
    </div>
  );
}

function ManChuyen({ v }: { v: View }) {
  return (
    <div className="boc-vao absolute inset-0 flex flex-col items-center justify-center bg-[#071a1fb8]">
      <div className="text-[34px] font-bold tracking-[0.3em] text-teal-200">VÒNG {v.vong} · CHẶNG ĐUA</div>
      <div className="mt-4 px-10 text-center text-[100px] font-extrabold leading-tight" style={vien('#fff', 6)}>{v.chang.ten.toUpperCase()}</div>
      <div className="mt-4 text-[54px] text-amber-300">{saoText(v.chang.sao)}</div>
      <div className="mt-4 rounded-full bg-amber-400 px-8 py-2 text-[32px] font-extrabold text-[#2a0d18]">🏠 Sân nhà {v.chang.nha} · chèo nhanh hơn 10%</div>
      <div className="mt-10 text-[64px] font-extrabold" style={vien('#ff6fb5', 4)}>{v.con > 0 ? v.con : 'CHÈO!'}</div>
    </div>
  );
}

function Khung({ children }: { children: React.ReactNode }) {
  return <div className="boc-vao absolute inset-x-10 top-[380px] rounded-[36px] border-[3px] border-white/20 bg-[#0b1d26f4] px-10 py-10 text-center shadow-2xl">{children}</div>;
}

function KetQua({ v }: { v: View }) {
  const k = v.ketQua!;
  const nhat = k.top[0];
  return (
    <Khung>
      <div className="text-[34px] font-extrabold tracking-wider text-emerald-300">KẾT QUẢ VÒNG {v.vong}</div>
      {nhat ? (
        <>
          <div className="mt-2 text-[70px]">👑</div>
          <div className="text-[110px] font-extrabold leading-none" style={vien('#ffd54a', 6)}>{nhat.ten.toUpperCase()}</div>
          <div className="mt-3 text-[32px] font-bold text-amber-200">
            {k.lienTiep >= 2 ? `Vua sông nước · thắng ${k.lienTiep} vòng liền` : `Về nhất chặng ${v.chang.ten}`}
          </div>
          <div className="mx-auto mt-6 w-[640px] space-y-2 text-left text-[38px] font-bold">
            {k.top.map((t, i) => (
              <div key={t.tinh} className="flex justify-between rounded-xl bg-white/5 px-6 py-1">
                <span>
                  {i + 1}. {t.ten}
                </span>
                <span className="text-amber-200">{t.m} m</span>
              </div>
            ))}
          </div>
          <div className="mt-6 text-[30px] font-bold text-pink-300">Tỉnh nào dám cản? Vòng sau sẽ rõ!</div>
        </>
      ) : (
        <div className="mt-8 text-[44px] font-bold">Chưa có ghe nào hạ thủy. Gõ tên tỉnh để vào đua!</div>
      )}
      {k.bang.length > 0 && (
        <div className="mt-4 text-[26px] text-white/80">Bảng vàng hôm nay: {k.bang.map((b) => `${b.ten} ${b.n}`).join(' · ')}</div>
      )}
    </Khung>
  );
}

function SacPhong({ v }: { v: View }) {
  const s = v.sacPhong!;
  return (
    <div className="boc-vao absolute inset-x-16 top-[400px]">
      <div className="mx-auto h-6 w-[96%] rounded-full bg-[#7a4b1a]" />
      <div className="relative -my-2 border-[10px] border-double border-[#b3261e] bg-[#f6e7c1] px-10 py-10 text-center text-[#3b1d0a] shadow-2xl">
        <div className="text-[76px] font-extrabold text-[#b3261e]">SẮC PHONG</div>
        <div className="text-[30px] font-semibold">Tay chèo xuất sắc nhất vòng</div>
        <div className="mt-4 flex items-center justify-center gap-4">
          {s.avatar && <img src={s.avatar} className="h-24 w-24 rounded-full border-4 border-[#b3261e]" alt="" />}
          <div className="max-w-[640px] truncate text-[88px] font-extrabold text-[#7a1010]">{s.name}</div>
        </div>
        <div className="mt-2 text-[34px]">
          danh hiệu <b>{s.danhHieu}</b>
        </div>
        <div className="mt-2 text-[30px] font-bold">
          Đội {s.tinh} · Vòng {v.vong} · {s.nhip} nhịp chèo
        </div>
        {s.top.length > 1 && (
          <div className="mt-4 text-[24px] opacity-80">
            {s.top.slice(1).map((t, i) => `${i + 2}. ${t.name} (${t.tinh}) ${t.nhip}`).join('   ·   ')}
          </div>
        )}
        <div className="absolute bottom-6 right-8 rotate-[-8deg] rounded border-4 border-[#b3261e] px-3 py-1 text-[26px] font-extrabold leading-tight text-[#b3261e]">
          ĐUA
          <br />
          GHE
        </div>
      </div>
      <div className="mx-auto h-6 w-[96%] rounded-full bg-[#7a4b1a]" />
    </div>
  );
}

function ChonSong({ v }: { v: View }) {
  const c = v.chonSong!;
  return (
    <Khung>
      <div className="text-[64px] font-extrabold" style={vien('#ffd54a', 4)}>CHỌN SÔNG VÒNG SAU</div>
      <div className="mt-2 text-[28px] text-white/80">Gõ tên sông để chọn · khóa sau {c.con} giây</div>
      <div className="mt-8 space-y-5">
        {c.ds.map((d) => (
          <div key={d.id} className="flex items-center justify-between rounded-2xl border-[3px] border-white/30 bg-[#12303c] px-8 py-4 text-left">
            <div>
              <div className="text-[42px] font-extrabold">{d.ten}</div>
              <div className="text-[22px] text-white/70">
                {d.mo} · gõ “{d.goi}”
              </div>
            </div>
            <div className="text-[48px] font-extrabold text-amber-300">{d.phieu} LƯỢT</div>
          </div>
        ))}
      </div>
      <div className="mt-6 text-[24px] text-white/60">{v.chang.ten} vừa đua · nghỉ {GAME.changNghi} vòng</div>
    </Khung>
  );
}

function mmss(s: number) {
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

function gioNay() {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())} ${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`;
}
