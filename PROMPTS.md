# PROMPTS.md — Bộ prompt theo mốc

Cách dùng: mỗi mốc mở **phiên chat mới** trong Codex/Antigravity, dán đúng 1 prompt. Test xong thì `git commit` rồi mới sang mốc kế.

Đã hoàn thành: M1 → M5 (khung dự án, Chuẩn bị, Bán hàng, Tổng kết, nâng cấp có hiệu lực). Tiếp theo là các mốc mới bên dưới; M6/M7 cũ (sự kiện ngẫu nhiên, âm thanh nâng cao, thay hình vẽ) được dời xuống cuối, làm sau cùng.

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

## M11 — Hoàn thiện (đổi số từ M6 cũ)
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

## Việc để dành sau (chưa lên prompt, xem GAME_DESIGN.md mục 19)
Tab Đánh giá, Thành tựu, Nhiệm vụ ngày, Sổ tay khách hàng — làm sau khi M6-M10 đã ổn định.

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
