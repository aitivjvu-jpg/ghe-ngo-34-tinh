# Ghe Ngo 34 Tỉnh

Game đua ghe tương tác cho TikTok LIVE. Người xem gõ tên tỉnh để hạ thủy ghe quê mình, thả tim để chèo, tặng quà để ghe tăng tốc. 34 tỉnh thành thi nhau qua các chặng sông: Chợ nổi Cái Răng, Đồng sen Tháp Mười, Rừng tràm Trà Sư, Sông Cổ Chiên, Rừng đước Đất Mũi, Tràng An, Sông Hương, Sông Hàn, Vịnh Hạ Long, Sông Sài Gòn.

## Chạy

1. Cài Node.js 20 trở lên.
2. Bấm đúp `BAT-LIVE.bat` (lần đầu tự cài thư viện 1-2 phút).
3. Trang điều khiển tự mở: http://localhost:3010. Nhập username TikTok, bấm Kết nối (tài khoản phải đang LIVE).
4. Trong TikTok LIVE Studio thêm nguồn Link: `http://lvh.me:3010/?view=stage`, khung 1080 × 1920.

Chưa live thì dùng các nút Giả lập trên trang điều khiển (10/60 người gõ tỉnh, thả tim, tặng quà) để xem game chạy.

Giọng bình luận: VieNeu-TTS nếu có (như các game khác), không có thì tự dùng giọng Edge NamMinh.

## Luật chơi

Xem `CLAUDE.md`. Chỉnh số liệu và lời bình trong `src/game/config.ts`.

## Kiểm tra

```
npx tsx src/game/dua.check.ts   # lõi luật chơi
npx tsc --noEmit                # kiểu dữ liệu
```

Mã nguồn MIT.
