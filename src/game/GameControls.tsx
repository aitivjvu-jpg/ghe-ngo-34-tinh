import { useEffect, useState } from 'react';
import { emitTest, sendControl } from '../live/page';
import { GAME } from './config';
import { TINH } from './tinh';

const HO = ['Minh', 'Lan', 'Tuấn', 'Hoa', 'Long', 'Thảo', 'Nam', 'Vy', 'Khánh', 'An', 'Bình', 'Trang', 'Hùng', 'My', 'Phúc', 'Ngân', 'Duy'];
// tỉnh hay gặp trên live miền Tây xếp trước để giả lập ra đội đông, đội ít
const HAY = ['can-tho', 'an-giang', 'vinh-long', 'ca-mau', 'dong-thap', 'hcm', 'tay-ninh', 'ha-noi', 'dong-nai', 'gia-lai', 'hue', 'hai-phong'];
const nguoiGia: { username: string; nickname: string }[] = [];

/** Giả lập n người gõ tên tỉnh (nhiều cách gõ: có dấu, không dấu, tên tỉnh cũ) */
function giaLapLen(n: number) {
  for (let i = 0; i < n; i++) {
    const id = Math.floor(Math.random() * 1_000_000);
    const tinh = Math.random() < 0.8 ? HAY[Math.floor(Math.random() ** 1.6 * HAY.length)] : TINH[Math.floor(Math.random() * TINH.length)].id;
    const t = TINH.find((x) => x.id === tinh)!;
    const cach = [t.ten, t.ten.toLowerCase(), ...(t.cu ?? []), ...(t.ten2 ?? [])];
    const p = { username: `khach${id}`, nickname: `${HO[id % HO.length]}_${id % 1000}` };
    nguoiGia.push(p);
    setTimeout(() => emitTest('chat', { ...p, comment: cach[Math.floor(Math.random() * cach.length)] }), Math.random() * 4000);
  }
}

/** Mọi người đã giả lập thả tim liên tục trong `giay` giây */
function giaLapTim(giay: number) {
  if (!nguoiGia.length) giaLapLen(12);
  const lan = giay * 4;
  for (let k = 0; k < lan; k++) {
    setTimeout(() => {
      for (let j = 0; j < 3; j++) {
        const p = nguoiGia[Math.floor(Math.random() * nguoiGia.length)];
        if (p) emitTest('like', { ...p, likeCount: 1 + Math.floor(Math.random() * 15) });
      }
    }, k * 250);
  }
}

function giaLapQua(giftName: string, diamondCount: number, repeatCount = 1) {
  if (!nguoiGia.length) giaLapLen(12);
  const p = nguoiGia[Math.floor(Math.random() * nguoiGia.length)];
  setTimeout(() => emitTest('gift', { ...p, giftName, giftId: 1, diamondCount, repeatCount }), 500);
}

/** Nút riêng của game trên trang điều khiển */
export function GameControls() {
  const btn = 'rounded-xl px-4 py-2 font-semibold';
  const [tieuDe, setTieuDe] = useState('');
  const [daLuu, setDaLuu] = useState('');
  useEffect(() => {
    fetch('/api/cai-dat')
      .then((r) => r.json())
      .then((c) => setTieuDe(c.tieuDe ?? ''))
      .catch(() => {});
  }, []);
  const luu = async () => {
    const r = await fetch('/api/cai-dat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tieuDe }) });
    setDaLuu(r.ok ? 'Đã lưu, màn hình đổi ngay' : 'Lưu không được');
  };
  return (
    <div className="space-y-3 rounded-2xl bg-white/5 p-4">
      <div className="font-bold text-amber-300">Ghe Ngo 34 Tỉnh</div>
      <label className="block text-sm text-white/70">
        Tên game trên đầu màn hình (tối đa 24 ký tự)
        <input
          className="w-full rounded-lg bg-black/40 px-3 py-2 text-white outline-none ring-1 ring-white/15 focus:ring-amber-400"
          value={tieuDe}
          maxLength={24}
          placeholder={GAME.tieuDeMacDinh}
          onChange={(e) => setTieuDe(e.target.value)}
        />
      </label>
      <div className="flex items-center gap-3">
        <button className={`${btn} bg-emerald-700 text-white`} onClick={luu}>💾 Lưu tên</button>
        <span className="text-sm text-white/60">{daLuu || 'Để trống là dùng tên mặc định'}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        <button className={`${btn} bg-amber-600 text-white`} onClick={() => sendControl('custom', 'vongmoi')}>▶ Vòng mới ngay</button>
        <button className={`${btn} bg-pink-700 text-white`} onClick={() => sendControl('custom', 'nuocrut')}>⏩ Tới nước rút</button>
      </div>
      <div className="text-sm text-white/60">Giả lập người xem (không cần live):</div>
      <div className="flex flex-wrap gap-2">
        <button className={`${btn} bg-white/10 text-white`} onClick={() => giaLapLen(10)}>10 người gõ tỉnh</button>
        <button className={`${btn} bg-white/10 text-white`} onClick={() => giaLapLen(60)}>60 người gõ tỉnh</button>
        <button className={`${btn} bg-white/10 text-white`} onClick={() => giaLapTim(20)}>Thả tim 20 giây</button>
        <button className={`${btn} bg-white/10 text-white`} onClick={() => giaLapQua('Hoa hồng', 1, 3)}>🌹 Rose ×3</button>
        <button className={`${btn} bg-white/10 text-white`} onClick={() => giaLapQua('Bó hoa', 30)}>💐 Bó hoa</button>
        <button className={`${btn} bg-white/10 text-white`} onClick={() => giaLapQua('Sư tử', 29999)}>🦁 Quà lớn</button>
      </div>
    </div>
  );
}
