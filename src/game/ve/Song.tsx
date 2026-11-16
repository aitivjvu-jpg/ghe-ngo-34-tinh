/**
 * Nền sông từng chặng: ảnh public/assets/song/<id chặng>.jpg (1080x960, Gemini vẽ, đã nới mặt nước).
 * 4 tấm xếp dọc, lật ngược xen kẽ (thường, lật, thường, lật) nên chỗ nối luôn khớp, trôi xuống 2 tấm
 * mỗi vòng lặp: ghe trông như đang lao lên. Nước rút thì trôi nhanh hơn.
 * Khúc sông hẹp: 2 dải bờ thật (public/assets/bo/<id>-trai.jpg / -phai.jpg, cắt từ ảnh gốc của chặng)
 * trượt vào từ 2 mép, trôi cùng nhịp với mặt sông.
 */
import { memo } from 'react';
import { CHANG_BY_ID } from '../chang';

const W = 1080;
const T = 960; // chiều cao 1 tấm
const BO = 205; // bề ngang dải bờ lấn

function Cot({ src, rong, nhanh }: { src: string; rong: number; nhanh: boolean }) {
  return (
    <div className="song-chay-anh absolute left-0 top-0" style={{ width: rong, height: T * 4, animationDuration: nhanh ? '6.4s' : '14s' }}>
      {[0, 1, 2, 3].map((i) => (
        <img key={i} src={src} alt="" style={{ display: 'block', width: rong, height: T, maxWidth: 'none', transform: i % 2 ? 'scaleY(-1)' : undefined }} />
      ))}
    </div>
  );
}

export const NenSong = memo(function NenSong({ changId, nhanh, songHep }: { changId: string; nhanh: boolean; songHep: boolean }) {
  const c = CHANG_BY_ID.get(changId)!;
  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: c.nuoc[1] }}>
      <Cot src={`/assets/song/${c.id}.jpg`} rong={W} nhanh={nhanh} />
      {/* khúc sông hẹp: bờ thật lấn vào từ 2 mép */}
      <div className="bo-lan absolute bottom-0 left-0 top-0 overflow-hidden" style={{ width: songHep ? BO - 10 : 0, boxShadow: songHep ? '8px 0 18px rgba(0,0,0,0.35)' : undefined }}>
        <div className="absolute bottom-0 right-0 top-0" style={{ width: BO }}>
          <Cot src={`/assets/bo/${c.id}-trai.jpg`} rong={BO} nhanh={nhanh} />
        </div>
      </div>
      <div className="bo-lan absolute bottom-0 right-0 top-0 overflow-hidden" style={{ width: songHep ? BO - 10 : 0, boxShadow: songHep ? '-8px 0 18px rgba(0,0,0,0.35)' : undefined }}>
        <div className="absolute bottom-0 left-0 top-0" style={{ width: BO }}>
          <Cot src={`/assets/bo/${c.id}-phai.jpg`} rong={BO} nhanh={nhanh} />
        </div>
      </div>
    </div>
  );
});
