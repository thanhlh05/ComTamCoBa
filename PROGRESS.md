# Tiến độ dự án "Cơm Tấm Cô Ba"

## Mốc 1 — Khởi tạo dự án
- Đã tạo cấu trúc file theo AGENTS.md: `index.html`, `style.css`, `manifest.json`, `js/`, `assets/`, `PROGRESS.md`.
- Đã dựng khung 390x844, safe-area, palette theo mục 12 và màn hình khởi động + chuyển đổi giữa 4 màn hình.
- Đã thêm trạng thái khởi tạo và save/load localStorage theo `com_tam_save_v1`.
- Đã đưa dữ liệu game từ mục 3, 4, 7, 8 vào `js/data.js` dạng object.

## Mốc 2 — Màn Chuẩn bị (js/prep.js)
- **Đã làm**:
  - Tab "Nguyên liệu": hiển thị icon, giá vốn/phần, số lượng tồn kho, nút "Mua lố 10" kèm giá; trừ tiền và cộng kho chính xác; khóa món chả & canh khi chưa mua nâng cấp; chặn mua khi không đủ tiền.
  - Tab "Nâng cấp": liệt kê đủ 7 nâng cấp theo mục 8, hiển thị giá theo cấp, trạng thái đã mua/chưa/tối đa, chặn mua khi thiếu tiền hoặc đã đạt giới hạn.
  - HUD: hiển thị Ngày, Tiền, Sao đồng bộ với state; nút "Mở bán" chuyển sang màn Bán hàng (`service`).
  - Luật hao tồn kho qua đêm (mục 3): viết hàm `applyOvernightSpoilage` và `startNewDay` trong `js/state.js`, sườn và chả hao 50% (làm tròn xuống) nếu chưa có Tủ lạnh.
  - Tự động lưu game (`saveState`) vào `localStorage` key `com_tam_save_v1` sau mỗi lần mua hàng hoặc nâng cấp.
- **File thay đổi**: `index.html`, `style.css`, `js/data.js`, `js/state.js`, `js/ui.js`, `js/prep.js`, `js/main.js`, `PROGRESS.md`.
## Mốc 3A — Bán hàng: vỉ nướng thời gian thực (js/service.js, js/grill.js)
- **Đã làm**:
  - Vỉ nướng: hiển thị 4 ô nướng ban đầu (mở rộng 6-8 ô theo nâng cấp Vỉ nướng lớn).
  - Đặt sườn: chạm ô trống để đặt 1 miếng sườn (trừ kho sườn trong state và lưu game, báo nếu hết kho).
  - Tiến độ nướng & vòng tròn đổi màu theo mục 5: sống (0-59%), chín vàng (60-90%), hơi cháy (91-100%, có hiệu ứng khói), cháy đen (>100%). Áp dụng Quạt than nướng nhanh hơn 20%.
  - Tương tác: chạm khi sống rung giật + báo "Chưa chín!"; chạm khi chín vàng hoặc hơi cháy thì gắp vào Khay sườn (cập nhật số lượng); để quá 12s miếng cháy tự biến thành phế và thông báo.
  - Game loop: chạy mượt bằng `requestAnimationFrame` và `dt`; tự động tạm dừng khi ẩn tab (`visibilitychange`) hoặc rời màn hình bán hàng.
- **File thay đổi**: `index.html`, `style.css`, `js/grill.js`, `js/service.js`, `js/main.js`, `PROGRESS.md`.

## Mốc 3B — Bán hàng: khách và lắp đĩa (js/service.js, js/scoring.js)
- **Đã làm**:
  - Sinh khách theo mục 4: loại khách mở khóa theo ngày (ngày 1: Học sinh, Văn phòng), khoảng cách giữa 2 khách tính chuẩn công thức, giới hạn tối đa 4 khách trên màn hình.
  - Hiển thị khách: avatar, tên, bong bóng đơn hàng (icon các món gọi) và thanh kiên nhẫn 3 màu (xanh >50%, vàng 20-50%, đỏ <20%).
  - Lắp đĩa: chạm khách để chọn, chạm nút món để thêm vào đĩa (trừ kho nguyên liệu, sườn lấy từ khay sườn chín); nút "Đổ đĩa" làm lại; nút "Giao đĩa".
  - Chấm sao & tiền theo mục 7: hàm `scoreOrder` trong `js/scoring.js` tính đúng 1-5 sao, cộng tiền đơn + tiền boa, cập nhật sao quán (trung bình 20 đánh giá gần nhất); khách hết kiên nhẫn bỏ đi tính 1 sao.
  - Đồng hồ 120s: đếm ngược thời gian thực, hết giờ tự động lưu kết quả ngày vào state và chuyển sang màn Tổng kết (`summary`).
  - Đảm bảo cấu trúc module hóa (`js/grill.js`, `js/scoring.js`) để tất cả file đều dưới 300 dòng.
- **File thay đổi**: `index.html`, `style.css`, `js/state.js`, `js/grill.js`, `js/scoring.js`, `js/service.js`, `js/main.js`, `PROGRESS.md`.
- **Còn dở**: Bảng thu chi màn Tổng kết ngày và cơ chế qua ngày mới (thuộc Mốc 4).
- **Bước tiếp theo**: Mốc 4 (`js/summary.js`) — bảng thu chi (doanh thu, tiền boa, tiền thuê mặt bằng, tổng lời/lỗ, vay 1 lần / Game Over, nút "Qua ngày mới").



