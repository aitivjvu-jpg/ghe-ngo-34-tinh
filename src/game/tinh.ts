/**
 * 34 tỉnh, thành (sau sắp xếp 2025). Người xem gõ tên tỉnh để lên ghe quê mình.
 * `cu`: tên tỉnh cũ đã nhập vào tỉnh này, gõ tên cũ vẫn lên đúng ghe (vd "Bến Tre" -> ghe Vĩnh Long).
 * `tat`: chữ viết tắt, chỉ nhận khi bình luận CHỈ có đúng chữ đó (vd "ct", "hcm"), tránh bắt nhầm.
 * `chao`: câu giới thiệu quê, hiện lúc có người lên ghe ("Lan vào ghe Cà Mau · Đất Mũi cực Nam Tổ quốc").
 */
export interface Tinh {
  id: string;
  ten: string;
  ngan: string; // chữ trên cờ đuôi ghe
  chao: string;
  ten2?: string[]; // cách gõ khác của tên mới
  cu?: string[];
  tat?: string[];
}

export const TINH: Tinh[] = [
  { id: 'ha-noi', ten: 'Hà Nội', ngan: 'HN', chao: 'Thủ đô ngàn năm văn hiến', ten2: ['hanoi', 'thu do'], tat: ['hn'] },
  { id: 'hue', ten: 'Huế', ngan: 'HU', chao: 'Cố đô, sông Hương núi Ngự', ten2: ['thua thien hue', 'tp hue'], tat: ['tth'] },
  { id: 'hai-phong', ten: 'Hải Phòng', ngan: 'HP', chao: 'Thành phố hoa phượng đỏ', ten2: ['haiphong'], cu: ['Hải Dương'], tat: ['hp'] },
  { id: 'da-nang', ten: 'Đà Nẵng', ngan: 'ĐN', chao: 'Cầu Rồng, sông Hàn', ten2: ['danang'], cu: ['Quảng Nam', 'Hội An'], tat: ['dng'] },
  { id: 'hcm', ten: 'TP.HCM', ngan: 'SG', chao: 'Sài Gòn, hòn ngọc Viễn Đông', ten2: ['tp hcm', 'tphcm', 'ho chi minh', 'sai gon', 'saigon', 'thanh pho ho chi minh'], cu: ['Bình Dương', 'Bà Rịa Vũng Tàu', 'Vũng Tàu', 'Bà Rịa'], tat: ['hcm', 'sg', 'brvt'] },
  { id: 'can-tho', ten: 'Cần Thơ', ngan: 'CT', chao: 'Chợ nổi Cái Răng', ten2: ['cantho'], cu: ['Sóc Trăng', 'Hậu Giang'], tat: ['ct'] },
  { id: 'lai-chau', ten: 'Lai Châu', ngan: 'LC', chao: 'Cao nguyên Sìn Hồ mây trắng', ten2: ['laichau'] },
  { id: 'dien-bien', ten: 'Điện Biên', ngan: 'ĐB', chao: 'Chiến thắng Điện Biên Phủ lừng lẫy', ten2: ['dienbien', 'dien bien phu'] },
  { id: 'son-la', ten: 'Sơn La', ngan: 'SL', chao: 'Cao nguyên Mộc Châu', ten2: ['sonla', 'moc chau'] },
  { id: 'lang-son', ten: 'Lạng Sơn', ngan: 'LS', chao: 'Xứ Lạng, phố Kỳ Lừa', ten2: ['langson', 'xu lang'] },
  { id: 'quang-ninh', ten: 'Quảng Ninh', ngan: 'QN', chao: 'Vịnh Hạ Long kỳ quan', ten2: ['quangninh', 'ha long'] },
  { id: 'thanh-hoa', ten: 'Thanh Hóa', ngan: 'TH', chao: 'Xứ Thanh, biển Sầm Sơn', ten2: ['thanhhoa', 'xu thanh'] },
  { id: 'nghe-an', ten: 'Nghệ An', ngan: 'NA', chao: 'Quê Bác, xứ Nghệ', ten2: ['nghean', 'xu nghe', 'vinh nghe an'] },
  { id: 'ha-tinh', ten: 'Hà Tĩnh', ngan: 'HT', chao: 'Núi Hồng sông La', ten2: ['hatinh'] },
  { id: 'cao-bang', ten: 'Cao Bằng', ngan: 'CB', chao: 'Thác Bản Giốc', ten2: ['caobang'] },
  { id: 'tuyen-quang', ten: 'Tuyên Quang', ngan: 'TQ', chao: 'Thủ đô kháng chiến, cao nguyên đá', ten2: ['tuyenquang'], cu: ['Hà Giang'] },
  { id: 'lao-cai', ten: 'Lào Cai', ngan: 'LCa', chao: 'Đỉnh Fansipan, Sa Pa mờ sương', ten2: ['laocai', 'sa pa', 'sapa'], cu: ['Yên Bái'] },
  { id: 'thai-nguyen', ten: 'Thái Nguyên', ngan: 'TNg', chao: 'Đất chè Tân Cương', ten2: ['thainguyen'], cu: ['Bắc Kạn', 'Bắc Cạn'] },
  { id: 'phu-tho', ten: 'Phú Thọ', ngan: 'PT', chao: 'Đất Tổ Hùng Vương', ten2: ['phutho'], cu: ['Vĩnh Phúc', 'Hòa Bình'] },
  { id: 'bac-ninh', ten: 'Bắc Ninh', ngan: 'BN', chao: 'Quan họ Kinh Bắc', ten2: ['bacninh', 'kinh bac'], cu: ['Bắc Giang'] },
  { id: 'hung-yen', ten: 'Hưng Yên', ngan: 'HY', chao: 'Nhãn lồng phố Hiến', ten2: ['hungyen'], cu: ['Thái Bình'] },
  { id: 'ninh-binh', ten: 'Ninh Bình', ngan: 'NB', chao: 'Tràng An non nước', ten2: ['ninhbinh', 'trang an'], cu: ['Hà Nam', 'Nam Định'] },
  { id: 'quang-tri', ten: 'Quảng Trị', ngan: 'QT', chao: 'Động Phong Nha, sông Bến Hải', ten2: ['quangtri'], cu: ['Quảng Bình'] },
  { id: 'quang-ngai', ten: 'Quảng Ngãi', ngan: 'QNg', chao: 'Núi Ấn sông Trà', ten2: ['quangngai'], cu: ['Kon Tum', 'Kontum'] },
  { id: 'gia-lai', ten: 'Gia Lai', ngan: 'GL', chao: 'Phố núi, biển Quy Nhơn', ten2: ['gialai', 'pleiku'], cu: ['Bình Định', 'Quy Nhơn'] },
  { id: 'khanh-hoa', ten: 'Khánh Hòa', ngan: 'KH', chao: 'Biển xanh Nha Trang', ten2: ['khanhhoa', 'nha trang'], cu: ['Ninh Thuận'] },
  { id: 'lam-dong', ten: 'Lâm Đồng', ngan: 'LĐ', chao: 'Đà Lạt thành phố ngàn hoa', ten2: ['lamdong', 'da lat', 'dalat'], cu: ['Đắk Nông', 'Đắc Nông', 'Bình Thuận', 'Phan Thiết'] },
  { id: 'dak-lak', ten: 'Đắk Lắk', ngan: 'ĐL', chao: 'Thủ phủ cà phê Buôn Ma Thuột', ten2: ['daklak', 'dak lac', 'buon ma thuot', 'bmt'], cu: ['Phú Yên'] },
  { id: 'dong-nai', ten: 'Đồng Nai', ngan: 'ĐNa', chao: 'Rừng Nam Cát Tiên', ten2: ['dongnai', 'bien hoa'], cu: ['Bình Phước'] },
  { id: 'tay-ninh', ten: 'Tây Ninh', ngan: 'TN', chao: 'Núi Bà Đen', ten2: ['tayninh'], cu: ['Long An'] },
  { id: 'vinh-long', ten: 'Vĩnh Long', ngan: 'VL', chao: 'Xứ dừa Bến Tre, vườn trái cây', ten2: ['vinhlong'], cu: ['Bến Tre', 'Trà Vinh'], tat: ['vl'] },
  { id: 'dong-thap', ten: 'Đồng Tháp', ngan: 'ĐT', chao: 'Đồng sen Tháp Mười', ten2: ['dongthap'], cu: ['Tiền Giang', 'Mỹ Tho'], tat: ['dt'] },
  { id: 'ca-mau', ten: 'Cà Mau', ngan: 'CM', chao: 'Đất Mũi cực Nam Tổ quốc', ten2: ['camau', 'dat mui'], cu: ['Bạc Liêu'], tat: ['cm'] },
  { id: 'an-giang', ten: 'An Giang', ngan: 'AG', chao: 'Rừng tràm Trà Sư, núi Sam', ten2: ['angiang', 'chau doc'], cu: ['Kiên Giang', 'Phú Quốc', 'Rạch Giá'], tat: ['ag'] },
];

export const SO_TINH = TINH.length; // 34
export const TINH_BY_ID = new Map(TINH.map((t) => [t.id, t]));

/** Bỏ dấu, thường hoá, 1 khoảng trắng, có khoảng trắng 2 đầu: "Cần Thơ ơi!" -> " can tho oi " */
export const plain = (text: string) =>
  ` ${text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[đĐ]/g, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()} `;

// Màu ghe: 34 màu xa nhau (góc vàng trên vòng màu), cố định theo thứ tự tỉnh
export const mauTinh = (id: string) => {
  const i = TINH.findIndex((t) => t.id === id);
  const h = Math.round((i * 137.508) % 360);
  return { than: `hsl(${h} 62% 38%)`, vien: `hsl(${h} 80% 62%)`, nhat: `hsl(${h} 70% 82%)` };
};

// Bảng tra: tên đã bỏ dấu -> id. Tên dài tra trước để "ha noi" không bị bắt thành tỉnh khác.
const DAI: [string, string][] = [];
const TAT = new Map<string, string>();
for (const t of TINH) {
  for (const n of [t.ten, ...(t.ten2 ?? []), ...(t.cu ?? [])]) DAI.push([plain(n), t.id]);
  for (const n of t.tat ?? []) TAT.set(plain(n), t.id);
}
DAI.sort((a, b) => b[0].length - a[0].length);

/**
 * Bình luận có tên tỉnh nào không. "cần thơ", "CẦN THƠ ơi", "ghe Bến Tre" -> id tỉnh; "ct" (chỉ 2 chữ) -> cần thơ.
 * Tên phải đứng riêng thành chữ ("hue" trong "huệ" vẫn khớp vì đã bỏ dấu, chấp nhận).
 */
export function timTinh(comment: string): string | null {
  const p = plain(comment);
  if (p.trim().length === 0 || p.length > 80) return null;
  const tat = TAT.get(p);
  if (tat) return tat;
  for (const [ten, id] of DAI) if (p.includes(ten)) return id;
  return null;
}

/** Gõ tên tỉnh cũ thì trả tên cũ (có dấu) để nói rõ đã sáp nhập: "ben tre" -> "Bến Tre". Không phải tên cũ -> null */
export function tenCu(comment: string, id: string): string | null {
  const t = TINH_BY_ID.get(id);
  const p = plain(comment);
  const cu = t?.cu?.find((c) => p.includes(plain(c)));
  return cu ?? null;
}
