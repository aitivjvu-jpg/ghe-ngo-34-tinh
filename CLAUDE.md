# Ghe Ngo 34 Tỉnh: ghi chú cho Claude

> File này mô tả RIÊNG game này. Luật chung cho mọi game nằm ở `E:\01_Projects\VibeCode\CLAUDE.md`.
> Khi chủ kênh chốt một quyết định (câu đọc, màu, luật chơi), ghi vào mục "Quyết định của chủ kênh".

## Ý tưởng

Game đua ghe ngo cho TikTok LIVE: 34 tỉnh thành thi nhau, người xem gõ tên tỉnh quê mình để lên ghe, thả tim để chèo, tặng quà để ghe tăng tốc. Cấu trúc làm theo game "Ghe Rồng Ba Miền" chủ kênh gửi (16/11/2026) nhưng tên, hình vẽ, lời bình, âm thanh là của mình.

## Luật chơi

- Gõ tên tỉnh 1 lần là lên ghe tỉnh đó cả buổi (gõ tỉnh khác không đổi ghe). Nhận có dấu, không dấu, viết dính, tên tỉnh cũ đã sáp nhập (Bến Tre → Vĩnh Long, Bình Dương → TP.HCM...), chữ tắt đứng một mình (ct, hcm, sg, ag, cm, vl, dt, hn, hp). Danh sách: `src/game/tinh.ts`.
- 1 tim = 1 mét. Ghe có người tự trôi 0,6 m/giây.
- Quà: ghe của người tặng tăng tốc (tự lao thêm 8 m/giây), số giây theo số xu (`GAME.tangTocGiay`: 1 xu 2 giây ... 4999 xu 40 giây), cộng dồn tối đa 60 giây mỗi lần. Người chưa lên ghe tặng thì chỉ cảm ơn và nhắc gõ tên tỉnh.
- Cấp ghe theo số người trên ghe: Ghe Ngo (1) → Ghe Rồng (5) → Ghe Rồng Hào Quang (15) → Rồng Vàng (30), mỗi cấp +5% tốc độ.
- Sân nhà: mỗi chặng có 1 tỉnh sân nhà, nhanh hơn 10%.
- Một vòng: giới thiệu chặng 4 giây → đua 150 giây (30 giây cuối là NƯỚC RÚT) → kết quả 9 giây → sắc phong 6 giây → chọn sông 10 giây.
- Sự kiện ngẫu nhiên mỗi 9-14 giây (không mở trong nước rút): Cá chép vàng (1 ghe cần đủ tim trong 10 giây để VƯỢT VŨ MÔN lao lên vượt ghe phía trước, hụt thì "cá chép lặn mất"), Sức rồng (1 ghe +20% trong 20 giây), Khúc sông hẹp (bờ lấn vào, ghe đầu chậm 20% trong 12 giây), Mùa sen nở (ghe ngoài top 3 chèo ×2 trong 10 giây).
- Tự động: VƯỢT! khi đổi ngôi đầu; ĐẠI CHIẾN khi 2 ghe đầu cách dưới 25 m; nước rút xướng tên người chèo nhiều nhất 4 giây qua ("tiếp sức nước rút").
- Đường đua chính 6 làn (6 ghe đầu), ghe hạng 7-15 ở "đoàn ghe đang đuổi". Ghe không ai chèo/tặng/lên trong 5 phút thì cập bến (ẩn).
- Kết quả: top 3, "Vua sông nước · thắng N vòng liền", Bảng vàng hôm nay (lưu data/bang-vang.json, sang ngày mới làm lại).
- Sắc phong: người thả nhiều tim nhất vòng, danh hiệu theo nhịp chèo (mới / cứng 50 / thép 150 / huyền thoại 400).
- Chọn sông: sân nhà 2 tỉnh đông người nhất + 1 sông lạ; gõ tên sông để bầu, mỗi người 1 phiếu; chặng vừa đua nghỉ 3 vòng.

## File

- `src/game/dua.ts`: lõi luật chơi (không React). Test: `npx tsx src/game/dua.check.ts`.
- `src/game/config.ts`: mọi con số + lời bình luận (`GAME.loi`).
- `src/game/tinh.ts`: 34 tỉnh, tên cũ, chữ tắt, câu giới thiệu quê. `src/game/chang.ts`: 10 chặng sông.
- `src/game/GameStage.tsx`: màn hình 1080x1920. `public/assets/ghe/cap0-3.png`: ảnh ghe theo cấp (Gemini vẽ, đã tách nền). `src/game/ve/Ghe.tsx`: ghe SVG cũ (không dùng nữa) + vệt bọt sau đuôi. `src/game/ve/Song.tsx`: nền sông từng chặng (ảnh trong public/assets/song/, chặng chưa có ảnh thì vẽ SVG).
- `src/game/useGame.ts`: nối sự kiện TikTok với lõi, giọng bình luận. `src/game/sfx.ts`: trống ghe, chiêng, kèn (tự tạo, bỏ mp3 cùng tên vào public/assets/sfx/ là dùng file thay).
- `src/game/GameControls.tsx`: nút Vòng mới, Tới nước rút, giả lập người gõ tỉnh / thả tim / tặng quà.
- Cổng **3010** (BAT-LIVE.bat). Link LIVE Studio: http://lvh.me:3010/?view=stage. Xem thử không tiếng: `?view=stage&mute=1`.

## Quyết định của chủ kênh

- Tên game "Ghe Ngo 34 Tỉnh", không dùng tên "Ghe Rồng Ba Miền" (2026-11-16).
- Làm giống cấu trúc game gốc, kể cả quà làm ghe tăng tốc (2026-11-16). Khác Ai Là Trạng Nguyên (ở đó quà không cho lợi thế).
- Hình vẽ tạm bằng code, chủ kênh có thể thay ảnh tự vẽ sau (2026-11-16).
- Nền sông 10 chặng dùng ảnh Gemini vẽ (2026-11-16): public/assets/song/<id chặng>.jpg, 1080x960, đã xoá dấu ngôi sao. Các tấm lật ngược xen kẽ để chỗ nối khớp. Lòng sông ảnh gốc hẹp (300-500 px) nên đã nới mặt nước ra 170-910 px, giữ 170 px bờ sát nước mỗi bên; 6 làn ghe đặt trong khoảng đó (`LAN_X` trong GameStage.tsx). Ảnh gốc chưa nới: chưa lưu trong repo. Giữ nguyên ảnh Vịnh Hạ Long dù có hàng dừa giữa biển (chủ kênh chọn).
- Ghe dùng ảnh Gemini vẽ thay ghe SVG (2026-11-16, chủ kênh chê ghe cũ xấu): cấp 0 ghe gỗ sọc đỏ trắng đầu rắn, cấp 1 ghe rồng đỏ, cấp 2 ghe rồng tím bờm hồng (sáng hồng), cấp 3 Rồng Vàng (sáng vàng). Ghe lượn hình sóng theo dòng sông, mũi nghiêng theo hướng lượn (`.luon` trong index.css), nhún theo nhịp chèo.
