# GAME_DESIGN.md — "Cơm Tấm Cô Ba"

Game mô phỏng bán cơm tấm vỉa hè Sài Gòn. Chạy trên trình duyệt điện thoại (ưu tiên iPhone), tiếng Việt, chơi dọc, chỉ dùng cảm ứng.

Điểm khác biệt so với các game "bán trà sữa/cá viên": **có vỉ nướng sườn thời gian thực** (canh độ chín, để cháy là phế).

---

## 1. Vòng lặp mỗi ngày

1. **Chuẩn bị**: mua nguyên liệu, mua nâng cấp.
2. **Bán hàng** (120 giây thực): khách đến → gọi món → nướng sườn + lắp đĩa → giao trước khi hết kiên nhẫn.
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

Số khách mỗi ngày: `min(30, 10 + 2 × (ngày - 1))`, đến rải trong 120 giây.

Khoảng cách giữa 2 khách (giây) = `(120 / số khách) × (1.4 - 0.1 × sao) / (1 + bonus bảng hiệu)`.

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
- Độ chín chạy từ 0 → 100 trong **8 giây** (nhanh hơn nếu có Quạt than).
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

## 8. Nâng cấp (tất cả mua ở màn Chuẩn bị)

| Nâng cấp | Giá | Hiệu quả | Giới hạn |
|---|---|---|---|
| Vỉ nướng lớn | 150.000 / 300.000 | 4 → 6 → 8 ô | 2 cấp |
| Quạt than | 200.000 | Sườn chín nhanh hơn 20% (6.4s) | 1 cấp |
| Bảng hiệu đèn led | 250.000 | Khách đến nhiều hơn 15% | 1 cấp |
| Quạt máy | 300.000 | Kiên nhẫn khách +15% | 1 cấp |
| Tủ lạnh | 350.000 | Sườn/chả không hao qua đêm | 1 cấp |
| Mở món Chả + Canh | 150.000 | Thêm 2 món vào menu | 1 cấp |
| Thuê chị Hai phụ bếp | 500.000 | Tự lắp giúp 1 món mỗi 10s (bì/trứng/cơm) | 1 cấp |

## 9. Sự kiện ngẫu nhiên (làm sau, mốc M6)

Mỗi ngày từ ngày 3 có 30% xảy ra 1 sự kiện (hiện thông báo lúc bắt đầu ngày):

- **Trời mưa**: khách -30%, shipper x2.
- **Tan học**: học sinh x2 trong 30 giây đầu.
- **Cúp điện**: quạt máy/đèn tắt, kiên nhẫn -15%.
- **Có người khen trên mạng**: khách +25%, cần đủ sườn.
- **Tăng giá sườn**: giá vốn sườn +30% ngày đó.

## 10. Màn hình

1. **Bắt đầu** (chạm để vào, để mở khóa âm thanh trên iOS).
2. **Chuẩn bị**: 2 tab "Nguyên liệu" và "Nâng cấp", HUD tiền/ngày/sao, nút "Mở bán".
3. **Bán hàng**: trên cùng HUD + đồng hồ 120s, hàng khách (tối đa 4), vỉ nướng ở giữa, khay và nút món phía dưới, nút Giao/Đổ đĩa.
4. **Tổng kết ngày**: bảng thu chi, sao quán, số khách phục vụ/bỏ đi, nút "Qua ngày mới".
5. **Game Over**.

## 11. Lưu game

- localStorage, key `com_tam_save_v1`.
- Lưu sau mỗi lần mua và mỗi lần tổng kết ngày.
- Nút "Xuất mã lưu / Nhập mã lưu" (base64 của JSON) để phòng iOS xóa dữ liệu (làm ở mốc M6).

## 12. Phong cách

- Màu ấm: nền kem `#fdf3e4`, nâu than `#5a3a22`, cam `#f28c28`, xanh lá đồ chua `#6aa84f`.
- Chữ to, nút to (tối thiểu 48px), giọng văn dí dỏm Nam Bộ ("Trời ơi sườn cháy rồi!", "Cô Ba cảm ơn nha!").
- Placeholder ban đầu dùng emoji: 🍚 🍖 🥚 🥒 🍲 🧊 👧 💼 🛵 📷 📦.
