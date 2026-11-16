/**
 * Mặt sông + cảnh 2 bên bờ theo từng chặng, vẽ bằng SVG. Một "tấm" cao 960 px lặp 2 lần và trôi xuống
 * (ghe trông như đang lao lên). Nước rút thì trôi nhanh hơn. Khúc sông hẹp: 2 dải bờ lấn vào giữa.
 * Có ảnh public/assets/song/<id chặng>.jpg (1080x960) thì dùng ảnh: các tấm lật ngược xen kẽ
 * (thường, lật, thường, lật) nên chỗ nối luôn khớp, không lộ đường cắt. Chưa có ảnh thì vẽ bằng SVG.
 * Ảnh hiện tại do Gemini vẽ (16/11/2026), đã xoá dấu ngôi sao góc phải dưới.
 */
import { memo, type ReactNode } from 'react';
import { CHANG_BY_ID, type Chang } from '../chang';

const W = 1080;
const T = 960; // chiều cao 1 tấm
// chặng nào đã có ảnh trong public/assets/song/
const CO_ANH = new Set(['cai-rang', 'thap-muoi', 'tra-su', 'co-chien', 'dat-mui', 'trang-an', 'song-huong', 'song-han', 'ha-long', 'song-sai-gon']);

// số ngẫu nhiên cố định theo hạt giống: cảnh không nhảy lung tung mỗi lần vẽ lại
function prng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export const NenSong = memo(function NenSong({ changId, nhanh, songHep }: { changId: string; nhanh: boolean; songHep: boolean }) {
  const c = CHANG_BY_ID.get(changId)!;
  const anh = CO_ANH.has(c.id);
  const bo = c.kieu === 'vinh' ? '#2f5a4a' : c.bo[1];
  // ảnh: 4 tấm thường/lật, trôi 2 tấm mỗi vòng lặp; SVG: 3 tấm giống nhau, trôi 1 tấm
  const so = anh ? 4 : 3;
  const tam = (i: number) =>
    anh ? (
      <img src={`/assets/song/${c.id}.jpg`} width={W} height={T} alt="" style={{ display: 'block', transform: i % 2 ? 'scaleY(-1)' : undefined }} />
    ) : (
      <Tam c={c} />
    );
  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: c.nuoc[1] }}>
      <div
        className={`${anh ? 'song-chay-anh' : 'song-chay'} absolute left-0 top-0`}
        style={{ width: W, height: T * so, animationDuration: anh ? (nhanh ? '6.4s' : '14s') : nhanh ? '3.2s' : '7s' }}
      >
        {Array.from({ length: so }, (_, i) => (
          <div key={i} style={{ height: T }}>
            {tam(i)}
          </div>
        ))}
      </div>
      {/* khúc sông hẹp: bờ lấn vào */}
      <div className="bo-lan absolute bottom-0 top-0 left-0" style={{ width: songHep ? 195 : 0, background: boLan(bo, c.bo[0], 90) }} />
      <div className="bo-lan absolute bottom-0 top-0 right-0" style={{ width: songHep ? 195 : 0, background: boLan(bo, c.bo[0], 270) }} />
    </div>
  );
});

// dải bờ lấn vào lúc Khúc sông hẹp: cỏ lau sọc, mép đất, bóng đổ xuống nước
function boLan(co: string, dat: string, huong: number) {
  return [
    `linear-gradient(${huong}deg, transparent 78%, ${dat} 80%, ${dat} 90%, rgba(0,0,0,0.35) 100%)`,
    `repeating-linear-gradient(${huong === 90 ? 165 : 15}deg, rgba(255,255,255,0.08) 0 6px, transparent 6px 22px)`,
    `repeating-linear-gradient(${huong === 90 ? 20 : 160}deg, rgba(0,0,0,0.12) 0 4px, transparent 4px 17px)`,
    co,
  ].join(', ');
}

function Tam({ c }: { c: Chang }) {
  const r = prng(c.id.length * 7919 + c.id.charCodeAt(0) * 31);
  const gonSong: ReactNode[] = [];
  for (let i = 0; i < 46; i++) {
    const x = 160 + r() * 760;
    const y = r() * T;
    const d = 30 + r() * 50;
    gonSong.push(<path key={i} d={`M${x} ${y} q${d / 2} -8 ${d} 0`} stroke="#fff" strokeOpacity={0.12 + r() * 0.12} strokeWidth="3" fill="none" />);
  }
  const coBo = c.kieu !== 'vinh';
  return (
    <svg width={W} height={T} viewBox={`0 0 ${W} ${T}`} style={{ display: 'block' }}>
      <defs>
        <linearGradient id={`nuoc-${c.id}`} x1="0" x2="1">
          <stop offset="0" stopColor={c.nuoc[1]} />
          <stop offset="0.5" stopColor={c.nuoc[0]} />
          <stop offset="1" stopColor={c.nuoc[1]} />
        </linearGradient>
      </defs>
      <rect width={W} height={T} fill={`url(#nuoc-${c.id})`} />
      {gonSong}
      {coBo && <Bo c={c} />}
      <Canh c={c} r={r} />
    </svg>
  );
}

/** Hai bờ đất lượn sóng, nối đầu đuôi tấm */
function Bo({ c }: { c: Chang }) {
  const song = (x0: number, dir: 1 | -1) => {
    let d = `M${dir === 1 ? 0 : W} 0 L${x0} 0`;
    for (let y = 0; y <= T; y += 120) d += ` Q${x0 + dir * (y % 240 === 0 ? 22 : -18)} ${y + 60} ${x0} ${y + 120}`;
    return `${d} L${dir === 1 ? 0 : W} ${T + 120} Z`;
  };
  const rong = c.kieu === 'thanh-pho' || c.kieu === 'kinh-thanh' ? 150 : 128;
  return (
    <g>
      <path d={song(rong + 10, 1)} fill={c.bo[0]} />
      <path d={song(rong, 1)} fill={c.bo[1]} />
      <path d={song(W - rong - 10, -1)} fill={c.bo[0]} />
      <path d={song(W - rong, -1)} fill={c.bo[1]} />
    </g>
  );
}

function Canh({ c, r }: { c: Chang; r: () => number }) {
  const out: ReactNode[] = [];
  let lop = 0;
  const hai = (fn: (x: number, y: number, trai: boolean, i: number) => ReactNode, n: number, xa: number, xb: number) => {
    lop++;
    for (let i = 0; i < n; i++) {
      const y = (i + 0.5) * (T / n) + (r() - 0.5) * 40;
      out.push(<g key={`t${lop}-${i}`}>{fn(xa + r() * (xb - xa), y, true, i)}</g>);
      out.push(<g key={`p${lop}-${i}`}>{fn(W - xa - r() * (xb - xa), y + 50, false, i)}</g>);
    }
  };
  switch (c.kieu) {
    case 'cho-noi':
      hai((x, y) => <NhaSan x={x} y={y} />, 4, 20, 60);
      hai((x, y, trai) => <XuongTraiCay x={x} y={y} trai={trai} hue={Math.floor(r() * 4)} />, 5, 170, 240);
      break;
    case 'sen':
      hai((x, y) => <LaSen x={x} y={y} s={0.8 + r() * 0.6} hoa={r() < 0.5} />, 9, 120, 270);
      hai((x, y) => <LaSen x={x} y={y} s={0.7 + r() * 0.4} hoa={r() < 0.7} />, 6, 20, 90);
      break;
    case 'tram':
      hai((x, y) => <CayTram x={x} y={y} />, 7, 20, 100);
      hai((x, y) => <BeoTam x={x} y={y} />, 6, 150, 280);
      break;
    case 'dua':
      hai((x, y, trai) => <CayDua x={x} y={y} trai={trai} />, 5, 20, 80);
      hai((x, y, trai) => <XuongTraiCay x={x} y={y} trai={trai} hue={0} />, 2, 170, 220);
      break;
    case 'duoc':
      hai((x, y) => <CayDuoc x={x} y={y} />, 8, 40, 140);
      break;
    case 'nui-da':
      hai((x, y) => <NuiDa x={x} y={y} s={0.9 + r() * 0.5} />, 4, 10, 70);
      hai((x, y, trai) => <XuongTraiCay x={x} y={y} trai={trai} hue={3} />, 2, 170, 230);
      break;
    case 'vinh':
      hai((x, y) => <NuiDa x={x} y={y} s={0.7 + r() * 0.9} dao />, 5, 20, 160);
      break;
    case 'kinh-thanh':
      hai((x, y, trai) => <TuongThanh x={trai ? 0 : W - 150} y={y} />, 4, 0, 0);
      out.push(<ThapChua key="thap" x={70} y={380} />);
      hai((x, y) => <TanCay x={x} y={y} />, 3, 30, 110);
      break;
    case 'thanh-pho':
      hai((x, y) => <ToaNha x={x - 50} y={y} h={r()} />, 5, 20, 60);
      hai((x, y) => <TanCay x={x} y={y + 90} />, 5, 110, 140);
      break;
  }
  return <g>{out}</g>;
}

// ---------- Từng món cảnh ----------

function NhaSan({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="0" y="0" width="90" height="70" fill="#8b5a2b" stroke="#4a2e12" strokeWidth="3" />
      <path d="M-8 0 L45 -30 L98 0 Z" fill="#b5651d" stroke="#4a2e12" strokeWidth="3" />
      <path d="M45 -30 L45 70" stroke="#4a2e12" strokeWidth="2" />
      <rect x="30" y="30" width="22" height="26" fill="#3b2410" />
    </g>
  );
}

const MAU_TRAI = ['#f4a300', '#e8452c', '#7cb342', '#ffd54f'];
function XuongTraiCay({ x, y, trai, hue }: { x: number; y: number; trai: boolean; hue: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${trai ? -8 : 8})`}>
      <path d="M-26 -60 Q0 -78 26 -60 L22 60 Q0 76 -22 60 Z" fill="#6d4321" stroke="#3b220c" strokeWidth="3" />
      <rect x="-18" y="-40" width="36" height="34" rx="6" fill="#c9a96b" stroke="#7a5a2a" strokeWidth="2" />
      {Array.from({ length: 7 }, (_, i) => (
        <circle key={i} cx={-12 + (i % 3) * 12} cy={4 + Math.floor(i / 3) * 12} r="6.5" fill={MAU_TRAI[(hue + i) % 4]} stroke="#0003" />
      ))}
      <circle cx="0" cy="-23" r="8" fill="#e9d38a" stroke="#a88a4a" />
    </g>
  );
}

function LaSen({ x, y, s, hoa }: { x: number; y: number; s: number; hoa: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M0 0 L30 -6 A30 30 0 1 1 30 6 Z" fill="#4c9a3a" stroke="#2f6b25" strokeWidth="2" />
      <path d="M0 0 L-24 0 M0 0 L-14 -20 M0 0 L-14 20 M0 0 L10 -26 M0 0 L10 26" stroke="#7cc46a" strokeWidth="1.5" />
      {hoa && (
        <g transform="translate(26 -26)">
          {[0, 60, 120, 180, 240, 300].map((a) => (
            <ellipse key={a} cx="0" cy="-10" rx="7" ry="12" fill="#f6a5c8" stroke="#d76a9b" transform={`rotate(${a})`} />
          ))}
          <circle r="6" fill="#ffd54f" />
        </g>
      )}
    </g>
  );
}

function CayTram({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle cx="0" cy="0" r="38" fill="#3d7d33" />
      <circle cx="-14" cy="-10" r="22" fill="#5fa04a" />
      <circle cx="16" cy="8" r="18" fill="#76b85d" />
      <circle cx="0" cy="0" r="4" fill="#d8d2c0" />
    </g>
  );
}

function BeoTam({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`} fill="#9ccc65" opacity="0.85">
      {Array.from({ length: 14 }, (_, i) => (
        <circle key={i} cx={Math.cos(i * 2.4) * (8 + i * 3)} cy={Math.sin(i * 2.4) * (6 + i * 2)} r={4 + (i % 3)} />
      ))}
    </g>
  );
}

function CayDua({ x, y, trai }: { x: number; y: number; trai: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${trai ? 1 : -1} 1)`}>
      {[0, 50, 100, 150, 200, 250, 300].map((a) => (
        <path key={a} d="M0 0 Q30 -10 62 6" stroke="#2e7d32" strokeWidth="9" fill="none" strokeLinecap="round" transform={`rotate(${a})`} />
      ))}
      {[25, 75, 125, 175, 225, 275, 325].map((a) => (
        <path key={a} d="M0 0 Q24 -6 46 4" stroke="#66bb6a" strokeWidth="5" fill="none" strokeLinecap="round" transform={`rotate(${a})`} />
      ))}
      <circle r="9" fill="#795548" />
      <circle cx="6" cy="4" r="5" fill="#8d6e63" />
    </g>
  );
}

function CayDuoc({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {[-30, -15, 0, 15, 30].map((dx) => (
        <path key={dx} d={`M${dx} 10 Q${dx * 1.6} 34 ${dx * 2} 44`} stroke="#5d4037" strokeWidth="4" fill="none" />
      ))}
      <circle cx="0" cy="-6" r="40" fill="#2e5d2a" />
      <circle cx="-16" cy="-16" r="22" fill="#3f7a35" />
      <circle cx="18" cy="-2" r="20" fill="#356b2f" />
    </g>
  );
}

function NuiDa({ x, y, s, dao }: { x: number; y: number; s: number; dao?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {dao && <ellipse cx="0" cy="10" rx="80" ry="64" fill="#fff" opacity="0.12" />}
      <path d="M-60 40 Q-70 -20 -30 -60 Q0 -90 30 -60 Q72 -20 60 40 Q0 64 -60 40 Z" fill="#6b7d6a" stroke="#3f4d3e" strokeWidth="3" />
      <path d="M-34 -30 Q-10 -70 20 -40 Q36 -16 30 20" fill="#7f9a6e" />
      <circle cx="-20" cy="-20" r="14" fill="#4f7a3f" />
      <circle cx="18" cy="6" r="12" fill="#4f7a3f" />
    </g>
  );
}

function TuongThanh({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y - 80})`}>
      <rect x="0" y="0" width="150" height="230" fill="#9c5b3a" />
      {Array.from({ length: 8 }, (_, i) => (
        <rect key={i} x={x === 0 ? 132 : 0} y={i * 30} width="18" height="18" fill="#7a3f24" />
      ))}
      {Array.from({ length: 10 }, (_, i) => (
        <line key={i} x1="0" x2="150" y1={i * 24} y2={i * 24} stroke="#7a3f24" strokeWidth="2" />
      ))}
    </g>
  );
}

function ThapChua({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <rect key={i} x={-46 + i * 6} y={-46 + i * 6} width={92 - i * 12} height={92 - i * 12} fill={i % 2 ? '#f3e2b3' : '#c9a24a'} stroke="#7a5a1a" strokeWidth="2" />
      ))}
      <circle r="6" fill="#b3261e" />
    </g>
  );
}

function TanCay({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r="30" fill="#2f6b2a" />
      <circle cx="-10" cy="-8" r="16" fill="#4f8f3f" />
    </g>
  );
}

const MAI = ['#c75b39', '#4a6fa5', '#d9a441', '#8a8f98', '#6c8e6b'];
function ToaNha({ x, y, h }: { x: number; y: number; h: number }) {
  const w = 110;
  const d = 90 + h * 70;
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="8" y="8" width={w} height={d} fill="#0004" />
      <rect x="0" y="0" width={w} height={d} fill={MAI[Math.floor(h * 5)]} stroke="#333" strokeWidth="2" />
      <rect x="14" y="14" width={w - 28} height={d - 28} fill="none" stroke="#fff6" strokeWidth="2" />
      <rect x={w / 2 - 12} y={d / 2 - 12} width="24" height="24" fill="#fff4" />
    </g>
  );
}
