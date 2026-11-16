/** Kiểm tra lõi luật chơi: npx tsx src/game/dua.check.ts */
import { DuaGhe } from './dua';
import { GAME } from './config';
import { timTinh, TINH, SO_TINH } from './tinh';

let loi = 0;
const ok = (dk: boolean, mo: string) => {
  if (!dk) {
    loi++;
    console.log('✗', mo);
  } else console.log('✓', mo);
};

// ---------- Nhận tên tỉnh ----------
ok(SO_TINH === 34, '34 tỉnh thành');
ok(new Set(TINH.map((t) => t.ngan)).size === 34, 'chữ trên cờ không trùng');
const cases: [string, string | null][] = [
  ['cần thơ', 'can-tho'],
  ['CẦN THƠ ƠI', 'can-tho'],
  ['ct', 'can-tho'],
  ['ghe Bến Tre đâu', 'vinh-long'],
  ['sài gòn', 'hcm'],
  ['tp.hcm', 'hcm'],
  ['TPHCM', 'hcm'],
  ['hcm', 'hcm'],
  ['ha noi', 'ha-noi'],
  ['Huế', 'hue'],
  ['Đồng Tháp', 'dong-thap'],
  ['dong nai', 'dong-nai'],
  ['đắk lắk', 'dak-lak'],
  ['an giang', 'an-giang'],
  ['Kiên Giang', 'an-giang'],
  ['bình dương', 'hcm'],
  ['quảng nam', 'da-nang'],
  ['quảng ngãi', 'quang-ngai'],
  ['quảng ninh', 'quang-ninh'],
  ['cm', 'ca-mau'],
  ['ct ơi vô', null], // chữ tắt phải đứng một mình
  ['chào mọi người', null],
  ['live hay quá', null],
];
for (const [c, id] of cases) ok(timTinh(c) === id, `"${c}" -> ${id} (được ${timTinh(c)})`);

// ---------- Một vòng đua ----------
let now = 1_000_000;
const g = new DuaGhe(now);
ok(g.phase === 'chuyen' && g.vong === 1, 'mở màn giới thiệu chặng, vòng 1');
now += GAME.chuyenSec * 1000 + 10;
g.tick(now);
ok(g.phase === 'dua', 'hết giới thiệu thì vào đua');

g.chat({ id: 'a', name: 'An', comment: 'cần thơ' }, now);
g.chat({ id: 'b', name: 'Bình', comment: 'an giang' }, now);
g.chat({ id: 'c', name: 'Chi', comment: 'Cần Thơ' }, now);
g.chat({ id: 'a', name: 'An', comment: 'an giang' }, now); // gõ tỉnh khác: không đổi ghe
ok(g.ghe.get('can-tho')!.nguoi === 2 && g.ghe.get('an-giang')!.nguoi === 1, 'gõ tên tỉnh lên ghe, chỉ 1 lần');

g.tim('a', 50, now);
g.tim('b', 10, now);
g.tim('khach', 99, now); // chưa lên ghe: không tính
g.tick(now + 250);
const v = g.view(now + 250);
ok(v.ghe[0].tinh === 'can-tho' && v.ghe[0].m >= 50, 'tim = mét, Cần Thơ dẫn');
ok(v.ghe.length === 2, 'người chưa lên ghe thả tim không tạo ghe');

// quà tăng tốc
const truoc = g.ghe.get('an-giang')!.m;
g.qua({ id: 'b', name: 'Bình', gift: 'Rose', count: 1, coins: 1 }, now);
for (let i = 1; i <= 8; i++) g.tick(now + 250 + i * 250);
ok(g.ghe.get('an-giang')!.m - truoc > GAME.tangTocMet * 1.5, 'quà làm ghe tăng tốc');

// lên cấp
for (let i = 0; i < 6; i++) g.chat({ id: `x${i}`, name: `X${i}`, comment: 'cà mau' }, now);
ok(g.ghe.get('ca-mau')!.cap === 1, '5 người thì lên cấp Ghe Rồng');

// chạy hết vòng
now += 2500;
let evs: string[] = [];
while (g.phase === 'dua') {
  now += 250;
  if (Math.random() < 0.3) g.tim(['a', 'b', 'c', 'x1'][Math.floor(Math.random() * 4)], 5, now);
  g.tick(now);
  evs.push(...g.lay().map((e) => e.t));
}
ok(evs.includes('nuocRut'), 'có nước rút');
ok(['caChep', 'sucRong', 'songHep', 'senNo'].some((t) => evs.includes(t)), 'có sự kiện giữa vòng');
ok(g.phase === 'ketQua' && evs.includes('ketQua') && evs.includes('thang'), 'hết giờ ra kết quả');
const kq = g.view(now).ketQua!;
ok(kq.top.length >= 3 && kq.top[0].m >= kq.top[1].m, 'top 3 xếp đúng');

now += GAME.ketQuaSec * 1000 + 10;
g.tick(now);
ok(g.phase === 'sacPhong' && !!g.view(now).sacPhong, 'sắc phong tay chèo');
now += GAME.sacPhongSec * 1000 + 10;
g.tick(now);
ok(g.phase === 'chonSong', 'chọn sông vòng sau');
const ds = g.view(now).chonSong!.ds;
ok(ds.length === 3, '3 chặng để chọn');
ok(ds.every((d) => d.id !== g.chang.id), 'không cho chọn lại chặng vừa đua');
g.chat({ id: 'a', name: 'An', comment: ds[2].goi }, now);
g.chat({ id: 'b', name: 'Bình', comment: ds[2].goi }, now);
ok(g.view(now).chonSong!.ds[2].phieu === 2, 'gõ tên sông là bầu');
now += GAME.chonSongSec * 1000 + 10;
g.tick(now);
ok(g.phase === 'chuyen' && g.vong === 2 && g.chang.id === ds[2].id, 'vòng 2 đua ở chặng được bầu');
ok([...g.ghe.values()].every((x) => x.m === 0), 'vòng mới các ghe về vạch xuất phát');

// cá chép vàng: đủ tim thì vượt vũ môn
now += GAME.chuyenSec * 1000 + 10;
g.tick(now);
let vuMon = false;
for (let k = 0; k < 2000 && !vuMon && (g.phase as string) === 'dua'; k++) {
  now += 250;
  g.tick(now);
  const ck = g.view(now).ghe.find((x) => x.caChep);
  if (ck) {
    const ai = [...g.nguoi.values()].find((n) => n.tinh === ck.tinh)!;
    g.tim(ai.id, ck.caChep!.can, now);
  }
  g.tick(now + 1);
  vuMon = g.lay().some((e) => e.t === 'vuMon');
}
ok(vuMon, 'đủ tim cá chép thì vượt vũ môn');

console.log(loi ? `\n${loi} lỗi` : '\nTất cả đều đúng');
process.exit(loi ? 1 : 0);
