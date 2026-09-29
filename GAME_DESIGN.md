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

Làm sau khi 4 tab chính + đồng hồ ảo + cài đặt đã chạy ổn định:

- **Tab ⭐ Đánh giá**: phân bố số sao + vài câu bình luận mẫu gắn theo mức sao (mục 7).
- **Thành tựu**: mốc như "phục vụ khách đầu tiên", "đạt 5.0 sao", "kiếm 500.000đ".
- **Nhiệm vụ ngày**: 1-2 nhiệm vụ nhỏ mỗi ngày, thưởng tiền nhỏ.
- **Sổ tay khách hàng**: mô tả từng loại khách, mở khoá dần theo ngày.
- **Không làm "Level quán"**: hệ thống ngày + tiền + sao + nâng cấp + khách mới đã đủ tạo cảm giác tiến triển, thêm level dễ gây rối mà chưa rõ giá trị.
