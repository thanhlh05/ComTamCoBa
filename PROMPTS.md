# PROMPTS.md — Bộ prompt theo mốc

Cách dùng: mỗi mốc mở **phiên chat mới** trong Codex/Antigravity, dán đúng 1 prompt. Test xong thì `git commit` rồi mới sang mốc kế.

Đã hoàn thành: M1 → M10, M13 → M23 (gồm heSoSao, tồn kho, dĩa/hộp, nước mắm, báo hết, đóng cửa bán hết queue).
M11/M12 vẫn PAUSED.
Tiếp theo: M24 → M29 (rồi M30+ nếu cần).

---

## 🐞 SỬA GẤP — Lệch ngày ở Tổng kết + dọn nút tạm
```
Đọc AGENTS.md, GAME_DESIGN.md, PROGRESS.md. Sửa 2 việc sau, không làm gì thêm:

1. Lỗi: HUD phía trên màn Tổng kết hiện "Ngày 1" nhưng tiêu đề card lại hiện "Tổng kết ngày 2".
   Nguyên nhân là biến ngày bị tăng lên trước khi hiển thị Tổng kết. Sửa lại: biến ngày chỉ tăng
   khi người chơi bấm "Qua ngày mới", không tăng trước đó. HUD và tiêu đề Tổng kết phải luôn
   đọc cùng một biến ngày tại cùng thời điểm.

2. Gỡ 2 nút tạm "⬅ Về chuẩn bị" và "Tổng kết" đang hiện ngay trong màn Bán hàng (còn sót lại
   từ mốc test M1). Màn Bán hàng chỉ kết thúc khi hết giờ hoặc hết khách, không có nút thoát ngang.

Nghiệm thu: chơi hết ngày 1, kiểm tra Tổng kết ghi đúng "Ngày 1"; màn Bán hàng không còn 2 nút đó.
```

## 🆕 BỔ SUNG — Menu tạm dừng (thay cho 2 nút vừa gỡ)
```
Đọc AGENTS.md, GAME_DESIGN.md (mục 19), PROGRESS.md. Làm mốc này (js/pausemenu.js):
1. Thêm nút ☰ cố định ở góc trên bên trái HUD, chỉ hiện trong màn Bán hàng.
2. Chạm vào ☰: tạm dừng thật sự vòng lặp game (đồng hồ giờ ảo, spawn khách, độ chín sườn,
   thanh kiên nhẫn đều đứng lại — coi như lúc tab bị ẩn), hiện overlay menu gồm 4 mục:
   - "Tiếp tục bán": đóng menu, chạy tiếp đúng chỗ vừa dừng.
   - "🔊/🔇 Âm thanh": bật/tắt nhanh, đồng bộ hai chiều với công tắc âm thanh (nếu tab Cài đặt
     chưa có công tắc thật thì tạm lưu vào state, sẽ nối vào Cài đặt ở mốc M7).
   - "Đóng cửa sớm": hộp xác nhận "Đóng cửa sớm? Khách đang chờ sẽ bỏ đi." → nếu đồng ý thì kết
     thúc ngày ngay bằng dữ liệu hiện có (khách chưa giao coi như bỏ đi theo đúng luật ở mục 4),
     chuyển sang Tổng kết bình thường, vẫn lưu kết quả như một ngày kết thúc tự nhiên.
   - "Thoát về Chuẩn bị": hộp xác nhận rõ ràng "Thoát sẽ MẤT toàn bộ tiến trình ngày hôm nay,
     bạn có chắc không?" → nếu đồng ý thì huỷ hẳn ngày đang bán: không tính doanh thu, không lưu
     Tổng kết, không tăng ngày, không trừ tiền thuê mặt bằng, quay lại tab Chuẩn bị với đúng
     tiền/tồn kho như trước khi bấm "Mở bán".
Nghiệm thu: mở menu giữa lúc đang bán, xác nhận đồng hồ và khách đứng yên; thử cả "Tiếp tục bán",
"Đóng cửa sớm" và "Thoát về Chuẩn bị", mỗi cái phải cho kết quả đúng như mô tả ở trên.
```

## M6 — Tên quán + Bottom nav 4 tab + Tab Quán
```
Đọc AGENTS.md, GAME_DESIGN.md (mục 13, 14), PROGRESS.md. Làm MỐC 6:
1. Tạo js/tutorial.js phần đặt tên quán: sau lần đầu chạm "Chạm để vào" (tạm thời bỏ qua
   phần Hướng dẫn 4 thẻ, sẽ làm ở mốc riêng), hiện màn "Đặt tên quán" (ô nhập, tối đa 20 ký tự,
   không để trống, gợi ý "Cơm Tấm Cô Ba"). Lưu vào state.shopName. Người chơi cũ (đã có save) bỏ qua màn này.
2. Tạo js/nav.js: thanh bottom nav 4 tab (🏠 Quán, 🍚 Chuẩn bị, 📊 Doanh thu, ⚙️ Cài đặt).
   Ẩn hoàn toàn khi đang ở màn Bán hàng, Start, Đặt tên quán. Hiện ở 4 tab và màn Tổng kết
   (Tổng kết vẫn full-screen, nav chỉ xuất hiện lại sau khi bấm "Qua ngày mới").
3. Tạo js/home.js: tab Quán hiện tên quán, sao, ngày, tiền, nút "Mở bán" (chuyển sang màn Bán hàng
   qua đúng luồng Chuẩn bị hiện có, không bỏ qua bước mua nguyên liệu).
4. Tab Doanh thu và Cài đặt: tạm thời chỉ cần khung rỗng có tiêu đề, chưa cần nội dung (làm ở M7, M8).
Nghiệm thu: đặt tên quán lần đầu hoạt động, tên hiện đúng ở tab Quán; chuyển được giữa 4 tab;
bottom nav biến mất khi vào Bán hàng và hiện lại sau Tổng kết.
```

## M7 — Tab Cài đặt + đồng hồ giờ ảo
```
Đọc AGENTS.md, GAME_DESIGN.md (mục 15, 16), PROGRESS.md. Làm MỐC 7 (js/settings.js):
1. Tab Cài đặt: nút bật/tắt âm thanh (lưu state); chọn giờ mở quán và giờ đóng quán, cả hai
   đều trong khung 5:00–23:00 (bước 1 giờ), mặc định mở 5:00 / đóng 23:00. Bắt buộc giờ mở < giờ
   đóng — chặn ngay trên UI, không cho chọn ra ngoài khung hoặc chọn giờ đóng ≤ giờ mở. Thêm
   chọn thời lượng bán mỗi ngày (3/4/5/6 phút, mặc định 3 phút). Mọi thay đổi áp dụng từ ngày
   bán TIẾP THEO, không đổi giữa chừng ngày đang bán.
2. Nút "Chơi lại từ đầu" có hộp thoại xác nhận, xoá save, quay về màn Đặt tên quán.
3. Trong js/service.js: thay hiển thị đếm giây ("119s") bằng đồng hồ giờ ảo theo đúng công thức
   ở mục 15 (tổng phút trong game = (giờ đóng - giờ mở) × 60, chia đều theo thời lượng thật đã
   chọn). Giữ thêm 1 thanh tiến trình mỏng thể hiện thời gian còn lại. Đồng hồ chỉ để hiển thị,
   KHÔNG ảnh hưởng tốc độ spawn khách hay tốc độ nướng sườn — các phần đó vẫn tính theo giây thật.
Nghiệm thu: thử vài cặp giờ mở/đóng hợp lệ (6-22, 7-19...) và vài cặp không hợp lệ (4-22, 5-0)
để chắc UI chặn đúng; vào bán ngày tiếp theo thấy đồng hồ chạy đúng từ giờ mở tới giờ đóng
trong đúng khoảng thời gian thật đã chọn; tắt âm thanh thì không còn tiếng.
```

## M8 — ID sao lưu (xuất/nhập save)
```
Đọc AGENTS.md, GAME_DESIGN.md (mục 16), PROGRESS.md. Làm MỐC 8 (thêm vào js/settings.js):
1. Hiện "ID sao lưu": chuỗi base64 mã hoá toàn bộ localStorage save hiện tại, kèm nút "Sao chép".
   Ghi chú ngắn bên dưới: "Lưu mã này lại để khôi phục trên máy khác".
2. Ô "Nhập ID sao lưu": dán mã, bấm "Khôi phục" → hộp thoại xác nhận sẽ ghi đè save hiện tại →
   nếu đồng ý thì giải mã và ghi đè state, tải lại trang. Nếu mã không hợp lệ thì báo lỗi rõ ràng,
   không làm hỏng save hiện tại.
Nghiệm thu: sao chép mã, xoá save (chơi lại từ đầu), dán mã vào và khôi phục được đúng tiến độ cũ.
```

## M9 — Tab Doanh thu (sổ doanh thu)
```
Đọc AGENTS.md, GAME_DESIGN.md (mục 17), PROGRESS.md. Làm MỐC 9 (js/revenue.js):
1. Sau mỗi lần Tổng kết, lưu thêm 1 bản ghi (ngày, doanh thu, tiền boa, chi phí, thuê mặt bằng,
   lời/lỗ, khách phục vụ/bỏ đi, sao ngày đó) vào mảng lịch sử trong state, giữ tối đa 30 bản ghi
   gần nhất (bản cũ nhất bị xoá nếu vượt quá).
2. Tab Doanh thu: danh sách các ngày, mới nhất trên đầu, mỗi dòng hiện ngày + lời/lỗ (màu xanh/đỏ)
   + sao. Chạm vào 1 dòng mở chi tiết đầy đủ, dùng lại bố cục màn Tổng kết.
Nghiệm thu: chơi qua 3 ngày, tab Doanh thu hiện đủ 3 dòng đúng số liệu, xem chi tiết khớp với
Tổng kết đã hiện lúc đó.
```

## M10 — Hướng dẫn chơi (tutorial 4 thẻ)
```
Đọc AGENTS.md, GAME_DESIGN.md (mục 18), PROGRESS.md. Làm MỐC 10 (js/tutorial.js):
1. 4 thẻ popup: (1) Nướng sườn, (2) Nhận đơn, (3) Lắp đĩa, (4) Giao hàng — icon to, 1-2 câu mô tả
   theo GAME_DESIGN. Nút chính "Tiếp" (nổi bật), nút phụ "Bỏ qua" dạng chữ gạch chân (không phải
   nút to). Sau thẻ cuối, nếu là lần đầu thì chuyển sang màn Đặt tên quán; nếu người chơi cũ chủ
   động mở lại thì quay về Start.
2. Lồng vào luồng lần đầu: Start → "Chạm để vào" → Hướng dẫn (4 thẻ) → Đặt tên quán → tab Quán.
3. Ở màn Start, thêm link chữ "Hướng dẫn" (gạch chân) dưới nút chính, luôn hiện được kể cả người
   chơi cũ, mở đúng 4 thẻ đó.
4. Lưu trạng thái "đã xem hướng dẫn lần đầu" trong state để không tự bật lại cho người chơi cũ.
Nghiệm thu: xoá save, vào lại thấy đúng luồng Hướng dẫn → Đặt tên quán; người chơi cũ bấm link
"Hướng dẫn" ở Start xem lại được mà không bị hỏi đặt tên quán lần nữa.
```

---

M11/M12 vẫn tạm ngưng như quyết định trước. Tiếp tục với 5 mốc dưới đây (M13 → M17) — nhóm này nâng cấp trực tiếp core loop đang có (đánh giá, kho, mua hàng, giá bán, order), chưa cần hệ thống mới như mặt bằng/danh tiếng/chi nhánh. Xem mục 20 GAME_DESIGN.md để biết nhóm nào để dành sau.

## M13 — Tab Đánh giá
```
Đọc AGENTS.md, GAME_DESIGN.md (mục 21), PROGRESS.md. Làm MỐC 13 (js/reviews.js):
1. Thêm 15 tên khách giả và 12-15 câu bình luận mẫu (theo 5 nhóm lý do ở mục 21) vào js/data.js.
2. Mỗi khi một đơn hoàn tất (kể cả khách bỏ đi), xác định 1 lý do chính theo đúng thứ tự ưu tiên ở
   mục 21, chọn ngẫu nhiên 1 tên khách + 1 câu bình luận khớp lý do đó, lưu vào danh sách đánh giá
   (tối đa 30 bản ghi gần nhất, mới nhất lên đầu) VÀ tăng bộ đếm phân bố sao tích lũy (5 bộ đếm
   1-5 sao, không giới hạn số lượng, không dùng chung biến với "Sao quán" mục 7).
3. Trong tab Doanh thu, thêm 2 tab con "Doanh thu | Đánh giá" (không thêm tab thứ 5 ở bottom nav).
   Tab Đánh giá: thanh phân bố 5★...1★ + tổng số đánh giá + điểm trung bình toàn thời gian; danh
   sách 30 đánh giá gần nhất (tên khách + icon loại khách + sao + câu bình luận + món rút gọn);
   3 chip lọc "Tất cả / 5★ / ≤2★".
Nghiệm thu: phục vụ vài đơn với kết quả khác nhau (giao tốt, sai món, khách bỏ đi), vào tab Đánh
giá thấy đúng số liệu và câu bình luận khớp lý do.
```

## M14 — Kho nguyên liệu: hao rõ ràng + đổ bỏ
```
Đọc AGENTS.md, GAME_DESIGN.md (mục 22), PROGRESS.md. Làm MỐC 14 (sửa trong js/prep.js):
1. Mỗi nguyên liệu trong tab Nguyên liệu hiện thêm 1 dòng cảnh báo hao dự kiến qua đêm theo đúng
   luật ở mục 22 (dựa vào luật hao đã có ở mục 3): 🟠 "Qua đêm sẽ hao X phần" cho sườn/chả chưa có
   Tủ lạnh; 🟢 "Không hao qua đêm" cho các trường hợp còn lại. Không hiện dòng này nếu tồn kho = 0.
2. Thêm nút "Đổ bỏ" cạnh mỗi nguyên liệu: mở ô nhập số lượng (tối đa = tồn kho hiện tại), xác nhận
   thì trừ thẳng khỏi tồn kho, không hoàn tiền.
Nghiệm thu: mua sườn, không mua Tủ lạnh, qua ngày mới thấy đúng số hao đã cảnh báo trước đó; dùng
nút Đổ bỏ trừ đúng số lượng chọn.
```

## M15 — Mua nguyên liệu theo số lượng tùy chọn
```
Đọc AGENTS.md, GAME_DESIGN.md (mục 23), PROGRESS.md. Làm MỐC 15 (sửa trong js/prep.js):
Thay nút "Mua lố 10" hiện tại bằng: 3 nút nhanh 1/5/10 + nút "Tùy chỉnh" mở ô nhập số lượng. Luôn
hiện thành tiền (số lượng × giá vốn/phần) và tồn kho dự kiến sau khi mua trước khi bấm nút Mua
cuối cùng. Vô hiệu nút Mua nếu thành tiền vượt tiền hiện có. Giá mỗi phần không đổi theo số lượng.
Nghiệm thu: mua thử 1, 5, 10 và một số tùy chỉnh (ví dụ 37), tồn kho và tiền trừ đúng từng trường hợp.
```

## M16 — Tự chỉnh giá bán
```
Đọc AGENTS.md, GAME_DESIGN.md (mục 24), PROGRESS.md. Làm MỐC 16 (js/pricing.js, nối vào js/prep.js,
js/service.js và công thức spawn khách ở mục 4):
1. Mỗi món trong tab Nguyên liệu/Nâng cấp (chỗ hiện giá bán) có thêm ô chỉnh giá, bước 1.000đ,
   giới hạn 50%-200% giá bán gốc ở mục 3. Hiện nhãn cảnh báo đúng theo 4 mốc ở mục 24 (🟢/không
   nhãn/🟡/🔴), tính riêng theo giá gốc của từng món.
2. Tính `p` theo giá Cơm tấm hiện tại ÷ 15.000, áp dụng công thức `heSoGia` đúng như mục 24 vào
   công thức khoảng cách khách ở mục 4.
3. Khi chấm sao 1 đơn (mục 7): nếu có món nào trong đơn có giá hiện tại > 1.3 lần giá gốc riêng
   của nó, trừ thêm 1 sao vào kết quả đã tính (tối thiểu 1 sao).
4. Đổi giá chỉ áp dụng từ ngày bán tiếp theo, không đổi giữa chừng ngày đang bán.
Nghiệm thu: hạ giá Cơm tấm xuống 70%, thấy khách đến dày hơn rõ rệt ở ngày tiếp theo; tăng giá lên
trên 140%, thấy nhãn 🔴 hiện đúng và sao trung bình giảm.
```

## M17 — Order bằng chữ + câu thoại + khách quen cơ bản
```
Đọc AGENTS.md, GAME_DESIGN.md (mục 25), PROGRESS.md. Làm MỐC 17 (sửa trong js/service.js, thêm dữ
liệu vào js/data.js):
1. Thay hiển thị order từ dãy icon sang 1 dòng chữ ngắn (tên món chính trước, món phụ sau, dạng
   "Cơm sườn bì + trứng"), giữ 1 icon nhỏ đại diện phía trước dòng chữ.
2. Thêm 2-3 câu thoại mẫu cho mỗi loại khách (mục 25) vào data.js, hiện dạng bong bóng thoại nhỏ
   phía trên đầu khách khi khách vừa xuất hiện, tự ẩn sau vài giây hoặc khi khách được chọn.
3. Thêm bộ đếm riêng cho mỗi loại khách: số lần loại đó được phục vụ đạt từ 4 sao trở lên (lưu
   trong state, không giới hạn). Từ lần thứ 5 trở đi, mỗi lượt loại khách đó xuất hiện có 20% cơ
   hội là "khách quen": thêm nhãn nhỏ "Khách quen" trên bong bóng đơn, kiên nhẫn +10%, tiền boa
   +5 điểm phần trăm so với mục 4.
Nghiệm thu: order hiện đúng dạng chữ; câu thoại xuất hiện khi khách tới; sau khi phục vụ tốt 5 lần
một loại khách, bắt đầu thấy nhãn "Khách quen" xuất hiện ngẫu nhiên ở loại đó.
```

---

M11/M12 vẫn PAUSED. Tiếp tục với 12 mốc dưới đây (M18 → M29) — 11 mốc theo đúng thứ tự bạn đề xuất cộng thêm M29 Nhân viên — mỗi mốc 1 prompt, mỗi mốc 1 phiên chat mới, commit sau mỗi mốc.

## M18 — Sao quán ảnh hưởng số lượng khách + tăng khách theo ngày không giới hạn cứng
```
Đọc AGENTS.md, GAME_DESIGN.md (mục 4, 26), PROGRESS.md. Làm MỐC 18 (sửa hàm tính số khách/khoảng
cách khách trong js/service.js hoặc file liên quan):
1. Sửa công thức số khách mỗi ngày đúng theo mục 4 mới: `ngày ≤ 10 ? 10+2×(ngày-1) : min(60, 28+(ngày-10))`
   (không còn chặn cứng ở 30 từ ngày 11, tăng chậm +1/ngày tới trần 60).
2. Thêm hệ số `heSoSao` theo đúng bảng ở mục 26 (dựa trên Sao quán hiện tại), dùng CHIA vào công thức
   khoảng cách khách ở mục 4 — cùng vị trí và cùng chiều với `heSoGia` đã có (chia, không nhân).
Nghiệm thu: chơi thử tới ngày 15-20 (có thể chỉnh nhanh bằng cách qua ngày liên tục), xác nhận số
khách vẫn tăng thay vì đứng yên ở 30; chỉnh Sao quán xuống dưới 2.0 thấy khách thưa hẳn (~7-8/10),
trên 4.5 thấy đông hơn rõ rệt (~12-13/10).
```

## M19 — Hiển thị tồn kho + viền xanh gợi ý nguyên liệu
```
Đọc AGENTS.md, GAME_DESIGN.md (mục 27), PROGRESS.md. Làm MỐC 19 (sửa js/service.js, style.css):
1. Mọi nút món trong khay ở màn Bán hàng hiện thêm số tồn kho hiện tại dạng "Tên (số)", không chỉ
   riêng sườn như hiện tại.
2. Khi 1 khách đang được chọn: các nút món mà đơn của khách đó còn cần có viền xanh nổi bật (border
   hoặc box-shadow màu #6aa84f). Cập nhật lại ngay khi đổi khách hoặc vừa lắp thêm 1 món.
Nghiệm thu: chọn 1 khách có order nhiều món, thấy đúng các nút cần thiết có viền xanh; lắp xong 1
món thì viền xanh của món đó biến mất; đổi sang khách khác thì viền xanh đổi theo đúng order mới.
```

## M20 — Ăn tại quán / Mang đi (dĩa/hộp/bọc)
```
Đọc AGENTS.md, GAME_DESIGN.md (mục 28, 37), PROGRESS.md. Làm MỐC 20 (js/servetype.js, sửa js/service.js):
1. Mỗi khách xuất hiện được gán ngẫu nhiên 🍽 Tại quán (60%) hoặc 🥡 Mang đi (40%), hiện icon nhỏ
   trên bong bóng đơn.
2. Bước đầu tiên bắt buộc khi lắp đơn: chạm 🍽 Dĩa hoặc 📦 Hộp (thay cho "đĩa trống" mặc định cũ).
   Chỉ sau khi chọn đúng, các nút món khác mới bấm được.
3. Nếu khách Mang đi: sau khi chọn Hộp, bắt buộc chạm thêm 🛍 Bọc trước khi nút Giao bật được.
4. Giao sai loại (nhầm Dĩa/Hộp, hoặc thiếu Bọc khi cần) → tính như sai/thiếu 1 món theo mục 7.
Nghiệm thu: phục vụ 1 khách Tại quán và 1 khách Mang đi, làm đúng quy trình cả 2; thử giao sai loại
1 lần để xác nhận bị trừ điểm đúng như thiếu 1 món.
```

## M21 — Nước mắm cay / không cay
```
Đọc AGENTS.md, GAME_DESIGN.md (mục 29, 37), PROGRESS.md. Làm MỐC 21 (sửa js/data.js, js/prep.js,
js/service.js):
1. Thêm 2 nguyên liệu Nước mắm cay và Nước mắm thường vào data.js theo đúng số liệu mục 29 (giá
   bán 0đ, giá vốn 500đ/phần), mua/tồn kho như nguyên liệu khác ở tab Nguyên liệu.
2. 50% khách có yêu cầu cụ thể trong order (chia đều cay/không cay), hiện rõ trong dòng chữ order.
   50% còn lại không yêu cầu, không ảnh hưởng đánh giá dù giao loại nào.
3. Giao thiếu/sai loại nước mắm khi khách có yêu cầu rõ → tính như sai/thiếu 1 món (mục 7).
Nghiệm thu: gặp 1 khách yêu cầu nước mắm cay, giao đúng thì sao bình thường; giao sai/thiếu thì bị
trừ điểm đúng luật thiếu 1 món.
```

## M22 — Báo hết món
```
Đọc AGENTS.md, GAME_DESIGN.md (mục 30, 37), PROGRESS.md. Làm MỐC 22 (sửa js/service.js):
1. Kiểm tra đúng điều kiện "hết món không cách nào có được" ở mục 30 (khác nhau giữa nguyên liệu
   lấy trực tiếp và riêng sườn).
2. Khi đúng điều kiện, hiện nút ⚠️ Báo hết món cạnh Đổ đĩa. Bấm vào có hộp xác nhận, đồng ý thì
   khách rời hàng ngay, KHÔNG cộng vào phân bố sao (mục 21), Sao quán (mục 7), hay "Khách bỏ đi"
   hiện có — tăng 1 bộ đếm riêng "Khách bỏ đi vì hết món", hiện ở Tổng kết và Sổ doanh thu.
Nghiệm thu: bán hết sạch sườn (kể cả trên vỉ), khi khách gọi món có sườn thấy nút Báo hết món hiện
ra; dùng thử, kiểm tra Tổng kết có dòng riêng đúng số liệu, không ảnh hưởng Sao quán.
```

## M23 — Hết giờ vẫn phục vụ hết khách đang đợi
```
Đọc AGENTS.md, GAME_DESIGN.md (mục 19, 31), PROGRESS.md. Làm MỐC 23 (sửa js/service.js, js/pausemenu.js):
1. Khi hết giờ hoặc bấm "Đóng cửa sớm": dừng sinh khách mới ngay, nhưng không chuyển Tổng kết nếu
   còn khách đang đợi/đang chọn. HUD thay đồng hồ/thanh tiến trình bằng chữ "Đang đóng cửa...".
2. Khách hết kiên nhẫn trong lúc này vẫn bỏ đi bình thường theo mục 4 (không gia hạn kiên nhẫn).
3. Khi hàng đợi trống hẳn → tự động chuyển Tổng kết. Áp dụng đúng 1 đoạn logic dùng chung cho cả
   2 trường hợp (hết giờ tự nhiên và Đóng cửa sớm), không viết 2 lần.
4. Sửa lại nút "Đóng cửa sớm" trong menu tạm dừng theo đúng hành vi mới này (không còn kết thúc
   ngay lập tức như thiết kế cũ).
Nghiệm thu: để đồng hồ gần hết giờ trong lúc còn 2-3 khách đang đợi, xác nhận game không chuyển
Tổng kết ngay mà chờ phục vụ/khách bỏ đi hết mới chuyển; thử "Đóng cửa sớm" cũng đúng hành vi này.
```

## M24 — Tab Giá bán riêng (bảng menu)
```
Đọc AGENTS.md, GAME_DESIGN.md (mục 24, 32), PROGRESS.md. Làm MỐC 24 (js/pricing.js, sửa js/prep.js):
1. Tách phần chỉnh giá bán ra khỏi tab Nguyên liệu, làm tab con thứ 3 trong Chuẩn bị: "Nguyên liệu
   | Nâng cấp | Giá bán". Giao diện nền tối (đen/nâu đậm), chữ trắng/vàng kiểu bảng menu quán ăn.
2. Mỗi dòng: tên món — giá hiện tại — ô nhập số tùy ý (không dùng +/-). Khung 0–1.000.000đ, kẹp về
   biên nếu nhập ngoài khung, bỏ qua nếu không phải số. Giá = 0 hiện nhãn "FREE" thay 4 mức nhãn cũ.
3. Giữ nguyên công thức nhãn cảnh báo, heSoGia, ảnh hưởng sao đã có ở mục 24 — chỉ đổi vị trí UI và
   khung nhập.
Nghiệm thu: vào tab Giá bán mới, chỉnh giá 1 món về 0 thấy nhãn FREE; nhập số ngoài khung bị kẹp
đúng về 0 hoặc 1.000.000; các nhãn 🟢/🟡/🔴 vẫn hoạt động đúng như trước.
```

## M25 — Tab con "Nước"
```
Đọc AGENTS.md, GAME_DESIGN.md (mục 33), PROGRESS.md. Làm MỐC 25 (js/drinks.js, sửa js/prep.js, js/data.js):
1. Thêm tab con thứ 4 trong Chuẩn bị: "Nguyên liệu | Nâng cấp | Giá bán | Nước". Chuyển Trà đá từ
   tab Nguyên liệu sang đây.
2. Thêm 3 loại nước mới (Xá xị Cô Ba, Cam ép, Sữa đậu nành) theo đúng số liệu mục 33, khóa sau nâng
   cấp "Tủ nước giải khát" (280.000đ, thêm vào bảng nâng cấp mục 8).
3. Sau khi mua nâng cấp, cả 3 loại mở cùng lúc, có thể xuất hiện trong order ngẫu nhiên như món khác.
Nghiệm thu: ngày 1 chỉ thấy Trà đá trong tab Nước; mua nâng cấp Tủ nước giải khát xong thấy đủ 4
loại nước, và các loại mới bắt đầu xuất hiện trong order của khách.
```

## M26 — Biến động giá vốn theo sự kiện
```
Đọc AGENTS.md, GAME_DESIGN.md (mục 34), PROGRESS.md. Làm MỐC 26 (sửa js/state.js hoặc file quản lý
ngày mới):
Từ ngày 3, mỗi ngày 20% cơ hội xảy ra đúng 1 trong 2: "Sườn tăng giá" (giá vốn sườn +30% ngày đó)
hoặc "Trứng được mùa" (giá vốn trứng -40% ngày đó), mỗi loại 10%. Hiện thông báo ngắn khi vào
Chuẩn bị đầu ngày đó. Khi sự kiện đang áp dụng cho món nào, giá gốc dùng để tính nhãn cảnh báo và
ngưỡng trừ sao của ĐÚNG món đó (mục 24, 32) cũng nhân theo cùng % biến động ngày hôm đó (không đụng
tới heSoGia, luôn tính theo giá Cơm tấm, và không đụng ngưỡng nhãn của các món khác). Hết ngày đó
thì giá vốn và giá gốc hiệu chỉnh trở lại bình thường.
Nghiệm thu: chơi vài ngày liên tiếp từ ngày 3, thấy thông báo xuất hiện đúng tỉ lệ tương đối và giá
vốn sườn/trứng thay đổi đúng ngày đó; khi Sườn tăng giá, tăng giá bán Sườn lên tương ứng thấy nhãn
KHÔNG bị gắn "mắc" oan như trước; ngày hôm sau mọi thứ trở lại bình thường.
```

## M27 — Combo
```
Đọc AGENTS.md, GAME_DESIGN.md (mục 35, 37), PROGRESS.md. Làm MỐC 27 (sửa js/pricing.js):
1. Thêm khu vực Combo trong tab Giá bán: tạo tối đa 3 combo, mỗi combo chọn 2-4 món (từ mục 3, 33)
   + nhập 1 giá bán trọn gói. Giá combo BẮT BUỘC nằm trong khung 50%-100% tổng giá bán lẻ HIỆN TẠI
   của các món đã chọn (tự tính lại mỗi khi đổi món hoặc đổi giá lẻ ở tab Giá bán) — kẹp về biên nếu
   nhập ngoài khung, giống cách làm ở mục 32. Hiện rõ tổng giá lẻ tham khảo ngay khi chọn đủ món.
2. Combo chỉ "bật" khi đã chọn đủ ≥2 món và đặt giá hợp lệ. Khi bật, có 20% cơ hội khách order
   thẳng theo tên combo thay vì liệt kê từng món.
3. Giao đủ combo tính tiền theo giá combo (không cộng riêng từng món). Thiếu món trong combo dùng
   đúng cơ chế Báo hết món (mục 22) nếu món đó đã hết, hoặc tính thiếu món theo mục 7 nếu chỉ quên lắp.
Nghiệm thu: tạo 1 combo hợp lệ, chơi vài khách thấy có lúc order hiện đúng "Combo 1"; giao đủ tính
đúng giá combo; xoá hết 1 món trong combo khỏi kho thì Combo đó dùng đúng Báo hết món; thử nhập giá
combo vượt 100% hoặc dưới 50% tổng giá lẻ, xác nhận bị kẹp về đúng biên.
```

## M28 — Mở rộng bộ dữ liệu mẫu
```
Đọc AGENTS.md, GAME_DESIGN.md (mục 36), PROGRESS.md. Làm MỐC 28 (sửa js/data.js):
1. Tăng số tên khách giả (mục 21) từ 15 lên 30 tên Việt Nam khác nhau.
2. Tăng số câu thoại mỗi loại khách (mục 25) từ 2-3 câu lên 4-5 câu/loại.
3. Kiểm tra lại hàm chọn "món thêm" ngẫu nhiên (mục 4), đảm bảo chọn đều trên toàn bộ danh sách món
   khả dụng hiện tại (gồm cả nước mục 33, nước mắm mục 29), không thiên vị món nào.
Nghiệm thu: chơi nhiều ngày, quan sát tên khách và câu thoại không lặp lại quá nhanh; món thêm xuất
hiện đa dạng, có cả nước giải khát mới và nước mắm khi đã mở khóa.
```

## M29 — Nhân viên (tách "chị Hai" thành 2 vị trí độc lập)
```
Đọc AGENTS.md, GAME_DESIGN.md (mục 38), PROGRESS.md. Làm MỐC 29 (js/staff.js, sửa js/prep.js,
js/service.js, js/summary.js, js/state.js):
1. Thay nâng cấp "Thuê chị Hai phụ bếp" bằng 2 nâng cấp riêng, mua độc lập, mỗi giá 350.000đ:
   "Nhân viên Nướng" và "Nhân viên Làm món" (2 biến trạng thái tách biệt, không dùng chung 1 cờ cũ).
2. Nhân viên Nướng (khi đang làm việc): tự động nhấc miếng sườn vừa đạt chín vàng (60-90%) khỏi vỉ
   vào khay. Mỗi miếng xử lý có 2% xác suất độc lập bị hỏng thành phế thay vì vào khay (mất vốn).
3. Nhân viên Làm món (khi đang làm việc): mỗi 10 giây tự lắp giúp 1 món còn thiếu vào đơn đang chọn
   (ưu tiên bì/trứng/cơm/nước mắm/nước giải khát, không đụng sườn). Mỗi lần thao tác có 1% xác suất
   độc lập lắp sai 1 món khác — nếu người chơi không sửa bằng Đổ đĩa trước khi Giao thì tính sai/
   thiếu món theo đúng mục 7 như lỗi thường, không tạo luật chấm điểm riêng.
4. Lương: mỗi nhân viên đang làm việc tốn 40.000đ/ngày, trừ ở Tổng kết thành dòng riêng "Lương nhân
   viên" (tách biệt dòng Thuê mặt bằng), cộng dồn nếu cả 2 đang làm.
5. Ở tab Chuẩn bị cạnh mỗi nhân viên đã thuê: công tắc "Cho nghỉ hôm nay" riêng từng người, áp dụng
   từ ngày bán tiếp theo. Ngày nghỉ: không hoạt động, không cơ chế lỗi, không trừ lương ngày đó.
Nghiệm thu: thuê riêng từng nhân viên (thử chỉ 1, rồi cả 2), xác nhận hoạt động độc lập; chơi vài
chục miếng sườn/thao tác lắp món để thấy tỉ lệ lỗi xảy ra hợp lý; kiểm tra Tổng kết trừ đúng lương;
bật "Cho nghỉ" 1 người thấy người đó không hoạt động và không bị trừ lương ngày đó.
```

---

## M30 — Đồng bộ save ẩn danh lên Supabase
```
TRƯỚC KHI CHẠY PROMPT NÀY, bạn (không phải AI) cần tự làm ở Supabase.com (tài khoản free):
1. Tạo project mới.
2. Vào SQL Editor, chạy đúng đoạn SQL trong GAME_DESIGN.md mục 39 (phần "Việc bạn cần tự làm").
3. Vào Settings → API, copy "Project URL" và "anon public key", giữ sẵn để dán vào bước dưới.

Sau đó mới dùng prompt này:

Đọc AGENTS.md, GAME_DESIGN.md (mục 39), PROGRESS.md. Làm MỐC 30 (js/cloudsync.js, js/cloud-config.js,
sửa js/state.js):
1. Tạo js/cloud-config.js chứa 2 hằng số rỗng `SUPABASE_URL` và `SUPABASE_ANON_KEY` — tôi sẽ tự điền
   giá trị thật vào sau, không cần bạn (AI) biết giá trị thật.
2. Thêm `anonId` (sinh bằng `crypto.randomUUID()` nếu chưa có) vào state, tự động nằm trong "ID sao
   lưu" hiện có (mục 16) vì cùng object state.
3. Viết `syncToCloud()` trong js/cloudsync.js: gọi `fetch` tới `${SUPABASE_URL}/rest/v1/game_saves`
   (POST, header `apikey` và `Authorization: Bearer` = SUPABASE_ANON_KEY, header `Prefer:
   resolution=merge-duplicates`) với body là mảng 1 object gồm anon_id, shop_name, day, money, star,
   save_blob (= đúng chuỗi "ID sao lưu" hiện có). Bọc try/catch, lỗi thì bỏ qua âm thầm.
4. Gọi `syncToCloud()` ở đúng các điểm đang gọi `saveState()` hiện có, debounce tối thiểu 5 giây
   giữa 2 lần gọi liên tiếp (dùng timer, gộp lại nếu gọi dồn dập).
5. Khi Nhập "ID sao lưu" (mục 16) và mã đó có `anonId`, dùng lại đúng `anonId` đó thay vì sinh mới.
6. Thêm 1 dòng nhỏ trong tab Cài đặt: "Dữ liệu quán được tự động sao lưu ẩn danh để hỗ trợ khôi
   phục khi cần."
Nghiệm thu: mở DevTools Network, chơi vài đơn, xác nhận có request POST gửi đi (có thể lỗi 401 nếu
tôi chưa điền config thật — vẫn tính đạt yêu cầu về code). Tôi sẽ tự điền config thật và tự kiểm tra
dữ liệu xuất hiện trên Supabase Table Editor sau.
```

## M31 — Nguyên liệu VIP: Tóp mỡ
```
Đọc AGENTS.md, GAME_DESIGN.md (mục 40), PROGRESS.md. Làm MỐC 31 (sửa js/data.js, js/prep.js,
js/service.js, js/scoring.js, js/home.js):
1. Thêm nguyên liệu Tóp mỡ vào data.js theo đúng số liệu mục 40 (giá vốn 15.000đ/phần, hao 70% qua
   đêm nếu chưa Tủ lạnh), khóa mặc định.
2. Kiểm tra điều kiện `ngày ≥ 15 VÀ tiền ≥ 5.000.000đ` như MỘT phép AND tại đúng 1 thời điểm kiểm
   tra (mua hàng, nhận tiền sau đơn, Tổng kết) — TUYỆT ĐỐI không lưu 2 cờ riêng "đã từng đạt ngày
   15" và "đã từng có 5 triệu" ở 2 thời điểm khác nhau rồi gộp sau. Ví dụ bắt buộc đúng: ngày 14 dù
   đủ 5 triệu vẫn chưa đủ; ngày 15-19 chưa đủ 5 triệu thì chưa đủ; ngày 20 đủ 5 triệu mới đủ.
3. Khi đủ điều kiện lần đầu: hiện nút "🔓 Mở khóa Tóp mỡ" (ở tab Quán hoặc đầu tab Chuẩn bị), KHÔNG
   tự mở khóa. Nút này không tự mất kể cả nếu tiền sau đó tụt dưới 5 triệu, chờ tới khi người chơi
   bấm. Bấm vào: không trừ tiền, chỉ đặt `tomMoUnlocked = true` vĩnh viễn, Tóp mỡ trở thành nguyên
   liệu bình thường trong tab Nguyên liệu từ đó về sau.
4. Sau khi mở khóa: thêm nút "🧈 Tóp mỡ" trong khu vực lắp đĩa, người chơi tự ý thêm vào bất kỳ đơn
   nào (không cần khách yêu cầu, không bao giờ tính là thừa món), tốn 1 phần kho + cộng 25.000đ.
5. Nếu đơn có Tóp mỡ và đạt ≥3 sao theo cách chấm thường: cộng thêm 1 sao (tối đa 5), tiền boa +10
   điểm phần trăm.
Nghiệm thu: test tạm bằng cách chỉnh state để mô phỏng đúng 4 tình huống ở bước 2 (ngày 14 đủ tiền,
ngày 15 thiếu tiền, ngày 16 thiếu tiền, ngày 20 đủ tiền), xác nhận chỉ tình huống cuối hiện nút Mở
khóa; bấm nút xong thấy Tóp mỡ hoạt động bình thường; thêm vào 1 đơn đạt 4 sao thấy lên 5 sao và
boa tăng đúng 10%.
```

## M32 — Trả lời đánh giá
```
Đọc AGENTS.md, GAME_DESIGN.md (mục 41), PROGRESS.md. Làm MỐC 32 (sửa js/reviews.js):
Thêm nút "Trả lời" cho mỗi đánh giá trong danh sách 30 gần nhất ở tab Đánh giá. Mở ô nhập ngắn (tối
đa 150 ký tự), lưu lại, hiện thành dòng thụt vào bên dưới với nhãn "🏪 Chủ quán đã trả lời". Không
ảnh hưởng bất kỳ số liệu gameplay nào (chỉ hiển thị). Câu trả lời biến mất cùng đánh giá khi đánh
giá đó bị đẩy khỏi danh sách 30 gần nhất.
Nghiệm thu: trả lời 1 đánh giá, thấy hiện đúng dưới đánh giá đó; sao/tiền/gameplay không đổi gì.
```

---

M33-M34 dưới đây là TÙY CHỌN — làm hay không không ảnh hưởng gì tới các mốc khác, có thể bỏ qua.

## M33 — Best-seller trong tuần (tùy chọn)
```
Đọc AGENTS.md, GAME_DESIGN.md (mục 42), PROGRESS.md. Làm MỐC 33 (sửa js/home.js, js/state.js):
Thêm bộ đếm nhỏ mỗi khi giao đơn thành công (theo món), tab Quán hiện dòng "🔥 Best-seller 7 ngày
qua: [tên món]" dựa trên món được giao nhiều nhất trong 7 ngày gần nhất.
Nghiệm thu: giao nhiều đơn có Sườn trong vài ngày, thấy dòng Best-seller hiện đúng "Sườn nướng".
```

## M34 — Mốc thưởng theo số ngày (tùy chọn)
```
Đọc AGENTS.md, GAME_DESIGN.md (mục 43), PROGRESS.md. Làm MỐC 34 (sửa js/state.js, js/home.js):
Khi bắt đầu ngày 7/15/30/50/100, hiện popup chúc mừng ngắn kèm thưởng tiền theo đúng số ở mục 43,
mỗi mốc chỉ thưởng 1 lần (lưu cờ đã nhận trong state).
Nghiệm thu: chơi hoặc chỉnh nhanh tới ngày 7, thấy popup và tiền cộng đúng, không lặp lại ở lần sau.
```

---

## M11 — Hoàn thiện (đổi số từ M6 cũ, vẫn PAUSED tới khi xong M32, M33-M34 tùy chọn)
```
Đọc AGENTS.md, GAME_DESIGN.md, PROGRESS.md. Làm MỐC 11:
1. Sự kiện ngẫu nhiên (mục 9), hiển thị thông báo đầu ngày.
2. Âm thanh (tiếng xèo xèo, ting khi giao, tiếng tiền) bằng Web Audio tạo tone đơn giản, tôn trọng
   công tắc bật/tắt âm thanh đã có ở Cài đặt; chỉ khởi tạo sau lần chạm đầu.
3. Hiệu ứng nhỏ: số tiền bay lên, rung nhẹ khi cháy, khói.
Nghiệm thu: chơi 10 ngày liền không lỗi console, không đứng game.
```

## M12 — Thay hình vẽ của bạn (đổi số từ M7 cũ)
```
Đọc AGENTS.md và bảng ASSETS trong js/data.js. Hãy:
1. Liệt kê tên file, kích thước khuyến nghị cho tất cả ảnh cần vẽ.
2. Đảm bảo game tự dùng ảnh trong /assets nếu có, còn thiếu thì dùng emoji.
Không sửa gameplay.
```

---

## Việc để dành sau (chưa lên prompt, xem GAME_DESIGN.md mục 20)
Nhiệm vụ ngày/tuần, Thành tựu, Sổ tay khách, Streak, Mặt bằng/phương tiện, Danh tiếng, Khách quen
nâng cao, Online order, Sự kiện lịch VN, Chi nhánh/thương hiệu — làm sau khi M13-M17 đã ổn định
và chơi thử thấy thật sự cần, không lập sẵn lộ trình chi tiết từ bây giờ.

---

## Prompt sửa lỗi (dùng mọi lúc)
```
Lỗi: [mô tả ngắn: làm gì → thấy gì → mong đợi gì].
Hãy mở game, tái hiện lỗi, đọc console, tìm nguyên nhân gốc và sửa với thay đổi nhỏ nhất. Không refactor.
Chạy lại để xác nhận đã hết lỗi rồi báo ngắn gọn.
```

## Prompt khi chuyển sang công cụ AI khác (vì hết token)
```
Đọc AGENTS.md, GAME_DESIGN.md và PROGRESS.md để nắm tình hình.
Tiếp tục công việc còn dở theo PROGRESS.md: [ghi tên mốc/việc].
Chỉ sửa các file liên quan.
```

## Prompt dự phòng khi hết token và phải chat thủ công (web ChatGPT/Gemini/Claude)
```
Tôi làm game HTML/CSS/JS thuần (không framework) theo mô tả sau: [dán mục tóm tắt từ AGENTS.md].
Dưới đây là CHỈ các file liên quan: [dán file].
Yêu cầu: [việc cần làm].
Hãy trả về TOÀN BỘ nội dung của từng file cần sửa (không dùng "...", không bỏ đoạn), mỗi file trong một khối code riêng có ghi tên file. Không sửa file khác.
```
