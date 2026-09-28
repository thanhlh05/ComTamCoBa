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
- **Còn dở**: Màn Bán hàng chưa có logic vỉ nướng và khách hàng (thuộc mốc 3).
- **Bước tiếp theo**: Mốc 3A (`js/service.js`) — vỉ nướng thời gian thực (đặt sườn, canh độ chín sống/chín vàng/hơi cháy/cháy đen).

