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
- **Lương nhân viên** mỗi ngày (trừ lúc tổng kết, cộng riêng với tiền thuê mặt bằng): xem mục 38.
- Nếu tiền < 0 và không còn nguyên liệu: cho vay 1 lần duy nhất 100.000đ ("Cô Ba cho mượn"). Lần 2 thì Game Over (có nút chơi lại).

## 3. Thực đơn và nguyên liệu

Mỗi đơn khách = 1 đĩa cơm tấm + các món thêm. Cơm và đồ chua luôn có.

| Mã | Món | Giá bán | Giá vốn/phần | Ghi chú |
|---|---|---|---|---|
| com | Cơm tấm (đĩa) | 15.000 | 3.000 | Bắt buộc, có kèm đồ chua |
| suon | Sườn nướng | +20.000 | 9.000 | Phải nướng trên vỉ |
| bi | Bì | +8.000 | 2.500 | Lấy ngay |
| cha | Chả trứng | +10.000 | 3.500 | Mở khóa bằng nâng cấp |
| trung | Trứng ốp la | +7.000 | 2.500 | Lấy ngay |
| canh | Canh khổ qua | +5.000 | 1.500 | Mở khóa cùng chả |
| mamcay | Nước mắm cay | +0 | 500 | Xem mục 29 |
| mamthuong | Nước mắm thường | +0 | 500 | Xem mục 29 |

**Đồ uống** (trà và các loại nước giải khát khác) chuyển sang tab con "Nước" riêng — xem mục 33, không còn nằm trong bảng này.

Mua nguyên liệu theo **lố 10 phần** (giá = giá vốn × 10, riêng số lượng tùy chỉnh xem mục 23). Tồn kho hiển thị số phần.

**Tồn kho qua đêm**: sườn và chả còn dư mất 50% (làm tròn xuống) nếu chưa mua Tủ lạnh. Các món khác giữ nguyên.

## 4. Khách hàng

Số khách mỗi ngày (trước khi áp dụng heSoSao, heSoGia, bảng hiệu): `ngày ≤ 10 ? 10 + 2 × (ngày - 1) : min(60, 28 + (ngày - 10))`, đến rải trong suốt thời lượng bán (theo giây thật, không phụ thuộc đồng hồ ảo ở mục 15). Nghĩa là tăng đều +2/ngày tới ngày 10 (đạt 28), sau đó tăng chậm lại +1/ngày, chặn trần ở 60 (đạt ở ngày 42). Thay cho công thức cũ chặn cứng ở 30 từ ngày 11 — mục đích để người chơi lâu năm vẫn thấy quán "ngày càng đông" thay vì đứng yên mãi ở một mức.

Khoảng cách giữa 2 khách (giây) = `(thời lượng bán giây / số khách) / (1 + bonus bảng hiệu) / heSoSao / heSoGia`.

- `heSoGia`: hệ số giá bán, công thức ở mục 24.
- `heSoSao`: hệ số theo Sao quán hiện tại, **thay thế hoàn toàn** công thức `(1.4 - 0.1 × sao)` bản cũ — xem mục 26 để biết bảng hệ số cụ thể.

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

1. Chạm vào khách để chọn đơn đang phục vụ (đơn hiện dạng chữ ngắn, mục 25). Đơn có gắn loại phục vụ 🍽 Tại quán hoặc 🥡 Mang đi (mục 28).
2. Bước đầu tiên bắt buộc: chạm **🍽 Dĩa** hoặc **📦 Hộp** đúng theo loại phục vụ của khách (mục 28). Nếu khách mang đi, sau đó bắt buộc chạm thêm **🛍 Bọc** trước khi các nút món khác dùng được (mục 28).
3. Lắp món: chạm nút món trong khay dưới (cơm, bì, trứng, chả, canh, nước mắm cay/thường theo mục 29, nước giải khát theo mục 33). Sườn lấy từ vỉ (miếng đã nhấc). Mỗi nút món hiện kèm số tồn kho (mục 27); món cần cho đơn đang chọn có viền xanh gợi ý (mục 27).
4. Nếu phát hiện đơn cần món đã hết sạch không cách nào có được, dùng nút **⚠️ Báo hết món** thay vì cố giao (mục 30).
5. Nút **Giao** bật khi đĩa/hộp đủ món. Giao sai/thiếu món (bao gồm sai dĩa/hộp, thiếu bọc, sai/thiếu nước mắm theo yêu cầu) vẫn được giao nhưng khách chấm thấp theo mục 7 và mục 37.
6. Nút **Đổ đĩa** để làm lại (mất nguyên liệu đã dùng, không mất lượt chọn dĩa/hộp).

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
- **Trường hợp đặc biệt — giao mà không làm món nào (0 món khớp với order, kể cả chưa thêm cả Cơm)**: KHÔNG áp dụng bảng trên. Khách từ chối nhận, không trả bất kỳ khoản tiền nào (không phải 0.5× như 1-2 sao bình thường), KHÔNG cộng vào bộ đếm "Khách phục vụ" mà cộng vào bộ đếm "Khách bỏ đi" (cùng nhóm với hết kiên nhẫn ở mục 4), tính 1 sao kèm bình luận phàn nàn ở tab Đánh giá (mục 21, dùng lại đúng nhóm câu "bỏ đi" đã có). Ranh giới: chỉ cần có ít nhất 1 món khớp đúng với order (kể cả chỉ riêng Cơm) thì tính theo bảng bình thường ở trên, không rơi vào trường hợp đặc biệt này.

## 8. Nâng cấp (tất cả mua ở tab Chuẩn bị)

| Nâng cấp | Giá | Hiệu quả | Giới hạn |
|---|---|---|---|
| Vỉ nướng lớn | 150.000 / 300.000 | 4 → 6 → 8 ô | 2 cấp |
| Quạt than | 200.000 | Sườn chín nhanh hơn 20% (6.4s) | 1 cấp |
| Bảng hiệu đèn led | 250.000 | Khách đến nhiều hơn 15% | 1 cấp |
| Quạt máy | 300.000 | Kiên nhẫn khách +15% | 1 cấp |
| Tủ lạnh | 350.000 | Sườn/chả không hao qua đêm | 1 cấp |
| Mở món Chả + Canh | 150.000 | Thêm 2 món vào menu | 1 cấp |
| Nhân viên Nướng | 350.000 | Tự nhấc sườn chín khỏi vỉ (mục 38) | 1 cấp |
| Nhân viên Làm món | 350.000 | Tự lắp giúp 1 món mỗi 10s (mục 38) | 1 cấp |
| Tủ nước giải khát | 280.000 | Mở khóa Xá xị Cô Ba, Cam ép, Sữa đậu nành (mục 33) | 1 cấp |

## 9. Sự kiện ngẫu nhiên (làm ở **M11**, vẫn PAUSED)

Mỗi ngày từ ngày 3 có 30% xảy ra 1 sự kiện (hiện thông báo lúc bắt đầu ngày):

- **Trời mưa**: khách -30%, shipper x2.
- **Tan học**: học sinh x2 trong 30 giây đầu.
- **Cúp điện**: quạt máy/đèn tắt, kiên nhẫn -15%.
- **Có người khen trên mạng**: khách +25%, cần đủ sườn.

Lưu ý: sự kiện "Tăng giá sườn" trước đây đặt ở đây đã **tách riêng thành mục 34** (biến động giá vốn) vì làm được ngay, không cần chờ toàn bộ hệ sự kiện ở mục này.

## 10. Màn hình (cập nhật cấu trúc điều hướng)

1. **Bắt đầu**: chạm để vào. Lần đầu → Hướng dẫn → Đặt tên quán → tab Quán ngày 1. Lần sau → thẳng tab Quán.
2. **Hướng dẫn** (popup 4 thẻ, mục 18). Có thể mở lại từ màn Start (link chữ gạch chân) mà không hiện lại màn Đặt tên quán.
3. **Đặt tên quán** (chỉ hiện lần đầu, mục 13).
4. **Quán** (tab 🏠, dashboard): tên quán, sao, ngày, tiền, nút "Mở bán".
5. **Chuẩn bị** (tab 🍚): 4 tab con **Nguyên liệu | Nâng cấp | Giá bán | Nước** (mục 32, 33), nút "Mở bán".
6. **Bán hàng**: HUD gồm tiền, đồng hồ giờ ảo (mục 15), sao, nút ☰ menu tạm dừng (mục 19) ở góc trên bên trái; hàng khách; vỉ nướng; khay; nút món; Giao/Đổ đĩa. **Không hiện bottom nav.** Không có nút thoát trực tiếp trên màn hình — mọi cách thoát/tạm dừng đều đi qua menu ☰.
7. **Tổng kết**: dữ liệu đúng của ngày vừa bán, khớp với ngày đang hiện ở HUD trước đó (xem lưu ý bug ở dưới). Nút "Qua ngày mới" mới tăng biến ngày, sau đó quay lại tab Quán/Chuẩn bị và hiện lại bottom nav.
8. **Sổ sách** (tab 📊): Doanh thu + Đánh giá (mục 17, 21).
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
  - 📊 **Sổ sách** — 2 tab con: Doanh thu (mục 17) | Đánh giá (mục 21). (Nhãn bottom nav: "Sổ sách".)
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
  3. **Đóng cửa sớm** — dừng ngay việc sinh khách mới, nhưng **không** chuyển Tổng kết ngay nếu còn khách đang đợi/đang chọn — áp dụng đúng luật "phục vụ hết khách đang có" ở mục 31 (khác bản thiết kế cũ: không còn coi khách đang chờ là bỏ đi ngay lập tức). Có hộp xác nhận ngắn: "Đóng cửa sớm? Sẽ không nhận khách mới, nhưng vẫn phục vụ hết khách đang chờ." Đây là tính năng thật cho người chơi (ví dụ hết nguyên liệu, muốn dừng sớm để tránh rủi ro), không phải nút chỉ để test.
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

- Vị trí chỉnh giá, khung nhập (0đ – 1.000.000đ) và cách nhập (gõ số trực tiếp) nay theo mục 32 (tab Giá bán riêng), thay cho bản cũ "chỉnh ngay trong tab Nguyên liệu, giới hạn 50-200% giá gốc, bước 1.000đ".
- Gọi `p = giá bán hiện tại của Cơm tấm ÷ 15.000` (15.000 là giá gốc Cơm tấm ở mục 3).
- **Nhãn cảnh báo** hiện cạnh mỗi món đang chỉnh giá (so giá món đó với giá gốc riêng của nó, không phải p chung):
  - tỉ lệ ≤ 0.7: 🟢 "Giá mềm"
  - 0.7 – 1.15: không hiện nhãn (giá bình thường)
  - 1.15 – 1.4: 🟡 "Hơi mắc"
  - > 1.4: 🔴 "Quá mắc"
  - = 0đ: nhãn riêng "FREE" thay cho 4 mức trên (xem mục 32).
- **Ảnh hưởng số khách đến**: tính hệ số giá `heSoGia = clamp(1 + (1 - p) × 0.6, 0.6, 1.3)`, dùng để **chia** vào công thức khoảng cách khách ở mục 4 (không phải nhân — khớp với công thức chia đã cập nhật ở mục 4 và mục 26). Ví dụ p=1 (giá gốc) → hệ số 1 (không đổi); p=0.7 → 1.18 (chia cho 1.18 → khoảng cách ngắn hơn → đông hơn); p=0.5 → 1.3 (chặn trần); p=1.4 → 0.76 (khoảng cách dài hơn → thưa hơn); p≥1.7 → 0.6 (chặn sàn).
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

## 26. Sao quán ảnh hưởng số lượng khách

- Thêm hệ số `heSoSao` dựa trên "Sao quán" hiện tại (mục 7, trung bình 20 đánh giá gần nhất), dùng **chia** vào công thức khoảng cách khách ở mục 4 — cùng vị trí và cùng cách heSoGia đang hoạt động (mục 24), không phải một hệ thống riêng.
- Bảng hệ số:
  | Sao quán | heSoSao | Hiệu ứng ví dụ (base 10 khách) |
  |---|---|---|
  | ≥ 4.5 | 1.25 | ~12-13 khách |
  | 4.0 – 4.49 | 1.0 | ~10 khách (không đổi) |
  | 3.0 – 3.99 | 0.9 | ~9 khách |
  | 2.0 – 2.99 | 0.8 | ~8 khách |
  | < 2.0 | 0.7 | ~7 khách |
- Cố ý chọn mức thay đổi nhẹ (không giảm/tăng quá 30%) để không làm người chơi nản khi sao thấp — đúng yêu cầu ban đầu.
- Công thức đầy đủ ở mục 4 sau khi có cả heSoGia và heSoSao: `khoảng cách = (thời lượng bán giây / số khách) / (1 + bonus bảng hiệu) / heSoSao / heSoGia`.

## 27. Hiển thị tồn kho + gợi ý nguyên liệu cần khi Bán hàng

- Mọi nút món trong khay ở màn Bán hàng (cơm, sườn, bì, trứng, chả, canh, nước mắm, nước giải khát) hiện dạng "Tên (số tồn kho)", không chỉ riêng sườn như trước.
- Khi 1 khách đang được chọn: các nút món mà đơn của khách đó còn cần (theo order dạng chữ ở mục 25) có viền xanh nổi bật (ví dụ `border: 2px solid #6aa84f` hoặc `box-shadow` xanh lá). Món khách không gọi hoặc đã lắp đủ số lượng cần thì giữ viền thường.
- Highlight cập nhật lại ngay khi: đổi khách đang chọn, hoặc vừa lắp thêm 1 món vào đĩa/hộp.

## 28. Ăn tại quán / Mang đi

- Mỗi khách khi xuất hiện được gán ngẫu nhiên loại phục vụ: 🍽 **Tại quán** (60%) hoặc 🥡 **Mang đi** (40%). Hiện icon loại phục vụ nhỏ trên bong bóng đơn của khách.
- Bước đầu tiên bắt buộc khi bắt đầu lắp đơn (thay cho khái niệm "đĩa trống" cũ): chạm nút **🍽 Dĩa** hoặc **📦 Hộp**. Chỉ sau khi chọn đúng loại, các nút món khác mới bấm được.
- Nếu khách Mang đi: sau khi chọn Hộp, phải chạm thêm nút **🛍 Bọc** (coi như 1 thao tác bắt buộc, không tốn nguyên liệu, không cộng/trừ tiền) trước khi Giao được kích hoạt.
- Nếu giao sai loại (chọn Dĩa cho khách Mang đi, chọn Hộp nhưng thiếu Bọc, hoặc chọn Hộp cho khách Tại quán) → tính như **sai/thiếu 1 món** ở mục 7 (xem thêm mục 37).
- Không tính thêm chi phí nguyên liệu cho dĩa/hộp/bọc ở bản này — giữ đơn giản.

### Mua và hao Dĩa / Hộp / Bọc (không miễn phí)

- Thêm 3 "nguyên liệu" mới vào tab Nguyên liệu (cùng cơ chế mua/tồn kho ở mục 23 — chip 1/5/10/tùy chỉnh): **Dĩa**, **Hộp**, **Bọc**.
- Giá vốn: Dĩa 2.500đ/cái, Hộp 1.500đ/cái, Bọc 300đ/cái. Không có giá bán riêng (không cộng thêm tiền vào đơn khi dùng) — đây là chi phí vận hành, không phải món bán.
- **Hao khi dùng**:
  - **Hộp**: hao 1 cái mỗi lần dùng cho 1 đơn Mang đi (tiêu hao hoàn toàn, không tái sử dụng).
  - **Bọc**: hao 1 cái mỗi lần dùng cho 1 đơn Mang đi (tiêu hao hoàn toàn).
  - **Dĩa**: tái sử dụng được — chỉ hao 1 cái sau mỗi **5 lần dùng** cho đơn Tại quán. Đếm bằng 1 bộ đếm riêng (`diaUsageCount`, cộng dồn qua các ngày, không reset theo ngày): mỗi lần dùng Dĩa cho 1 đơn thì +1 vào bộ đếm; khi bộ đếm chạm mốc chia hết cho 5 thì trừ 1 cái khỏi tồn kho Dĩa.
- **Hiển thị tồn kho**: cả 3 món hiện số lượng còn lại ở tab Nguyên liệu (màn Chuẩn bị) VÀ cạnh nút 🍽 Dĩa / 📦 Hộp / 🛍 Bọc ở màn Bán hàng, theo đúng kiểu "Tên (số)" đã có ở mục 27.
- **Hết Dĩa/Hộp/Bọc giữa chừng bán hàng**: áp dụng đúng cơ chế "Báo hết món" ở mục 30 — nếu khách Tại quán mà hết Dĩa, hoặc khách Mang đi mà hết Hộp hoặc hết Bọc, nút Dĩa/Hộp/Bọc tương ứng không bấm được, và nút ⚠️ Báo hết món hiện ra cho phép khách bỏ đi không tính sao, giống hệt khi hết nguyên liệu món ăn.

## 29. Nước mắm cay / không cay

- Thêm 2 nguyên liệu mới vào mục 3: **Nước mắm cay** (có ớt) và **Nước mắm thường** (không ớt), giá bán +0đ (miễn phí kèm theo, giống đồ chua), giá vốn 500đ/phần mỗi loại, mua/tồn kho như nguyên liệu khác (mục 23).
- 50% số khách có yêu cầu cụ thể trong order (hiện rõ trong dòng chữ order, mục 25, ví dụ "Cơm sườn + nước mắm cay"), chia đều cay/không cay (25%/25%). 50% còn lại không yêu cầu gì — giao loại nào cũng được, không ảnh hưởng đánh giá.
- Nếu khách có yêu cầu cụ thể mà giao thiếu hoặc sai loại nước mắm → tính như **sai/thiếu 1 món** ở mục 7 (xem mục 37).

## 30. Báo hết món — khách bỏ đi không tính sao

- Kiểm tra khi cần: nếu đơn của khách đang chọn cần 1 món mà **không còn cách nào có được trong ngày hôm đó**:
  - Với nguyên liệu lấy trực tiếp (cơm, bì, trứng, chả, canh, nước mắm, nước giải khát): tồn kho hiện tại = 0.
  - Riêng **sườn**: chỉ tính là hết khi ĐỒNG THỜI tồn kho sườn sống = 0, khay sườn chín = 0, và không còn miếng nào đang trên vỉ (đã đặt nhưng chưa chín) — tức chờ thêm cũng vô ích.
- Khi đúng điều kiện trên, nút **⚠️ Báo hết món** hiện được cạnh nút Đổ đĩa. Bấm vào: hộp xác nhận "Báo hết [tên món] với khách, khách sẽ bỏ đi. Không tính sao/tiền cho đơn này." → đồng ý thì khách rời hàng ngay lập tức.
- Đơn này **không** được tính vào: phân bố sao (mục 21), "Sao quán" (mục 7), hay bộ đếm "Khách bỏ đi" hiện có (do hết kiên nhẫn). Thay vào đó tăng 1 bộ đếm riêng "Khách bỏ đi vì hết món", hiện thành 1 dòng riêng ở Tổng kết và Sổ doanh thu (mục 17): "Khách bỏ đi vì hết món: X" — tách biệt hoàn toàn với dòng "Khách bỏ đi" cũ.

## 31. Hết giờ vẫn phục vụ hết khách đang đợi

- Khi đồng hồ hết giờ **hoặc** người chơi bấm "Đóng cửa sớm" (mục 19): lập tức dừng sinh khách mới, nhưng KHÔNG chuyển sang Tổng kết ngay nếu vẫn còn khách trong hàng đợi hoặc đang được chọn.
- Trong lúc này, HUD thay phần đồng hồ/thanh tiến trình bằng dòng chữ nhỏ "Đang đóng cửa...". Người chơi tiếp tục phục vụ các khách còn lại như bình thường; khách hết kiên nhẫn vẫn bỏ đi đúng luật mục 4 (không được gia hạn thêm kiên nhẫn vì đã hết giờ).
- Khi hàng đợi trống hẳn (0 khách đang đợi, 0 khách đang chọn) → tự động chuyển sang Tổng kết như bình thường.
- Áp dụng thống nhất cho cả 2 trường hợp "hết giờ tự nhiên" và "Đóng cửa sớm" — mục 19 đã cập nhật lại theo đúng luật này (không còn hành vi "khách đang chờ tự bỏ đi ngay" như thiết kế cũ).

## 32. Tab Giá bán riêng (giao diện bảng menu)

- Tách phần chỉnh giá bán ra khỏi tab Nguyên liệu, làm thành tab con thứ 3 trong Chuẩn bị: **Nguyên liệu | Nâng cấp | Giá bán | Nước** (mục 33 là tab con thứ 4).
- Giao diện tab Giá bán: nền tối (đen/nâu đậm) mô phỏng bảng menu quán ăn, chữ trắng/vàng, không cần hình ảnh minh họa — chỉ cần CSS màu nền + font, không cần ảnh nền phức tạp.
- Mỗi dòng: tên món — giá hiện tại — **ô nhập số tùy ý** (không dùng nút +/-, người chơi gõ trực tiếp số tiền mới rồi xác nhận/blur để áp dụng).
- Ràng buộc: tối thiểu **0đ**, tối đa **1.000.000đ**. Nhập ngoài khung này thì tự kẹp về 0 hoặc 1.000.000. Nhập không phải số thì bỏ qua, giữ giá cũ.
- Nếu giá = 0đ: hiện nhãn **"FREE"** thay cho 4 mức nhãn cảnh báo ở mục 24 (món đó khách vẫn nhận được nhưng không cộng doanh thu phần giá món này).
- Đây là nơi duy nhất chỉnh được giá bán (thay cho việc chỉnh ngay trong tab Nguyên liệu ở thiết kế M16 cũ). Các công thức nhãn cảnh báo, `heSoGia`, ảnh hưởng sao vẫn giữ nguyên như mục 24, chỉ đổi giao diện và khung nhập.
- Đổi giá chỉ áp dụng từ ngày bán tiếp theo (không đổi, giữ nguyên luật cũ).

## 33. Tab con "Nước" (đồ uống)

- Tab con thứ 4 trong Chuẩn bị (sau Giá bán). Trà đá chuyển từ tab Nguyên liệu sang đây (vẫn thuộc thực đơn mục 3 về mặt số liệu, chỉ đổi vị trí UI).
- Danh sách nước (đặt tên tránh thương hiệu thật):

| Mã | Tên | Giá bán | Giá vốn/phần | Mở khóa |
|---|---|---|---|---|
| tra | Trà đá | +5.000 | 1.000 | Có sẵn từ ngày 1 |
| xaxi | Xá xị Cô Ba | +10.000 | 4.000 | Nâng cấp "Tủ nước giải khát" (mục 8) |
| camep | Cam ép | +12.000 | 5.000 | Nâng cấp "Tủ nước giải khát" |
| suadau | Sữa đậu nành | +8.000 | 3.000 | Nâng cấp "Tủ nước giải khát" |

- Mua/tồn kho/hao qua đêm áp dụng như nguyên liệu thường (mục 3, 22, 23) — không hao qua đêm trừ khi sau này có luật riêng.
- Sau khi mua nâng cấp "Tủ nước giải khát", cả 3 loại nước mới mở cùng lúc (không mở lẻ từng loại), và có thể xuất hiện trong order ngẫu nhiên như các món khác — không cần công thức tỉ lệ riêng, dùng chung cơ chế chọn món thêm ngẫu nhiên đã có (xem thêm mục 36 về việc đảm bảo chọn đều).

## 34. Biến động giá vốn theo sự kiện (làm được ngay, không cần chờ M11)

Tách riêng khỏi mục 9 (sự kiện ngẫu nhiên đầy đủ, vẫn PAUSED) vì đây là phần nhỏ, làm được độc lập ngay bây giờ:

- Từ ngày 3 trở đi, mỗi ngày có 20% cơ hội xảy ra **đúng 1** trong 2 biến động sau (10%/10%, không xảy ra đồng thời cả hai):
  - **Sườn tăng giá**: giá vốn sườn +30% chỉ trong ngày đó.
  - **Trứng được mùa**: giá vốn trứng −40% chỉ trong ngày đó.
- Hiện thông báo ngắn ở đầu ngày (tab Quán hoặc lúc vào Chuẩn bị): ví dụ "📢 Hôm nay giá sườn nhập vào tăng 30%!".
- **Thứ tự bắt buộc mỗi khi sang ngày mới**: (1) đưa TOÀN BỘ giá vốn về đúng giá gốc ở mục 3/33 trước, (2) sau đó mới roll xem ngày mới có xảy ra biến động hay không, (3) nếu trúng thì mới áp giá vốn mới cho đúng 1 nguyên liệu liên quan. Không được giữ lại hiệu ứng của ngày hôm trước sang ngày hôm sau dưới bất kỳ hình thức nào.
  - Ví dụ bắt buộc đúng: ngày 4 Sườn tăng giá, ngày 5 không trúng sự kiện nào → giá sườn ngày 5 phải về lại đúng giá gốc (không còn +30%).
  - Ví dụ bắt buộc đúng: ngày 4 Sườn tăng giá, ngày 5 trúng Trứng được mùa → giá sườn ngày 5 phải về lại đúng giá gốc (không còn +30%), chỉ có giá trứng ngày 5 giảm 40%; 2 sự kiện của 2 ngày khác nhau không bao giờ cộng dồn.
- Không ảnh hưởng gì khác (không đổi giá bán, không đổi số khách, không đổi sao) — chỉ đổi giá vốn hiển thị và số tiền trừ khi mua ngày hôm đó.
- **Giá gốc dùng để tính nhãn cảnh báo cũng dịch chuyển theo cùng tỉ lệ, chỉ cho món đang bị ảnh hưởng**: khi "Sườn tăng giá" xảy ra, giá gốc dùng để tính nhãn 🟢/🟡/🔴 và ngưỡng trừ sao (mục 24, 32) của riêng món Sườn được nhân thêm cùng % biến động giá vốn ngày đó (`giá gốc hiệu chỉnh = giá gốc gốc × (1 + %biến động)`). Ví dụ: Sườn tăng giá vốn +30% ngày đó → giá gốc hiệu chỉnh của Sườn cũng +30% hôm đó (người chơi tăng giá bán Sườn tương ứng để bù chi phí sẽ KHÔNG bị gắn nhãn "mắc" oan). "Trứng được mùa" (giá vốn -40%) áp dụng tương tự nhưng theo chiều giảm cho món Trứng. Các món không bị sự kiện tác động thì giá gốc giữ nguyên như mục 3.
- Không ảnh hưởng tới `heSoGia` (hệ số khách đến ở mục 24) — hệ số đó vẫn luôn tính theo giá Cơm tấm, và sự kiện ở mục này không tác động tới Cơm tấm.
- Đây là bản rút gọn; các sự kiện ảnh hưởng khách/kiên nhẫn (mưa, tan học, cúp điện, khen trên mạng) vẫn để nguyên trong mục 9, chờ làm cùng M11.

## 35. Combo

- Thêm khu vực "Combo" trong cùng tab Giá bán (mục 32), dưới danh sách món lẻ. Quản lý đầy đủ: **Thêm / Sửa / Xóa** combo, không hard-code sẵn 2-3 combo cố định trong code.
  - Nút "+ Thêm combo" hiện khi chưa đạt giới hạn tối đa **5 combo** cùng lúc. Bấm vào tạo 1 combo mới, tự đặt tên mặc định "Combo [số thứ tự kế tiếp còn trống]" (người chơi đổi tên được, tối đa 20 ký tự).
  - Mỗi combo đã tạo có nút "Sửa" (đổi lại danh sách món, giá, tên) và nút "Xóa" (xóa hẳn, xác nhận trước khi xóa, giải phóng chỗ cho combo khác).
  - Dữ liệu combo lưu dạng mảng trong state (không giới hạn cứng 2 phần tử như bản cũ), chỉ giới hạn độ dài mảng tối đa 5 ở logic thêm mới.
- Mỗi combo: chọn 2-4 món có sẵn (từ mục 3 và mục 33) + tự nhập 1 giá bán trọn gói. **Giá combo bị giới hạn trong khung 50%-100% tổng giá bán lẻ HIỆN TẠI** (theo giá đang áp dụng ở tab Giá bán, mục 32) của các món đã chọn — không được đặt cao hơn mua lẻ cộng lại (mất ý nghĩa combo, dễ lợi dụng để né nhãn giá mắc mà không bị phạt sao) và không được thấp hơn 50% (tránh phá giá vốn quá đà). UI tự hiện tổng giá lẻ tham khảo ngay khi chọn đủ món, kẹp giá nhập về biên nếu vượt khung — dùng đúng cơ chế nhập số + kẹp biên đã có ở mục 32, chỉ đổi khung từ "0-1.000.000" thành "50%-100% tổng giá lẻ". Khung này tính lại mỗi khi hiển thị/lưu combo (nếu người chơi sửa giá lẻ 1 món sau khi đã tạo combo khiến giá combo cũ rơi ra ngoài khung mới, tự kẹp lại combo đó về biên gần nhất).
- Một combo chỉ "bật" (có thể xuất hiện trong order) khi đã chọn đủ ít nhất 2 món và đặt giá hợp lệ.
- Khi khách xuất hiện, nếu có ít nhất 1 combo đang bật: 20% cơ hội khách order thẳng theo tên combo (order hiển thị "Combo 1" thay vì liệt kê từng món). Người chơi lắp đủ các món đã cấu hình trong combo đó rồi giao bình thường; tiền tính theo giá combo đã đặt (không cộng riêng từng món trong đó).
- Nếu tại thời điểm đó combo không đủ điều kiện phục vụ (1 trong các món cấu thành đã hết theo luật mục 30) thì dùng đúng cơ chế "Báo hết món" ở mục 30 (không đánh giá).
- Combo không cần nguyên liệu hay giá vốn riêng — chỉ là gói giá + danh sách món tham chiếu tới mục 3/33.

## 36. Mở rộng bộ dữ liệu mẫu (giảm lặp lại)

Hiểu theo hướng "tăng độ đa dạng dữ liệu có sẵn trong code", không phải thêm loại khách mới:

- Tăng số tên khách giả ở mục 21 từ 15 lên **30 tên** (thêm 15 tên Việt Nam khác vào `data.js`).
- Tăng số câu thoại mỗi loại khách ở mục 25 từ 2-3 câu lên **4-5 câu/loại**.
- Đảm bảo hàm chọn "món thêm" ngẫu nhiên (mục 4) chọn đều trên toàn bộ danh sách món khả dụng tại thời điểm đó (bao gồm cả nước ở mục 33, nước mắm ở mục 29 nếu khách thuộc nhóm có yêu cầu) — không hard-code thiên vị vài món cố định.

## 37. Cập nhật luật đánh giá theo các tính năng mới (mục 26-36)

Tổng hợp lại để không rơi rớt khi code — tất cả đều dùng lại đúng khung đã có ở mục 7 và mục 21, không tạo thang điểm mới:

- **Sai loại phục vụ** (mục 28: nhầm dĩa/hộp, thiếu bọc khi mang đi) → tính như "sai/thiếu 1 món" ở mục 7 (2 sao nếu đây là lỗi duy nhất của đơn).
- **Sai/thiếu nước mắm theo yêu cầu** (mục 29, chỉ tính khi khách có yêu cầu rõ) → tính như "sai/thiếu 1 món" ở mục 7.
- **Combo giao thiếu món cấu thành** (mục 35) → đếm số món thiếu trong combo đó, áp dụng đúng bảng mục 7 (thiếu 1 món = 2 sao, thiếu từ 2 món = 1 sao).
- **Khách bỏ đi vì hết món** (mục 30) → KHÔNG tạo đánh giá, không tính vào mục 7 lẫn mục 21, có bộ đếm riêng như đã nêu ở mục 30.
- **Giao mà không làm món nào** (0 món khớp order) → xem trường hợp đặc biệt đã thêm ở mục 7: không tính tiền, tính vào "Khách bỏ đi" (không phải hết món, không phải "khách phục vụ"), 1 sao phàn nàn.
- Ở tab Đánh giá (mục 21), các lỗi "sai loại phục vụ" và "sai/thiếu nước mắm" xếp chung vào nhóm lý do "sai/thiếu món" đã có sẵn, dùng lại đúng bộ câu bình luận cũ — không cần soạn thêm câu mẫu riêng cho từng lỗi mới.

## 38. Nhân viên (tách "chị Hai" thành 2 vị trí độc lập)

Thay cho nâng cấp "Thuê chị Hai phụ bếp" (1 gói duy nhất) bằng **2 nhân viên mua riêng biệt**, thao tác hoàn toàn độc lập với nhau — mua 1 người không tự mở người kia.

### Nhân viên Nướng — 350.000đ
- Khi đã thuê: tự động nhấc bất kỳ miếng sườn nào vừa đạt ngưỡng chín vàng (60-90%, mục 5) khỏi vỉ, đưa thẳng vào khay sườn — người chơi không cần tự canh giờ nhấc miếng đó nữa (vẫn có thể tự tay xử lý các miếng khác cùng lúc nếu muốn).
- **Cơ chế lỗi**: mỗi miếng do Nhân viên Nướng xử lý có 2% xác suất độc lập bị hỏng thành phế thay vì vào khay bình thường (mất vốn, không cộng khay) — tương đương trung bình cứ khoảng 10 miếng nhân viên xử lý thì có ~20% khả năng gặp 1 miếng hỏng kiểu này. Không thông báo trước, chỉ thấy khay sườn không tăng như mong đợi.

### Nhân viên Làm món — 350.000đ
- Khi đã thuê: mỗi 10 giây tự động lắp giúp 1 món còn thiếu vào đĩa/hộp của khách đang được chọn (ưu tiên món dễ lấy: bì, trứng, cơm, nước mắm, nước giải khát — không tự ý đụng vào sườn).
- **Cơ chế lỗi**: mỗi lần thực hiện 1 thao tác tự lắp, có 1% xác suất độc lập lắp sai (chọn nhầm 1 món khác không thuộc đơn đó) — tương đương trung bình cứ khoảng 10 lần thao tác thì có ~10% khả năng gặp 1 lần lắp sai. Nếu người chơi không phát hiện và sửa bằng nút Đổ đĩa trước khi Giao, đơn đó bị tính sai/thiếu món theo đúng bảng ở mục 7 như lỗi thường — không tạo luật chấm điểm riêng cho lỗi do nhân viên gây ra.

### Lương và cho nghỉ
- Mỗi nhân viên đã thuê tốn **40.000đ/ngày**, trừ lúc Tổng kết (mục 2), cộng dồn nếu thuê cả 2 (tối đa 80.000đ/ngày). Hiện thành dòng riêng "Lương nhân viên" ở Tổng kết và Sổ doanh thu (mục 17), tách biệt với "Thuê mặt bằng".
- Ở tab Chuẩn bị (khu vực nâng cấp, cạnh mỗi nhân viên đã thuê): có công tắc bật/tắt "Cho nghỉ hôm nay" cho từng người, chỉnh riêng lẻ. Ngày nào bật "Cho nghỉ": nhân viên đó không hoạt động ngày đó (không có cơ chế hỗ trợ lẫn cơ chế lỗi), và KHÔNG bị trừ lương ngày đó. Cài đặt "cho nghỉ" chỉ áp dụng cho ngày tiếp theo, giống các thay đổi khác ở Cài đặt (mục 15, 16).
- Mua thêm 1 nhân viên là vĩnh viễn (giống các nâng cấp khác) — "cho nghỉ" chỉ là tạm dừng theo ngày, không phải sa thải/hoàn tiền.

## 39. Đồng bộ save ẩn danh lên Supabase (không tài khoản, không mật khẩu)

> **Trạng thái triển khai:** Bản hiện tại **không** bật đồng bộ cloud (M30 bỏ). Mục này giữ làm đặc tả nếu bật lại sau. Save mặc định: localStorage only.
Mục tiêu: giúp bạn (người phát triển) xem được có ai đang chơi, quán tên gì, chơi tới đâu, và có 1 bản sao lưu ngoài máy người chơi để hỗ trợ khôi phục khi cần — mà KHÔNG bắt người chơi đăng ký/đăng nhập gì cả. Đây vẫn là "lưu local trước", cloud chỉ là bản sao chạy nền.

### Kiến trúc
- 1 bảng duy nhất `game_saves` trên Supabase (dịch vụ có sẵn, gói free đủ dùng: 500MB database, 2GB băng thông/tháng).
- Cột: `anon_id` (text, khóa chính), `shop_name` (text), `day` (int), `money` (bigint), `star` (numeric), `save_blob` (text — chính là chuỗi "ID sao lưu" base64 đã có ở mục 16), `created_at`, `updated_at`.
- Không dùng Supabase Auth, không đăng nhập — chỉ dùng "anon public key" (theo đúng thiết kế của Supabase, key này an toàn để để công khai trong code frontend vì quyền hạn được kiểm soát bằng Row Level Security, không phải bằng giấu key).

### Luồng hoạt động
1. Lần đầu chơi (chưa có `anonId`): sinh `state.anonId = crypto.randomUUID()`, lưu vào state như các field khác (tự động nằm trong "ID sao lưu" khi xuất mã, không cần xử lý thêm).
2. Mỗi lần `saveState()` chạy (đúng các điểm đã có sẵn: sau mua hàng, sau nâng cấp, sau Tổng kết, sau đổi Cài đặt) → lưu localStorage như cũ, ĐỒNG THỜI gọi `syncToCloud()` chạy nền, không chặn UI. Debounce tối thiểu 5 giây giữa 2 lần gọi (gộp lại nếu gọi liên tục).
3. `syncToCloud()` gửi upsert (insert nếu chưa có `anon_id`, update nếu đã có) với đầy đủ các cột ở trên.
4. Lỗi mạng khi đồng bộ: bỏ qua âm thầm, không hiện thông báo lỗi cho người chơi, thử lại ở lần lưu tiếp theo. Không bao giờ chặn hoặc làm chậm trải nghiệm chơi vì lý do mạng.
5. Lúc mở app: KHÔNG gọi cloud để tải — chỉ đọc localStorage như thiết kế cũ, giữ trải nghiệm chơi offline-first.
6. Khi Nhập "ID sao lưu" (mục 16): sau khi giải mã, nếu chuỗi mã đó có `anonId`, dùng lại đúng `anonId` đó để tiếp tục đồng bộ vào đúng dòng cũ trên Supabase (không tạo dòng mới, không phân mảnh dữ liệu cùng 1 người chơi giữa nhiều thiết bị/lần nhập mã).

### Khôi phục khi người chơi mất save
- **Mất save nhưng trình duyệt/localStorage còn nguyên** (ví dụ bug làm hỏng đúng phần save): có thể tự động thử tải lại từ cloud bằng `anonId` đã lưu — cân nhắc làm ở mốc sau nếu cần, bản đầu chỉ cần chiều lưu lên (upload), chưa cần chiều tải xuống tự động để giữ đơn giản.
- **Mất sạch (xoá toàn bộ dữ liệu web, đổi máy không có mã)**: không có cách tự động (vì không có đăng nhập), nhưng bạn có thể vào Supabase, tìm theo `shop_name` (và thời điểm gần đúng), lấy `save_blob`, gửi lại cho người chơi để họ tự dán vào ô "Nhập ID sao lưu". Đây là cải thiện thật so với hiện trạng (hiện tại bạn không có gì để giúp).
- Nên có 1 dòng nhỏ minh bạch trong Cài đặt: "Dữ liệu quán được tự động sao lưu ẩn danh để hỗ trợ khôi phục khi cần." — không thu thập âm thầm mà không thông báo.

### Việc bạn cần tự làm (ngoài phần AI code)
1. Tạo tài khoản Supabase (free), tạo 1 project mới.
2. Vào SQL Editor, chạy đoạn SQL sau để tạo bảng và quyền truy cập:
```sql
create table game_saves (
  anon_id text primary key,
  shop_name text,
  day integer,
  money bigint,
  star numeric,
  save_blob text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table game_saves enable row level security;

create policy "anon insert" on game_saves for insert to anon with check (true);
create policy "anon update" on game_saves for update to anon using (true) with check (true);
create policy "anon select" on game_saves for select to anon using (true);

create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_set_updated_at before update on game_saves
for each row execute function set_updated_at();
```
3. Vào Settings → API, copy "Project URL" và "anon public key", dán vào `js/cloud-config.js`.
4. Xem dữ liệu người chơi bất cứ lúc nào qua Table Editor có sẵn của Supabase — không cần code thêm gì để "xem".

### Giới hạn cần chấp nhận (đánh đổi hợp lý cho 1 game free ẩn danh)
- `anon_id` là UUID ngẫu nhiên 122-bit, thực tế không đoán được, nhưng về lý thuyết ai có đúng chuỗi đó có thể ghi đè dữ liệu dòng đó (vì không có xác thực thật). Chấp nhận được vì không có thông tin nhạy cảm (không email, không mật khẩu, không số điện thoại).
- Không tự động khôi phục nếu người chơi mất sạch dữ liệu VÀ không liên hệ bạn — đây là giới hạn cố hữu của mô hình "không tài khoản".

## 40. Nguyên liệu VIP: Tóp mỡ

- **Điều kiện đủ để mở khóa**: tại ĐÚNG 1 thời điểm kiểm tra, `ngày hiện tại ≥ 15` VÀ `tiền hiện tại ≥ 5.000.000đ` phải cùng đúng — đây là 1 phép kiểm tra gộp (AND) tại cùng một khoảnh khắc, KHÔNG được cài thành 2 cờ riêng rồi gộp sau (ví dụ SAI: lưu "đã từng đạt ngày 15" và "đã từng có 5 triệu" ở hai thời điểm khác nhau rồi coi là đủ điều kiện khi cả hai cờ đều true — như vậy sẽ mở khóa oan cho trường hợp ngày 5 từng có 5 triệu rồi tiêu hết, sau đó ngày 15 tới mà không còn đủ tiền). Đúng theo ví dụ: ngày 14 dù đủ 5 triệu → chưa đủ (ngày chưa tới 15); ngày 15 chưa đủ tiền → chưa đủ; ngày 16 chưa đủ tiền → chưa đủ; ngày 20 đủ tiền → đủ điều kiện.
- Kiểm tra phép AND này tại mọi thời điểm tiền có thể thay đổi (mua hàng, nhận tiền sau đơn, Tổng kết) kể từ ngày 15 trở đi. Việc bắt buộc cả 2 điều kiện đúng cùng lúc khiến "đóng cửa sớm liên tục để đẩy nhanh ngày" mà không bán được gì không còn tác dụng — vẫn phải có tiền thật trong túi đúng lúc đã qua ngày 15.
- **Khi vừa đủ điều kiện lần đầu tiên**: KHÔNG tự động mở khóa ngay. Hiện 1 nút/thông báo nổi bật "🔓 Mở khóa Tóp mỡ" (ví dụ ở tab Quán hoặc đầu tab Chuẩn bị). Nút này giữ nguyên, không tự biến mất kể cả nếu sau đó tiền giảm xuống dưới 5 triệu — nó đại diện cho "cơ hội đã đạt được, chờ xác nhận".
- Người chơi phải **chủ động bấm** nút đó để chính thức mở khóa (không tốn tiền, đây chỉ là bước xác nhận/ăn mừng, giống 1 cột mốc thành tựu). Sau khi bấm: `state.tomMoUnlocked = true` vĩnh viễn, Tóp mỡ trở thành nguyên liệu bình thường trong tab Nguyên liệu — nhập hàng, mua/tồn kho, bán hằng ngày y như các món khác (mục 23), không cần điều kiện gì thêm về sau.
- **Số liệu**: giá vốn 15.000đ/phần, giá bán cộng thêm **7.000đ**/phần khi người chơi tự thêm vào đơn. Hao qua đêm 70% nếu chưa có Tủ lạnh.
- **Cách dùng**: ... tốn 1 phần trong kho + cộng **7.000đ** vào giá đơn đó.
- **Hiệu ứng "quyết định độ ngon"**: nếu đơn có Tóp mỡ và đơn đó đạt từ 3 sao trở lên theo cách chấm bình thường (mục 7, 37), cộng thêm 1 sao (tối đa 5 sao). Đồng thời tiền boa của đơn đó +10 điểm phần trăm so với mức thường (cộng dồn được với bonus khách quen ở mục 25 nếu có).

## 41. Trả lời đánh giá của khách

- Trong tab Đánh giá (mục 21), mỗi đánh giá trong danh sách 30 đánh giá gần nhất có thêm nút "Trả lời" (giống Google Maps). Chạm vào mở ô nhập text ngắn (tối đa ~150 ký tự), lưu lại và hiện thành 1 dòng thụt vào bên dưới đánh giá đó, gắn nhãn "🏪 Chủ quán đã trả lời".
- Chỉ trả lời được các đánh giá còn trong danh sách 30 gần nhất (khi đánh giá bị đẩy ra khỏi danh sách do có đánh giá mới hơn, câu trả lời cũ cũng mất theo — không cần lưu trữ vĩnh viễn).
- **Đây thuần là tính năng hiển thị/nhập vai cho vui, KHÔNG có công thức ảnh hưởng gì tới sao, tiền hay bất kỳ số liệu gameplay nào** — giữ đúng tinh thần đơn giản, tránh tạo thêm 1 hệ thống cân bằng mới không cần thiết. Có thể để trống, sửa lại, hoặc xoá câu trả lời bất cứ lúc nào.

## 42. Gợi ý thêm — Best-seller trong tuần (tùy chọn, không bắt buộc)

- Tab Quán (dashboard) hiện thêm 1 dòng nhỏ: "🔥 Best-seller 7 ngày qua: [tên món]" — món có số lần được giao nhiều nhất trong 7 ngày gần nhất, tính từ dữ liệu order đã có (thêm 1 bộ đếm nhỏ mỗi khi giao đơn thành công, không cần bảng riêng phức tạp).
- Thuần cosmetic, không ảnh hưởng gameplay, chỉ tận dụng dữ liệu đã có sẵn để tạo cảm giác "quán đang sống" mỗi lần mở tab Quán.

## 43. Gợi ý thêm — Mốc thưởng theo số ngày (tùy chọn, không bắt buộc)

- Khi đạt các mốc ngày 7 / 15 / 30 / 50 / 100 (bắt đầu ngày đó), hiện 1 popup chúc mừng ngắn (1-2 câu giọng Cô Ba) kèm thưởng tiền mặt nhỏ: ngày 7: +20.000đ, ngày 15: +50.000đ (trùng đúng mốc mở khóa Tóp mỡ ở mục 40, tạo cảm giác "ngày trọng đại"), ngày 30: +100.000đ, ngày 50: +150.000đ, ngày 100: +300.000đ.
- Dùng lại đúng kiểu thông báo đầu ngày đã thiết kế ở mục 34 (biến động giá vốn) — không cần dựng UI mới.
- Mỗi mốc chỉ thưởng 1 lần duy nhất trong suốt 1 lượt chơi (lưu cờ đã nhận trong state), tránh lặp lại nếu người chơi qua lại ngày đó bằng cách nào đó.
