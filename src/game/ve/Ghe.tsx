/**
 * Ghe trên đường đua: ảnh Gemini vẽ (public/assets/ghe/cap0-3.png, đã tách nền và gỡ mái chèo)
 * + mái chèo SVG quạt theo nhịp, nước bắn, sóng mũi, lấp lánh. Và vệt bọt sau đuôi.
 */
import { memo } from 'react';

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
    </div>
  );
});
