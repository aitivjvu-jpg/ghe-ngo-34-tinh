/**
 * Các chặng đua (khúc sông). Mỗi chặng có "sân nhà" của 1 tỉnh: ghe tỉnh đó chèo nhanh hơn một chút.
 * Giữa 2 vòng người xem gõ tên chặng để chọn chặng sau. Chặng vừa đua nghỉ `GAME.changNghi` vòng.
 * `kieu`: cách vẽ cảnh 2 bên bờ (GameStage.tsx -> NenSong).
 */
export type KieuCanh = 'cho-noi' | 'sen' | 'tram' | 'dua' | 'duoc' | 'nui-da' | 'vinh' | 'kinh-thanh' | 'thanh-pho';

export interface Chang {
  id: string;
  ten: string;
  goi: string[]; // người xem gõ chữ này để chọn (đã bỏ dấu được)
  sao: 1 | 2 | 3;
  nha: string; // id tỉnh sân nhà
  kieu: KieuCanh;
  nuoc: [string, string]; // màu nước: giữa, mép
  bo: [string, string]; // màu bờ: đất, cỏ
}

export const CHANG: Chang[] = [
  { id: 'cai-rang', ten: 'Chợ nổi Cái Răng', goi: ['Cái Răng', 'chợ nổi'], sao: 3, nha: 'can-tho', kieu: 'cho-noi', nuoc: ['#b98a52', '#8f6436'], bo: ['#7a5a35', '#5f7d3a'] },
  { id: 'thap-muoi', ten: 'Đồng sen Tháp Mười', goi: ['Tháp Mười', 'đồng sen'], sao: 2, nha: 'dong-thap', kieu: 'sen', nuoc: ['#3f9c94', '#2c7a74'], bo: ['#6f5a3a', '#6fae45'] },
  { id: 'tra-su', ten: 'Rừng tràm Trà Sư', goi: ['Trà Sư', 'rừng tràm'], sao: 2, nha: 'an-giang', kieu: 'tram', nuoc: ['#4f8c5a', '#38704a'], bo: ['#5b4a30', '#3f7a35'] },
  { id: 'co-chien', ten: 'Sông Cổ Chiên', goi: ['Cổ Chiên'], sao: 2, nha: 'vinh-long', kieu: 'dua', nuoc: ['#8f8a55', '#6e6a3e'], bo: ['#76603b', '#5f8f3a'] },
  { id: 'dat-mui', ten: 'Rừng đước Đất Mũi', goi: ['Đất Mũi', 'rừng đước'], sao: 3, nha: 'ca-mau', kieu: 'duoc', nuoc: ['#9a7a4e', '#755a35'], bo: ['#4d3d28', '#35552c'] },
  { id: 'trang-an', ten: 'Non nước Tràng An', goi: ['Tràng An'], sao: 2, nha: 'ninh-binh', kieu: 'nui-da', nuoc: ['#3e9a86', '#2a7666'], bo: ['#556b4a', '#4f8a45'] },
  { id: 'song-huong', ten: 'Sông Hương', goi: ['sông Hương'], sao: 1, nha: 'hue', kieu: 'kinh-thanh', nuoc: ['#3f86a0', '#2c6a82'], bo: ['#7a6a4a', '#5f8f45'] },
  { id: 'song-han', ten: 'Sông Hàn', goi: ['sông Hàn'], sao: 1, nha: 'da-nang', kieu: 'thanh-pho', nuoc: ['#2f7fb0', '#22628c'], bo: ['#8a8a8a', '#5a8f4a'] },
  { id: 'ha-long', ten: 'Vịnh Hạ Long', goi: ['Hạ Long'], sao: 3, nha: 'quang-ninh', kieu: 'vinh', nuoc: ['#2f9a9a', '#1f7a80'], bo: ['#5a6a5a', '#4a7a4a'] },
  { id: 'song-sai-gon', ten: 'Sông Sài Gòn', goi: ['sông Sài Gòn'], sao: 1, nha: 'hcm', kieu: 'thanh-pho', nuoc: ['#4a7f95', '#355f75'], bo: ['#7d7d7d', '#5a8a48'] },
];

export const CHANG_BY_ID = new Map(CHANG.map((c) => [c.id, c]));
export const saoText = (n: number) => '★'.repeat(n);
