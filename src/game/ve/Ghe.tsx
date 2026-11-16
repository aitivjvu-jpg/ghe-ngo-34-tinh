/**
 * Ghe ngo nhìn từ trên xuống, mũi (đầu rồng) hướng lên trên. Vẽ bằng SVG, không cần ảnh.
 * cap 0 Ghe Ngo · 1 Ghe Rồng (đầu rồng + trống) · 2 Hào Quang (vầng sáng hồng) · 3 Rồng Vàng (thân vàng, sáng vàng)
 * Mái chèo đung đưa bằng CSS (.cheo-t / .cheo-p trong index.css), `nhip` = giây mỗi nhịp chèo.
 */
import { memo } from 'react';

interface Props {
  w: number;
  mau: { than: string; vien: string; nhat: string };
  cap: number;
  so: number; // số người trên ghe -> số hàng tay chèo
  nhip?: number;
  boc?: string; // id riêng cho gradient
}

const VANG = '#f5c542';

export const Ghe = memo(function Ghe({ w, mau, cap, so, nhip = 0.9, boc = 'g' }: Props) {
  const h = w * 4.6;
  const hang = Math.max(3, Math.min(11, Math.ceil(so / 2) + 2));
  const yDau = 120;
  const yCuoi = 395;
  const buoc = (yCuoi - yDau) / (hang - 1);
  const than = cap >= 3 ? `url(#vang-${boc})` : mau.than;
  const vien = cap >= 3 ? '#fff2b0' : VANG;
  return (
    <svg width={w} height={h} viewBox="0 0 100 460" style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={`vang-${boc}`} x1="0" x2="1">
          <stop offset="0" stopColor="#b8860b" />
          <stop offset="0.45" stopColor="#ffd75e" />
          <stop offset="1" stopColor="#b8860b" />
        </linearGradient>
        <radialGradient id={`hq-${boc}`}>
          <stop offset="0.55" stopColor={cap >= 3 ? '#ffe680' : '#ff5fb4'} stopOpacity="0.55" />
          <stop offset="1" stopColor={cap >= 3 ? '#ffe680' : '#ff5fb4'} stopOpacity="0" />
        </radialGradient>
      </defs>
      {cap >= 2 && <ellipse className="hao-quang" cx="50" cy="240" rx="95" ry="260" fill={`url(#hq-${boc})`} />}

      {/* mái chèo: dưới thân ghe */}
      {Array.from({ length: hang }, (_, i) => {
        const y = yDau + i * buoc;
        const tre = `${-(i % 3) * 0.12}s`;
        return (
          <g key={i}>
            <g className="cheo-t" style={{ animationDuration: `${nhip}s`, animationDelay: tre }}>
              <line x1="30" y1={y} x2="-6" y2={y + 12} stroke="#5a3a1a" strokeWidth="3.2" strokeLinecap="round" />
              <ellipse cx="-6" cy={y + 12} rx="5" ry="2.6" fill="#7a5226" />
            </g>
            <g className="cheo-p" style={{ animationDuration: `${nhip}s`, animationDelay: tre }}>
              <line x1="70" y1={y} x2="106" y2={y + 12} stroke="#5a3a1a" strokeWidth="3.2" strokeLinecap="round" />
              <ellipse cx="106" cy={y + 12} rx="5" ry="2.6" fill="#7a5226" />
            </g>
          </g>
        );
      })}

      {/* thân ghe */}
      <path
        d="M50 34 C78 64 86 140 86 250 C86 352 74 412 50 446 C26 412 14 352 14 250 C14 140 22 64 50 34 Z"
        fill={than}
        stroke={vien}
        strokeWidth="4"
      />
      <path d="M50 70 C70 96 74 160 74 250 C74 340 66 395 50 420 C34 395 26 340 26 250 C26 160 30 96 50 70 Z" fill="rgba(0,0,0,0.28)" />
      {/* hoa văn vảy rồng dọc mạn */}
      {Array.from({ length: 9 }, (_, i) => (
        <g key={i} fill="none" stroke={cap >= 3 ? '#fff7cf' : mau.vien} strokeWidth="1.6" opacity="0.8">
          <path d={`M17 ${120 + i * 32} q4 8 0 16`} />
          <path d={`M83 ${120 + i * 32} q-4 8 0 16`} />
        </g>
      ))}

      {/* tay chèo: nón lá + vai áo */}
      {Array.from({ length: hang }, (_, i) => {
        const y = yDau + i * buoc;
        return (
          <g key={i}>
            <ellipse cx="36" cy={y + 3} rx="9" ry="6" fill={i % 2 ? '#c0392b' : '#1f4e8c'} />
            <ellipse cx="64" cy={y + 3} rx="9" ry="6" fill={i % 2 ? '#1f4e8c' : '#c0392b'} />
            <circle cx="36" cy={y} r="7.5" fill="#f0dca0" stroke="#a88a4a" strokeWidth="1.2" />
            <circle cx="64" cy={y} r="7.5" fill="#f0dca0" stroke="#a88a4a" strokeWidth="1.2" />
            <circle cx="36" cy={y} r="2" fill="#a88a4a" />
            <circle cx="64" cy={y} r="2" fill="#a88a4a" />
          </g>
        );
      })}

      {/* trống giữa ghe */}
      {cap >= 1 && (
        <g>
          <circle cx="50" cy="96" r="12" fill="#b3261e" stroke={VANG} strokeWidth="2.5" />
          <circle cx="50" cy="96" r="5" fill={VANG} />
        </g>
      )}

      {/* mũi: đầu rồng (cấp 1+) hoặc mũi nhọn chạm trổ */}
      {cap >= 1 ? (
        <g>
          <path d="M50 46 C40 30 38 14 50 2 C62 14 60 30 50 46 Z" fill={cap >= 3 ? '#ffd75e' : '#d4a017'} stroke="#7a4b00" strokeWidth="2" />
          <path d="M50 4 C44 -8 40 -18 32 -22 M50 4 C56 -8 60 -18 68 -22" stroke="#7a4b00" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M38 22 l-10 -6 l8 10 M62 22 l10 -6 l-8 10 M40 34 l-12 0 l10 6 M60 34 l12 0 l-10 6" stroke={VANG} strokeWidth="2.2" fill="none" />
          <circle cx="44" cy="16" r="3" fill="#fff" />
          <circle cx="56" cy="16" r="3" fill="#fff" />
          <circle cx="44" cy="16" r="1.5" fill="#000" />
          <circle cx="56" cy="16" r="1.5" fill="#000" />
          <path d="M45 6 Q50 10 55 6" stroke="#b3261e" strokeWidth="2.5" fill="none" />
        </g>
      ) : (
        <path d="M50 18 L58 40 L50 34 L42 40 Z" fill={VANG} stroke="#7a4b00" strokeWidth="1.5" />
      )}

      {/* đuôi rồng */}
      <path
        d={cap >= 1 ? 'M50 444 C44 462 30 468 30 456 C30 448 40 452 42 458 M50 444 C56 462 70 468 70 456 C70 448 60 452 58 458' : 'M50 444 L50 458'}
        stroke={cap >= 3 ? '#ffd75e' : '#d4a017'}
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
});

/** Vệt nước sau đuôi ghe. `manh` 0-1: ghe càng nhanh vệt càng dài */
export function VetNuoc({ w, manh }: { w: number; manh: number }) {
  // bọt nước trắng mờ toả sau đuôi ghe, ghe càng nhanh càng dài
  const dai = w * (1.4 + manh * 2.2);
  return (
    <div
      className="vet-bot"
      style={{
        width: w * 1.6,
        height: dai,
        opacity: 0.25 + manh * 0.35,
        background: 'radial-gradient(ellipse 50% 100% at 50% 0%, rgba(255,255,255,0.9), rgba(255,255,255,0.35) 45%, rgba(255,255,255,0) 75%)',
      }}
    />
  );
}

// ---------- Ghe ảnh (Gemini vẽ, đã gỡ mái chèo) + mái chèo động ----------
// Ảnh public/assets/ghe/cap0-3.png cao 640, ngang 184-192; 10 hàng tay chèo cùng vị trí ở cả 4 kiểu ghe.
const HANG_CHEO = [0.255, 0.305, 0.355, 0.406, 0.458, 0.545, 0.598, 0.649, 0.701, 0.759];
const VB_W = 184;
const VB_H = 640;
const MEP = 38; // nửa bề ngang thân ghe (đơn vị ảnh)
const DAI = 64; // chiều dài mái chèo

// chỗ lấp lánh trên thân (tỉ lệ ngang, dọc), cấp càng cao càng nhiều
const LAP_LANH = [
  [0.42, 0.2], [0.6, 0.33], [0.38, 0.47], [0.62, 0.58], [0.45, 0.7], [0.58, 0.82], [0.5, 0.08], [0.35, 0.62],
];

export const GheAnh = memo(function GheAnh({ cap, w, h, nhip, nhanh }: { cap: number; w: number; h: number; nhip: number; nhanh: boolean }) {
  const c = Math.min(3, Math.max(0, cap));
  const cx = VB_W / 2;
  const nhipS = `${nhip}s`;
  const soSang = c === 0 ? 0 : c === 1 ? 3 : c === 2 ? 5 : 8;
  return (
    <div className="relative" style={{ width: w, height: h }}>
      {/* sóng mũi ghe */}
      <div className="song-mui" style={{ width: w * 1.3, height: h * 0.16, left: -w * 0.15, top: h * 0.02, animationDuration: nhipS }} />
      <svg className="absolute inset-0 overflow-visible" width={w} height={h} viewBox={`0 0 ${VB_W} ${VB_H}`} preserveAspectRatio="none">
        {HANG_CHEO.map((t, i) => {
          const y = t * VB_H;
          return (
            <g key={i}>
              {/* trái: gốc ở mép thân, đầu mái chèo hướng ra ngoài, hơi chếch về đuôi */}
              <g className="mc-t" style={{ transformOrigin: `${cx - MEP + 6}px ${y}px`, animationDuration: nhipS }}>
                <line x1={cx - MEP + 6} y1={y} x2={cx - MEP - DAI} y2={y + 16} stroke="#6b4423" strokeWidth="4.5" strokeLinecap="round" />
                <ellipse cx={cx - MEP - DAI} cy={y + 16} rx="10" ry="4.5" fill="#8a5a2b" stroke="#4a2e12" strokeWidth="1.5" transform={`rotate(13 ${cx - MEP - DAI} ${y + 16})`} />
                <circle className="te-nuoc" cx={cx - MEP - DAI - 4} cy={y + 18} r="11" style={{ animationDuration: nhipS }} />
              </g>
              <g className="mc-p" style={{ transformOrigin: `${cx + MEP - 6}px ${y}px`, animationDuration: nhipS }}>
                <line x1={cx + MEP - 6} y1={y} x2={cx + MEP + DAI} y2={y + 16} stroke="#6b4423" strokeWidth="4.5" strokeLinecap="round" />
                <ellipse cx={cx + MEP + DAI} cy={y + 16} rx="10" ry="4.5" fill="#8a5a2b" stroke="#4a2e12" strokeWidth="1.5" transform={`rotate(-13 ${cx + MEP + DAI} ${y + 16})`} />
                <circle className="te-nuoc" cx={cx + MEP + DAI + 4} cy={y + 18} r="11" style={{ animationDuration: nhipS }} />
              </g>
            </g>
          );
        })}
      </svg>
      <img
        src={`/assets/ghe/cap${c}.png`}
        alt=""
        className={`relative block ${c === 2 ? 'sang-hong' : c === 3 ? 'sang-vang' : ''}`}
        style={{ width: w, height: h, maxWidth: 'none' }}
      />
      {/* ánh kim lấp lánh */}
      {LAP_LANH.slice(0, soSang).map(([x, y], i) => (
        <span key={i} className="lap-lanh-sao" style={{ left: x * w, top: y * h, animationDelay: `${(i * 0.37) % 1.6}s` }}>
          ✦
        </span>
      ))}
      {/* bọt nước dọc hai mạn khi ghe lao nhanh */}
      {nhanh && (
        <>
          <div className="bot-man" style={{ left: -w * 0.1, top: h * 0.25, height: h * 0.6 }} />
          <div className="bot-man" style={{ right: -w * 0.1, top: h * 0.25, height: h * 0.6, animationDelay: '0.2s' }} />
        </>
      )}
    </div>
  );
});
