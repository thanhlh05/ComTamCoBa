# GAME_DESIGN.md — "Cơm Tấm Cô Ba"

Game mô phỏng bán cơm tấm vỉa hè Sài Gòn. Chạy trên trình duyệt điện thoại (ưu tiên iPhone), tiếng Việt, chơi dọc, chỉ dùng cảm ứng.

Điểm khác biệt so với các game "bán trà sữa/cá viên": **có vỉ nướng sườn thời gian thực** (canh độ chín, để cháy là phế).

---

## 1. Vòng lặp mỗi ngày

1. **Chuẩn bị**: mua nguyên liệu, mua nâng cấp.
2. **Bán hàng** (theo thời lượng thật đã chọn trong Cài đặt, mặc định 3 phút): khách đến → gọi món → nướng sườn + lắp đĩa → giao trước khi hết kiên nhẫn.
3. **Tổng kết**: doanh thu, chi phí, tiền lời, sao quán, sự kiện.
4. Sang ngày mới.

## 2. Tiền tệ

- Đơn vị: đồng (hiển thị dạng `15.000đ`).
- Tiền khởi đầu: **200.000đ**.
- Tiền thuê mặt bằng mỗi ngày (trừ lúc tổng kết): `30.000 + 5.000 × (ngày - 1)`, tối đa 80.000.
- Nếu tiền < 0 và không còn nguyên liệu: cho vay 1 lần duy nhất 100.000đ ("Cô Ba cho mượn"). Lần 2 thì Game Over (có nút chơi lại).

## 3. Thực đơn và nguyên liệu

Mỗi đơn khách = 1 đĩa cơm tấm + các món thêm. Cơm và đồ chua luôn có.

| Mã | Món | Giá bán | Giá vốn/phần | Ghi chú |
|---|---|---|---|---|
| com | Cơm tấm (đĩa) | 15.000 | 3.000 | Bắt buộc, có kèm đồ chua và nước mắm |
| suon | Sườn nướng | +20.000 | 9.000 | Phải nướng trên vỉ |
| bi | Bì | +8.000 | 2.500 | Lấy ngay |
| cha | Chả trứng | +10.000 | 3.500 | Mở khóa bằng nâng cấp |
| trung | Trứng ốp la | +7.000 | 2.500 | Lấy ngay |
| canh | Canh khổ qua | +5.000 | 1.500 | Mở khóa cùng chả |
| tra | Trà đá | +5.000 | 1.000 | Lấy ngay |

Mua nguyên liệu theo **lố 10 phần** (giá = giá vốn × 10). Tồn kho hiển thị số phần.

**Tồn kho qua đêm**: sườn và chả còn dư mất 50% (làm tròn xuống) nếu chưa mua Tủ lạnh. Các món khác giữ nguyên.

## 4. Khách hàng

Số khách mỗi ngày: `min(30, 10 + 2 × (ngày - 1))`, đến rải trong suốt thời lượng bán (theo giây thật, không phụ thuộc đồng hồ ảo ở mục 15).

Khoảng cách giữa 2 khách (giây) = `(thời lượng bán giây / số khách) × (1.4 - 0.1 × sao) / (1 + bonus bảng hiệu)`.

| Loại | Kiên nhẫn (s) | Số món thêm | Tiền boa | Xuất hiện từ ngày |
|---|---|---|---|---|
| Học sinh 🎒 | 45 | 0-1 | 0% | 1 |
| Dân văn phòng 💼 | 30 | 1-2 | 10% | 1 |
| Bác tài xế 🛵 | 40 | 1-2 | 5% | 2 |
| Khách du lịch 📷 | 35 | 2-4 | 25% | 4 |
| Shipper 📦 | 20 | 1-2 | 30% | 6 |

Tỉ lệ xuất hiện: đều nhau trong các loại đã mở khóa. Kiên nhẫn nhân thêm `(1 + bonus quạt máy)`.

Thanh kiên nhẫn chia màu: xanh > 50%, vàng 20-50%, đỏ < 20%. Hết kiên nhẫn = khách bỏ đi (không trả tiền, tính 1 sao).

## 5. Vỉ nướng (cơ chế đặc trưng)

- Vỉ có **4 ô** ban đầu. Chạm ô trống để đặt 1 miếng sườn (trừ 1 phần kho).
- Độ chín chạy từ 0 → 100 trong **8 giây thật** (nhanh hơn nếu có Quạt than). Không liên quan đồng hồ ảo mục 15.
- Vùng độ chín:
  - 0-59: **sống**
  - 60-90: **chín vàng** (ngon)
  - 91-100: **hơi cháy** (vẫn dùng được, sao giảm)
  - Trên 100 (sau 12 giây): **cháy đen** → miếng phế, bỏ đi, mất vốn.
- Chạm miếng sườn để nhấc lên và cho vào khay. Sườn sống thì không nhấc được (rung nhẹ, báo "Chưa chín!").
- Hiển thị: vòng tròn độ chín đổi màu hồng → nâu vàng → đen, có khói khi sắp cháy.

## 6. Cách làm một đơn

1. Chạm vào khách để chọn đơn đang phục vụ (đơn hiện dạng icon phía trên).
2. Lắp đĩa: chạm nút món trong khay dưới (cơm, bì, trứng, chả, canh, trà). Sườn lấy từ vỉ (miếng đã nhấc).
3. Nút **Giao** bật khi đĩa đủ món. Giao sai/thiếu món vẫn được giao nhưng khách chấm thấp.
4. Nút **Đổ đĩa** để làm lại (mất nguyên liệu đã dùng).

## 7. Sao đánh giá

Mỗi khách chấm 1-5 sao:

| Điều kiện | Sao |
|---|---|
| Đúng đủ món, sườn chín vàng, kiên nhẫn còn > 50% | 5 |
| Đúng đủ món, kiên nhẫn 20-50% | 4 |
| Đúng đủ món, kiên nhẫn < 20% hoặc sườn hơi cháy | 3 |
| Sai/thiếu 1 món | 2 |
| Sai từ 2 món, sườn sống, hoặc bỏ đi | 1 |

- **Sao quán** = trung bình 20 đánh giá gần nhất (làm tròn 0.1). Khởi đầu 4.0 (coi như đã có 20 đánh giá 4 sao).
- Tiền thực nhận = giá đơn × (0.5 nếu 1-2 sao, 1.0 nếu 3+ sao) + tiền boa (chỉ khi 4-5 sao).

## 8. Nâng cấp (tất cả mua ở tab Chuẩn bị)

| Nâng cấp | Giá | Hiệu quả | Giới hạn |
|---|---|---|---|
| Vỉ nướng lớn | 150.000 / 300.000 | 4 → 6 → 8 ô | 2 cấp |
| Quạt than | 200.000 | Sườn chín nhanh hơn 20% (6.4s) | 1 cấp |
| Bảng hiệu đèn led | 250.000 | Khách đến nhiều hơn 15% | 1 cấp |
| Quạt máy | 300.000 | Kiên nhẫn khách +15% | 1 cấp |
| Tủ lạnh | 350.000 | Sườn/chả không hao qua đêm | 1 cấp |
| Mở món Chả + Canh | 150.000 | Thêm 2 món vào menu | 1 cấp |
| Thuê chị Hai phụ bếp | 500.000 | Tự lắp giúp 1 món mỗi 10s (bì/trứng/cơm) | 1 cấp |

## 9. Sự kiện ngẫu nhiên (làm ở mốc dời xuống cuối)

Mỗi ngày từ ngày 3 có 30% xảy ra 1 sự kiện (hiện thông báo lúc bắt đầu ngày):

- **Trời mưa**: khách -30%, shipper x2.
- **Tan học**: học sinh x2 trong 30 giây đầu.
- **Cúp điện**: quạt máy/đèn tắt, kiên nhẫn -15%.
- **Có người khen trên mạng**: khách +25%, cần đủ sườn.
- **Tăng giá sườn**: giá vốn sườn +30% ngày đó.

## 10. Màn hình (cập nhật cấu trúc điều hướng)

1. **Bắt đầu**: chạm để vào. Lần đầu → Hướng dẫn → Đặt tên quán → tab Quán ngày 1. Lần sau → thẳng tab Quán.
2. **Hướng dẫn** (popup 4 thẻ, mục 18). Có thể mở lại từ màn Start (link chữ gạch chân) mà không hiện lại màn Đặt tên quán.
3. **Đặt tên quán** (chỉ hiện lần đầu, mục 13).
4. **Quán** (tab 🏠, dashboard): tên quán, sao, ngày, tiền, nút "Mở bán".
5. **Chuẩn bị** (tab 🍚): giữ nguyên 2 tab con Nguyên liệu / Nâng cấp, nút "Mở bán".
6. **Bán hàng**: HUD gồm tiền, đồng hồ giờ ảo (mục 15), sao, nút ☰ menu tạm dừng (mục 19) ở góc trên bên trái; hàng khách; vỉ nướng; khay; nút món; Giao/Đổ đĩa. **Không hiện bottom nav.** Không có nút thoát trực tiếp trên màn hình — mọi cách thoát/tạm dừng đều đi qua menu ☰.
7. **Tổng kết**: dữ liệu đúng của ngày vừa bán, khớp với ngày đang hiện ở HUD trước đó (xem lưu ý bug ở dưới). Nút "Qua ngày mới" mới tăng biến ngày, sau đó quay lại tab Quán/Chuẩn bị và hiện lại bottom nav.
8. **Doanh thu** (tab 📊, mục 17).
9. **Cài đặt** (tab ⚙️, mục 16).
10. **Game Over**.

**Lưu ý sửa lỗi quan trọng**: biến "ngày hiện tại" chỉ được tăng lên **sau khi** người chơi bấm "Qua ngày mới", không phải trước khi hiển thị Tổng kết. HUD và tiêu đề Tổng kết phải luôn dùng cùng một biến ngày tại cùng thời điểm.

## 11. Lưu game

- localStorage, key `com_tam_save_v1`.
- Lưu sau mỗi lần mua và mỗi lần tổng kết ngày.
- "ID sao lưu" trong Cài đặt (mục 16) chính là cơ chế xuất/nhập mã lưu này.

## 12. Phong cách

- Màu ấm: nền kem `#fdf3e4`, nâu than `#5a3a22`, cam `#f28c28`, xanh lá đồ chua `#6aa84f`.
- Chữ to, nút to (tối thiểu 48px), giọng văn dí dỏm Nam Bộ ("Trời ơi sườn cháy rồi!", "Cô Ba cảm ơn nha!").
- Placeholder ban đầu dùng emoji: 🍚 🍖 🥚 🥒 🍲 🧊 👧 💼 🛵 📷 📦.

## 13. Tên quán

- Sau màn Hướng dẫn lần đầu: màn "Đặt tên quán" — ô nhập text, tối đa 20 ký tự, không để trống, gợi ý sẵn "Cơm Tấm Cô Ba".
- Tên hiển thị ở: màn Start (dưới logo), tab Quán, tiêu đề màn Tổng kết.
- Lưu trong state (`state.shopName`). Cho phép đổi lại trong Cài đặt (không bắt buộc làm ngay, có thể để phase sau).

## 14. Điều hướng chính (bottom nav — 4 tab)

- 4 tab cố định dưới màn hình, hiện ở mọi lúc **trừ** khi đang ở màn Bán hàng, Start, Hướng dẫn, Đặt tên quán:
  - 🏠 **Quán** — dashboard: tên quán, sao, ngày, tiền, nút "Mở bán"/"Tiếp tục bán".
  - 🍚 **Chuẩn bị** — màn hiện tại, giữ nguyên 2 tab con.
  - 📊 **Doanh thu** — mục 17.
  - ⚙️ **Cài đặt** — mục 16.
- Khi đang Bán hàng: ẩn hoàn toàn bottom nav, không có cách nào thoát ngang trừ hết giờ/hết khách, để tránh thoát nhầm giữa lúc đang phục vụ.
- Sau khi bấm "Qua ngày mới" ở Tổng kết: quay về tab Quán/Chuẩn bị, hiện lại bottom nav.
- Tab ⭐ Đánh giá **chưa làm ở giai đoạn này** — xem mục 19 (Backlog).

## 15. Giờ mở bán & đồng hồ ảo

Thay đồng hồ đếm giây (`119s`) bằng đồng hồ giờ trong ngày, tạo cảm giác một ngày bán hàng thật, chỉnh được trong Cài đặt.

- Khung giờ hợp lệ: **5:00 – 23:00** (bước 1 giờ). Cả giờ mở lẫn giờ đóng đều chỉnh được trong khung này, miễn giờ mở < giờ đóng.
  - Mặc định: mở 5:00, đóng 23:00.
  - Hợp lệ: 6:00–22:00, 6:00–21:00, 7:00–19:00, 5:00–23:00...
  - Không hợp lệ: mở trước 5:00 (vd 4:00) hoặc đóng sau 23:00 (vd 0:00) — UI chặn không cho chọn ra ngoài khung, và chặn chọn giờ đóng ≤ giờ mở.
- Thời lượng thật của 1 ngày bán: chọn trong Cài đặt **3 / 4 / 5 / 6 phút**, mặc định 3 phút.
- Công thức: `tổng phút trong game = (giờ đóng - giờ mở) × 60`. Mỗi giây thật trôi qua, giờ trong game tăng thêm `tổng phút trong game ÷ (thời lượng thật tính bằng giây)` phút.
- Hiển thị trên HUD Bán hàng: đồng hồ dạng `06:03`, chạy tăng dần từ giờ mở đến giờ đóng, làm tròn xuống phút, cập nhật mỗi ~0.5 giây thật (không cần mỗi frame).
- Giữ thêm 1 thanh tiến trình mỏng (không hiện số giây) để người chơi vẫn cảm nhận trực quan thời gian còn lại.
- **Đồng hồ chỉ để hiển thị**, không ảnh hưởng tốc độ khách đến, tốc độ nướng sườn hay công thức tính điểm — các phần đó vẫn tính theo giây thật (mục 4, 5).
- Đổi giờ mở/đóng hoặc thời lượng thật trong Cài đặt chỉ áp dụng từ ngày bán **tiếp theo**, không đổi giữa chừng ngày đang bán.

## 16. Cài đặt (tab ⚙️)

| Mục | Loại | Ghi chú |
|---|---|---|
| Âm thanh | Bật/Tắt | Lưu vào state, mặc định bật |
| Giờ mở quán | Chọn trong 5:00–23:00 | Bước 1 giờ, mặc định 5:00, phải nhỏ hơn giờ đóng |
| Giờ đóng quán | Chọn trong 5:00–23:00 | Bước 1 giờ, mặc định 23:00, phải lớn hơn giờ mở |
| Thời lượng bán mỗi ngày | Chọn 3/4/5/6 phút | Áp dụng từ ngày tiếp theo |
| ID sao lưu | Hiển thị chuỗi + nút "Sao chép" | Thực chất là mã base64 chứa toàn bộ save, KHÔNG phải ID tra cứu trên server (game không có server) |
| Nhập ID sao lưu | Ô nhập + nút "Khôi phục" | Dán mã, xác nhận trước khi ghi đè save hiện tại |
| Chơi lại từ đầu | Nút + hộp thoại xác nhận | Xoá save, quay về màn Đặt tên quán |

## 17. Sổ doanh thu (tab 📊 Doanh thu)

- Danh sách các ngày đã qua, mới nhất trên đầu: ngày, lời/lỗ (xanh/đỏ), sao ngày đó.
- Chạm vào 1 dòng để xem chi tiết — dùng lại đúng bố cục màn Tổng kết (doanh thu, tiền boa, chi phí, thuê mặt bằng, khách phục vụ/bỏ đi).
- Lưu tối đa 30 ngày gần nhất trong localStorage.
- Bản đầu chỉ cần dạng danh sách/bảng, chưa cần biểu đồ.

## 18. Hướng dẫn chơi (tutorial)

- 4 thẻ popup, mỗi thẻ 1 ý: (1) Nướng sườn, (2) Nhận đơn, (3) Lắp đĩa, (4) Giao hàng. Nút chính "Tiếp"; nút phụ "Bỏ qua" dạng chữ gạch chân, không phải nút to.
- Luồng lần đầu: Start → "Chạm để vào" → Hướng dẫn (4 thẻ) → Đặt tên quán → tab Quán ngày 1.
- Người chơi cũ: màn Start có thêm link chữ "Hướng dẫn" (gạch chân) dưới nút chính; bấm vào mở lại đúng 4 thẻ, xong quay về Start (không hiện lại màn Đặt tên quán).
- Trạng thái "đã xem hướng dẫn lần đầu" lưu trong state để không tự bật lại cho người chơi cũ.

## 19. Menu tạm dừng khi đang Bán hàng (nút ☰ góc trên bên trái)

- Vị trí: icon ☰ ở góc trên bên trái HUD, luôn hiện suốt màn Bán hàng.
- Chạm vào: **tạm dừng toàn bộ vòng lặp game** (đồng hồ giờ ảo, spawn khách, độ chín sườn, thanh kiên nhẫn — tất cả đứng lại), hiện overlay menu gồm:
  1. **Tiếp tục bán** — đóng menu, chạy tiếp đúng chỗ vừa dừng.
  2. **🔊/🔇 Âm thanh** — bật/tắt nhanh, đồng bộ hai chiều với công tắc âm thanh ở tab Cài đặt.
  3. **Đóng cửa sớm** — kết thúc ngày bán ngay lập tức bằng dữ liệu hiện có (khách còn đang xếp hàng/đã tới nhưng chưa giao coi như bỏ đi, không trừ thêm điểm ngoài quy tắc "khách bỏ đi" ở mục 4); chuyển thẳng sang Tổng kết như kết thúc bình thường, vẫn lưu vào Sổ doanh thu. Có hộp xác nhận ngắn: "Đóng cửa sớm? Khách đang chờ sẽ bỏ đi." Đây là tính năng thật cho người chơi (ví dụ hết nguyên liệu, muốn dừng sớm để tránh rủi ro), không phải nút chỉ để test.
  4. **Thoát về Chuẩn bị** — huỷ toàn bộ ngày đang bán: không tính doanh thu ngày đó, không lưu vào Sổ doanh thu, không tăng biến ngày, không trừ tiền thuê mặt bằng của ngày đó. Quay lại tab Chuẩn bị với đúng tiền/tồn kho/tiến độ trước khi vào bán. Có hộp xác nhận rõ ràng: "Thoát sẽ MẤT toàn bộ tiến trình ngày hôm nay, bạn có chắc không?". Dùng khi bấm nhầm hoặc cần test nhanh.
- Khi menu đang mở, game coi như đang tạm dừng — giống hệt lúc tab trình duyệt bị ẩn (mục iOS trong AGENTS.md).


## 20. Việc để dành sau (backlog, chưa lên prompt ngay)

Nhóm này để sau khi M13-M17 (mục 21-25) đã chạy ổn định và chơi thử thấy thật sự cần. **Chưa chốt số liệu**, chỉ ghi tên để nhớ hướng, tránh lập sẵn "lộ trình 30 mốc" khi chưa biết game thật sự thiếu gì:

- Nhiệm vụ ngày/tuần, Thành tựu, Sổ tay khách hàng, Streak (chuỗi ngày chơi) — nhóm giữ chân ngắn hạn, có thể là mốc tiếp theo sau M17 nếu vẫn muốn làm thêm.
- Mặt bằng/phương tiện theo bậc (xe đẩy → xe lớn → quán nhỏ → mặt tiền), Danh tiếng (khác Sao — tích lũy dài hạn, không giảm nhanh như sao) — progression trung-dài hạn.
- Khách quen nâng cao (nhớ theo từng khách cụ thể, không chỉ theo loại khách như mục 25), đơn online/Shipper đặt trước, đơn đặt đoàn.
- Sự kiện theo lịch Việt Nam (Tết, mùa mưa, World Cup...) — mở rộng thêm cho mục 9.
- Chi nhánh, thương hiệu, "câu chuyện Cô Ba" theo mốc ngày, New Game+.
- **Rõ ràng KHÔNG làm** (cả nguồn tham khảo đều đồng ý): thuế/điện/nước/gas riêng lẻ, bảo hiểm thực phẩm, thanh tra VSATTP định kỳ, mất trộm/cướp, mệt mỏi nhân vật, vay ngân hàng có lãi, cơ chế may rủi trả phí. Những thứ này biến game bán cơm vui vẻ thành game kế toán/rủi ro, không hợp quy mô dự án.


## 21. Tab ⭐ Đánh giá

- Vị trí: thêm vào tab Doanh thu dưới dạng 2 tab con "Doanh thu | Đánh giá" (không tách thành tab thứ 5 ở bottom nav, để tránh 5 tab chật trên iPhone).
- **Phân bố sao (tích lũy toàn bộ, không giới hạn)**: 5 bộ đếm số lượng đánh giá 1-5 sao, tăng dần mỗi khi có đơn hoàn tất (kể cả khách bỏ đi = 1 sao). Hiện dạng thanh ngang (5★...1★) + tổng số đánh giá + điểm trung bình toàn thời gian (khác với "Sao quán" ở mục 7 vốn chỉ tính 20 đánh giá gần nhất).
- **Danh sách đánh giá gần đây**: lưu tối đa 30 đánh giá gần nhất (mới nhất trên đầu) để không phình localStorage. Mỗi dòng gồm: tên khách giả + icon loại khách, số sao, 1 câu bình luận, món đã gọi rút gọn (dùng chữ theo mục 25).
- **Lọc**: 3 nút chip "Tất cả / 5★ / ≤2★" (đơn giản hơn bản đề xuất ban đầu, đủ dùng).
- **Tên khách giả**: chọn ngẫu nhiên từ danh sách 15 tên Việt Nam đặt trong `data.js` (ví dụ: Nguyễn Minh, Trần Quốc Anh, Lê Hoàng Nam, Phạm Gia Hân, Mai Thảo, Đỗ Thanh Tùng, Vũ Ngọc Lan, Bùi Anh Khoa, Hoàng Bảo Trân, Phan Đức Huy, Trương Mỹ Linh, Đặng Quang Vinh, Ngô Thu Hà, Lý Gia Bảo, Đinh Nhật Nam) — không dùng tên người thật.
- **Câu bình luận theo lý do** — mỗi đơn khi hoàn tất được gắn 1 lý do chính theo thứ tự ưu tiên: khách bỏ đi > sai/thiếu món > sườn hơi cháy > giá quá mắc (mục 24) > kiên nhẫn thấp lúc giao > mặc định (ổn). Mỗi lý do có 2-3 câu mẫu đặt sẵn trong `data.js` (khoảng 12-15 câu tổng cộng), ví dụ:
  - Bỏ đi: "Trời ơi, đơn đâu rồi?" / "Chờ lâu quá, thôi con đi chỗ khác."
  - Sai/thiếu món: "Cô ơi con gọi thêm trứng mà đâu rồi?"
  - Sườn hơi cháy: "Cơm ngon mà sườn hơi khét."
  - Giá mắc: "Ngon nhưng hơi mắc."
  - Ổn/tốt: "Sườn nướng ngon nha, phục vụ nhanh!" / "Ngon, mai quay lại!"
- Không làm review generator phức tạp nhiều biến — mỗi đơn chỉ chọn 1 lý do chính, tránh phải soạn hàng trăm tổ hợp câu.

## 22. Kho nguyên liệu: hao rõ ràng + đổ bỏ

Không làm hệ thống hạn dùng theo từng lô hàng (phức tạp, cần theo dõi ngày mua từng đợt) — tận dụng luật hao đã có ở mục 3, chỉ làm rõ hơn cho người chơi thấy và cho họ chủ động xử lý:

- Ở tab Chuẩn bị, mỗi nguyên liệu hiện thêm dòng cảnh báo hao dự kiến qua đêm, tính từ tồn kho hiện tại và luật ở mục 3:
  - Còn tồn kho, chưa có Tủ lạnh, là sườn hoặc chả: 🟠 "Qua đêm sẽ hao X phần" (X = làm tròn xuống 50% tồn kho hiện tại).
  - Còn tồn kho, đã có Tủ lạnh, hoặc là món khác không bị hao: 🟢 "Không hao qua đêm".
  - Tồn kho = 0: không hiện dòng này.
- Thêm nút **"Đổ bỏ"** cạnh mỗi nguyên liệu: mở ô nhập số lượng muốn đổ (tối đa = tồn kho hiện tại), xác nhận thì trừ thẳng khỏi tồn kho, không hoàn tiền. Dùng khi người chơi biết chắc sẽ ế và muốn chủ động dọn trước thay vì để hao tự động.

## 23. Mua nguyên liệu theo số lượng tùy chọn

Thay nút "Mua lố 10" cố định bằng chọn số lượng:

- 3 nút nhanh: **1 / 5 / 10**, cộng nút **"Tùy chỉnh"** mở ô nhập số.
- Hiện ngay thành tiền = số lượng × giá vốn/phần, và tồn kho dự kiến sau khi mua.
- Nút "Mua" bị vô hiệu nếu thành tiền vượt quá tiền hiện có.
- Giá mỗi phần giữ nguyên theo mục 3 dù mua số lượng bao nhiêu (không làm chiết khấu số lượng, giữ đơn giản).
- Chưa cần trần kho tối đa ở mốc này (để dành cho hệ mặt bằng ở backlog mục 20 nếu sau này cần).

## 24. Tự chỉnh giá bán

Đây là hệ thống mới lớn nhất trong đợt này. Dùng **giá đại diện của món Cơm tấm** (món bắt buộc có trong mọi đơn) để tính ảnh hưởng chung, tránh phải tính riêng cho từng món:

- Ở tab Chuẩn bị, mỗi món trong mục 3 có thêm ô chỉnh giá bán, bước 1.000đ, giới hạn từ 50% đến 200% giá bán gốc trong bảng mục 3 (không cho chỉnh ra ngoài khung này).
- Gọi `p = giá bán hiện tại của Cơm tấm ÷ 15.000` (15.000 là giá gốc Cơm tấm ở mục 3).
- **Nhãn cảnh báo** hiện cạnh mỗi món đang chỉnh giá (so giá món đó với giá gốc riêng của nó, không phải p chung):
  - tỉ lệ ≤ 0.7: 🟢 "Giá mềm"
  - 0.7 – 1.15: không hiện nhãn (giá bình thường)
  - 1.15 – 1.4: 🟡 "Hơi mắc"
  - > 1.4: 🔴 "Quá mắc"
- **Ảnh hưởng số khách đến** (áp dụng vào công thức khoảng cách khách ở mục 4): nhân thêm hệ số giá `heSoGia = clamp(1 + (1 - p) × 0.6, 0.6, 1.3)`. Ví dụ p=1 (giá gốc) → hệ số 1 (không đổi); p=0.7 → 1.18 (đông hơn); p=0.5 → 1.3 (chặn trần, đông tối đa); p=1.4 → 0.76 (thưa hơn); p≥1.7 → 0.6 (chặn sàn, thưa tối đa).
- **Ảnh hưởng sao**: nếu giá món nào đó trong đơn có tỉ lệ so với giá gốc riêng > 1.3, thì trừ thêm 1 sao vào kết quả đã tính ở mục 7 (tối thiểu 1 sao, không trừ xuống dưới 1). Giá rẻ hơn giá gốc KHÔNG được cộng thêm sao.
- Lợi nhuận/phần vẫn tính đơn giản: giá bán hiện tại − giá vốn (mục 3), không đổi công thức.
- Đổi giá chỉ áp dụng từ ngày bán tiếp theo, không đổi giữa chừng ngày đang bán (giống luật ở mục 15).

## 25. Order bằng chữ + câu thoại + khách quen cơ bản

- **Đổi cách hiển thị order**: thay dãy icon món bằng 1 dòng chữ ngắn liệt kê tên món chính trước, món phụ sau, ví dụ "Cơm sườn bì + trứng", "Cơm sườn + trà đá". Giữ 1 icon nhỏ đại diện (sườn nếu có, không thì cơm) đặt trước dòng chữ.
- **Câu thoại khi khách xuất hiện**: mỗi loại khách (mục 4) có 2-3 câu thoại mẫu đặt trong `data.js`, hiện dạng bong bóng thoại nhỏ phía trên đầu khách khi khách vừa tới, ví dụ:
  - Học sinh: "Cô ơi cho con cơm sườn bì, thêm miếng trứng nha!"
  - Dân văn phòng: "Cô cho con cơm sườn chả, thêm trà đá."
  - Bác tài xế: "Cô làm con phần sườn nhiều cơm nha, lẹ giúp cô!"
  - Khách du lịch: "Cho em một phần cơm sườn với trà đá ạ!"
  - Shipper: "Đơn giao gấp giùm em, cơm sườn 2 phần!"
- **Khách quen (bản đơn giản, theo loại khách chứ không theo từng khách cá nhân)**: đếm số lần mỗi loại khách được phục vụ đạt từ 4 sao trở lên (bộ đếm riêng cho từng loại, lưu trong state, không giới hạn). Từ lần thứ 5 trở đi, mỗi lượt loại khách đó xuất hiện có 20% cơ hội là "khách quen": thêm nhãn nhỏ "Khách quen" trên bong bóng đơn, kiên nhẫn +10%, tiền boa +5 điểm phần trăm so với mục 4. Không cần lưu ID từng khách cụ thể, giữ đơn giản.
