# AGENTS.md — Luật dự án "Cơm Tấm Cô Ba"

## Tổng quan
- Game mô phỏng bán cơm tấm, tiếng Việt, chạy trên trình duyệt điện thoại (ưu tiên iPhone Safari/PWA).
- Triển khai dạng static trên Vercel. Thiết kế chi tiết nằm trong `GAME_DESIGN.md` (nguồn sự thật duy nhất về luật game và số liệu).

## Công nghệ (bắt buộc)
- Chỉ HTML + CSS + JavaScript thuần, dùng ES modules (`<script type="module">`).
- KHÔNG framework, KHÔNG bundler, KHÔNG npm package cho game, trừ khi tôi cho phép rõ ràng.
- UI bằng DOM (div, button). KHÔNG dùng canvas.
- Mobile-first, màn hình dọc (thiết kế theo 390x844), chỉ cảm ứng (không dùng hover).
- KHÔNG tạo backend/server cho bất kỳ tính năng nào (kể cả "ID sao lưu" — xem ghi chú bên dưới).

## Cấu trúc thư mục
```
index.html
style.css
manifest.json
js/main.js       khởi động, chuyển màn hình, điều khiển bottom nav
js/state.js      trạng thái game, lưu/tải localStorage
js/data.js       toàn bộ số liệu (món, giá, khách, nâng cấp, sự kiện)
js/prep.js       tab Chuẩn bị
js/service.js    màn Bán hàng (khách, vỉ nướng, lắp đĩa, đồng hồ ảo)
js/pausemenu.js  menu tạm dừng (nút ☰): tiếp tục, âm thanh, đóng cửa sớm, thoát về Chuẩn bị
js/summary.js    màn Tổng kết
js/home.js       tab Quán (dashboard)
js/revenue.js    tab Doanh thu (sổ doanh thu)
js/settings.js   tab Cài đặt (âm thanh, giờ mở, thời lượng, mã lưu)
js/tutorial.js   hướng dẫn 4 thẻ + màn đặt tên quán
js/nav.js        bottom nav: hiện/ẩn theo màn hình hiện tại
js/ui.js         hàm tiện ích hiển thị
assets/          hình ảnh (thêm sau)
PROGRESS.md      nhật ký tiến độ
```

## Quy tắc code
- Mọi con số game (giá, thời gian, tỉ lệ) nằm trong `js/data.js`. Không hard-code trong logic.
- Trạng thái game chỉ nằm trong `js/state.js`. Lưu localStorage với key `com_tam_save_v1`.
- Mỗi file dưới 300 dòng; nếu dài hơn thì tách.
- Hình ảnh gọi qua bảng ánh xạ trong `data.js` (`ASSETS`); nếu file ảnh chưa có thì hiện emoji thay thế.
- Comment ngắn bằng tiếng Việt ở những chỗ khó hiểu.
- Vòng lặp thời gian thực dùng `requestAnimationFrame` và `dt` (không dùng setInterval chồng chéo). Khi tab bị ẩn thì tạm dừng game.
- **Ngày hiện tại chỉ tăng khi người chơi bấm "Qua ngày mới" ở màn Tổng kết**, không tăng trước đó. HUD và tiêu đề Tổng kết luôn phải đọc cùng một biến ngày.
- **Đồng hồ giờ ảo** (mục 15 GAME_DESIGN.md) chỉ là hiển thị. KHÔNG dùng nó để tính spawn khách, độ chín sườn hay điểm số — các phần đó luôn tính theo giây thật.
- **Bottom nav** (`js/nav.js`) ẩn hoàn toàn khi đang ở màn Bán hàng, Start, Hướng dẫn, Đặt tên quán; hiện ở mọi màn còn lại (Quán, Chuẩn bị, Doanh thu, Cài đặt).
- **Menu tạm dừng khi Bán hàng** (mục 19 GAME_DESIGN.md): màn Bán hàng không có nút thoát trực tiếp nào khác ngoài nút ☰ góc trên bên trái. Mở menu này phải dừng thật sự vòng lặp game (giống lúc tab bị ẩn), không chỉ che UI. "Đóng cửa sớm" là tính năng thật, có lưu kết quả; "Thoát về Chuẩn bị" là huỷ ngày, phải có hộp xác nhận và không được lưu/tính bất cứ gì của ngày đó.
- **"ID sao lưu"** trong Cài đặt là chuỗi base64 mã hoá toàn bộ `localStorage` save, không phải ID tra cứu server. Đừng thiết kế nó như một tài khoản hay mã định danh cần backend.

## Yêu cầu riêng cho iOS
- `<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover">`
- Dùng `env(safe-area-inset-*)` cho padding trên/dưới, dùng `100dvh` thay vì `100vh`. Chú ý bottom nav phải cộng thêm `env(safe-area-inset-bottom)` để không bị thanh home indicator che.
- CSS: `touch-action: manipulation; user-select: none; -webkit-user-select: none; -webkit-tap-highlight-color: transparent;`
- Âm thanh chỉ khởi tạo sau lần chạm đầu tiên của người chơi.
- Có `manifest.json` và thẻ `apple-mobile-web-app-capable`, `apple-touch-icon`.

## Cách làm việc
- Chỉ làm đúng mốc được giao. Không làm thêm tính năng, không refactor ngoài phạm vi.
- Chỉ đọc/sửa các file liên quan, không viết lại toàn bộ file khi chỉ cần sửa vài dòng.
- Trước khi báo xong: chạy game bằng `npx serve .`, kiểm tra console không có lỗi, tự kiểm tra theo tiêu chí nghiệm thu của mốc.
- Nếu yêu cầu chưa rõ hoặc mâu thuẫn với GAME_DESIGN.md, hỏi lại một câu ngắn thay vì tự đoán.
- Cuối mỗi mốc: cập nhật `PROGRESS.md` (đã làm gì, file nào thay đổi, còn dở gì, bước tiếp theo), để có thể chuyển sang công cụ AI khác mà không mất ngữ cảnh.
- Báo cáo ngắn: tối đa 5 dòng về những gì đã thay đổi.
