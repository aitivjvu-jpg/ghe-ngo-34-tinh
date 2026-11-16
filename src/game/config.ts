/**
 * Số liệu và lời bình luận của Ghe Ngo 34 Tỉnh. Muốn chỉnh luật chơi / câu đọc thì sửa ở đây.
 * Lời bình có nhiều câu: game bốc ngẫu nhiên, không lặp câu vừa đọc.
 */
type F1 = (a: string) => string;
type F2 = (a: string, b: string) => string;

export const GAME = {
  tieuDeMacDinh: 'GHE NGO',
  tieuDePhu: '34 TỈNH',
  defaultChannelName: 'Ghe Ngo 34 Tỉnh',

  // ---------- Nhịp một vòng (giây) ----------
  chuyenSec: 4, // màn "CHẶNG ĐUA ..." trước khi xuất phát
  duaSec: 150, // một vòng đua (gồm cả nước rút)
  nuocRutSec: 30, // 30 giây cuối
  ketQuaSec: 9,
  sacPhongSec: 6,
  chonSongSec: 10,
  changNghi: 3, // chặng vừa đua nghỉ mấy vòng

  // ---------- Chèo ----------
  metMoiTim: 1, // 1 tim = 1 mét
  troiGiay: 0.6, // ghe có người tự trôi chừng này mét/giây (đứng yên trông chán)
  sanNha: 1.1, // ghe sân nhà nhanh hơn 10%
  capThuong: [0, 0.05, 0.1, 0.15], // cấp ghe cộng thêm % tốc độ
  // Số người trên ghe để lên cấp: Ghe Ngo -> Ghe Rồng -> Ghe Rồng Hào Quang -> Rồng Vàng
  capNguoi: [0, 5, 15, 30],
  tenCap: ['Ghe Ngo', 'Ghe Rồng', 'Ghe Rồng Hào Quang', 'Rồng Vàng'],
  nghiDuaSauMs: 5 * 60_000, // ghe không ai chèo, tặng, lên thêm 5 phút thì cập bến (không hiện nữa)
  soLan: 6, // số ghe trên đường đua chính; còn lại vào "đoàn ghe đang đuổi"
  soDuoi: 9, // số ghe hiện ở đoàn đang đuổi

  // ---------- Quà: ghe tăng tốc ----------
  // Xu của cả lần tặng -> số giây tăng tốc (cộng dồn, tối đa `tangTocMaxSec` mỗi lần)
  tangTocGiay: [
    [1, 2],
    [5, 3],
    [10, 4],
    [30, 6],
    [99, 9],
    [299, 15],
    [999, 25],
    [4999, 40],
  ] as [number, number][],
  tangTocMaxSec: 60,
  tangTocMet: 8, // mét/giây ghe tự lao thêm khi đang tăng tốc
  quaLonXu: 99, // từ chừng này xu: hiệu ứng quà lớn giữa màn hình

  // ---------- Sự kiện giữa vòng ----------
  suKienSau: [9, 14] as [number, number], // cách nhau 9-14 giây
  caChepGiay: 10,
  caChepTim: (soNguoi: number) => Math.min(80, 12 + soNguoi * 3), // tim cần để vượt vũ môn
  vuMonToiDa: 140, // vượt vũ môn lao lên tối đa chừng này mét
  sucRongGiay: 20,
  sucRongHeSo: 1.2,
  songHepGiay: 12,
  songHepHeSo: 0.8, // ghe dẫn đầu vướng bờ
  senNoGiay: 10,
  senNoHeSo: 2, // ghe ngoài top 3 chèo gấp đôi
  daiChienCach: 25, // 2 ghe đầu cách nhau dưới 25 m -> đại chiến

  // ---------- Danh hiệu tay chèo (nhịp chèo trong 1 vòng) ----------
  danhHieu: [
    [0, 'Tay chèo mới'],
    [50, 'Tay chèo cứng'],
    [150, 'Tay chèo thép'],
    [400, 'Tay chèo huyền thoại'],
  ] as [number, string][],

  // ---------- Dòng chữ phụ dưới tên game (đổi mỗi 5 giây) ----------
  khauHieu: [
    () => 'Gõ tên tỉnh để hạ thủy ghe quê bạn',
    () => 'Tỉnh nào mạnh nhất Việt Nam?',
    (dau: string) => (dau ? `${dau} đang dẫn đầu · Quê bạn hạng mấy?` : 'Ghe quê bạn đâu rồi?'),
    (_dau: string, so: number) => `${so} tỉnh đang đua · còn ${34 - so} tỉnh chưa có ghe!`,
  ],
  hoChe: ['Hò dô!', 'Tới luôn!', 'Chèo đi!', 'Lẹ lên nghen!', 'Có lên!', 'Đó tới!', 'Sẵn đi, có lên!', 'Hò dô ta!'],

  // ---------- Giọng bình luận ----------
  greetEveryMs: 20_000,
  namesPerGreeting: 3,
  greeting: (names: string) => `Chào ${names}! Gõ tên tỉnh quê mình để lên ghe đua nha!`,
  giftThanksCooldownMs: 20_000,
  bigGiftCoins: 99,
  shareReminderEveryMs: 6 * 60_000,
  thankFollow: (name: string) => `Cảm ơn ${name} đã theo dõi kênh! Chèo cùng tụi mình nha!`,
  shareLines: [
    'Chia sẻ live cho bà con đồng hương vô chèo phụ ghe quê mình nha!',
    'Rủ thêm người cùng quê vô đây, ghe đông người là lên cấp Rồng Vàng liền!',
  ],

  loi: {
    chuyen: [
      (chang: string) => `Vòng mới! Chặng đua ${chang}. Các ghe vào vị trí!`,
      (chang: string) => `Chặng tiếp theo, ${chang}! Bà con chuẩn bị tay chèo!`,
      (chang: string) => `Hạ thủy ở ${chang}! Ba, hai, một, chèo!`,
    ] as F1[],
    sanNha: [(tinh: string) => `Đây là sân nhà của ${tinh}, ghe ${tinh} được chèo nhanh hơn một chút nha!`] as F1[],
    len: [
      (ten: string, tinh: string) => `${ten} đã lên ghe ${tinh}!`,
      (ten: string, tinh: string) => `Ghe ${tinh} có thêm tay chèo ${ten}!`,
      (ten: string, tinh: string) => `${ten} xuống ghe ${tinh}, thả tim để chèo nha!`,
    ] as F2[],
    tinhMoi: [
      (tinh: string) => `Ghe ${tinh} vừa hạ thủy! Đồng hương ${tinh} đâu, vô chèo phụ!`,
      (tinh: string) => `${tinh} đã có ghe! Thêm một tỉnh vào đường đua!`,
    ] as F1[],
    lenCap: [
      (tinh: string, cap: string) => `Ghe ${tinh} lên cấp, thành ${cap}!`,
      (tinh: string, cap: string) => `Đông người quá! ${tinh} nâng cấp ${cap}!`,
    ] as F2[],
    caChep: [
      (tinh: string) => `Cá chép vàng xuất hiện cạnh ghe ${tinh}! Thả tim thật nhanh để vượt vũ môn!`,
      (tinh: string) => `Cá chép vàng! Ghe ${tinh}, mười giây thả tim, vượt vũ môn nào!`,
    ] as F1[],
    vuMon: [
      (tinh: string) => `Vượt vũ môn! Ghe ${tinh} lao vút lên!`,
      (tinh: string) => `Cá chép hóa rồng! ${tinh} bay lên rồi bà con ơi!`,
    ] as F1[],
    caChepTruot: [(tinh: string) => `Tiếc quá, cá chép lặn mất rồi. Ghe ${tinh} hụt chút xíu!`] as F1[],
    sucRong: [(tinh: string) => `Sức rồng! Ghe ${tinh} nhanh hơn hai mươi phần trăm trong hai mươi giây!`] as F1[],
    songHep: ['Khúc sông hẹp! Bờ lấn vào, giữ vị trí, lách qua nào!', 'Sông hẹp lại rồi, ghe đầu coi chừng vướng bờ!'],
    senNo: ['Mùa sen nở! Ghe ngoài tốp ba chèo được gấp đôi mét!', 'Sen nở đón đoàn sau! Ghe phía sau tranh thủ thả tim đi!'],
    vuot: [
      (tinh: string) => `Vượt rồi! ${tinh} lên dẫn đầu!`,
      (tinh: string) => `${tinh} vượt lên! Đổi ngôi đầu!`,
    ] as F1[],
    daiChien: [(a: string, b: string) => `Đại chiến ${a} và ${b}! Hai ghe đang bám nhau từng mét!`] as F2[],
    nuocRut: [
      (dau: string, cach: string) => `Nước rút! Ba mươi giây cuối! ${dau} đang dẫn ${cach} mét, thả tim thật mạnh!`,
      (dau: string, cach: string) => `Vào nước rút! ${dau} hơn ${cach} mét, các ghe phía sau còn kịp!`,
    ] as F2[],
    tiepSuc: [(ten: string, tinh: string) => `${ten} tiếp sức nước rút cho ghe ${tinh}!`] as F2[],
    ketQua: [
      (tinh: string, met: string) => `Về nhất! ${tinh} thắng vòng này với ${met} mét!`,
      (tinh: string, met: string) => `Chiến thắng thuộc về ${tinh}, ${met} mét!`,
    ] as F2[],
    lienTiep: (tinh: string, n: number) => `${tinh} thắng ${n} vòng liền, đúng là vua sông nước! Tỉnh nào dám cản?`,
    khongAi: 'Vòng này chưa có ghe nào. Gõ tên tỉnh để hạ thủy ghe quê mình nha!',
    sacPhong: (ten: string, tinh: string, nhip: number, danhHieu: string) =>
      `Sắc phong tay chèo xuất sắc nhất vòng: ${ten}, đội ${tinh}, ${nhip} nhịp chèo. Danh hiệu ${danhHieu}!`,
    chonSong: (a: string, b: string, c: string) => `Chọn sông vòng sau! Gõ ${a}, ${b}, hoặc ${c}!`,
    chotSong: (chang: string) => `Vòng sau đua ở ${chang}!`,
    // Bình luận chen vào lúc giọng rảnh giữa vòng đua
    binh: {
      dan: [
        (dau: string, cach: string) => `${dau} đang dẫn ${cach} mét!`,
        (dau: string, cach: string) => `Ghe ${dau} vẫn đứng đầu, hơn ${cach} mét!`,
      ] as F2[],
      sat: [(a: string, b: string) => `${b} bám sát ${a}, chỉ cách vài mét!`] as F2[],
      moi: [
        (con: string) => `Còn ${con} tỉnh chưa có ghe. Quê bạn đâu? Gõ tên tỉnh đi!`,
        () => 'Gõ tên tỉnh một lần để lên ghe, rồi thả tim là chèo!',
        () => 'Tặng quà là ghe quê bạn tăng tốc liền!',
      ] as F1[],
      cuoi: [(tinh: string) => `Ghe ${tinh} đang ở cuối đoàn, bà con ${tinh} thả tim kéo lên đi!`] as F1[],
    },
    camQua: [
      (ten: string, tinh: string, giay: string) => `Cảm ơn ${ten}! Ghe ${tinh} tăng tốc ${giay} giây!`,
      (ten: string, tinh: string, giay: string) => `${ten} tiếp sức, ghe ${tinh} lao lên ${giay} giây!`,
    ] as ((a: string, b: string, c: string) => string)[],
    camQuaChuaGhe: (ten: string) => `Cảm ơn ${ten}! Gõ tên tỉnh để lần sau quà đẩy ghe quê mình nha!`,
  },
};

export const capCua = (soNguoi: number) => {
  let cap = 0;
  GAME.capNguoi.forEach((n, i) => soNguoi >= n && (cap = i));
  return cap;
};

export const giayTangToc = (xu: number) => {
  let s = 0;
  for (const [x, g] of GAME.tangTocGiay) if (xu >= x) s = g;
  return s;
};

export const danhHieu = (nhip: number) => {
  let d = GAME.danhHieu[0][1];
  for (const [n, t] of GAME.danhHieu) if (nhip >= n) d = t;
  return d;
};
