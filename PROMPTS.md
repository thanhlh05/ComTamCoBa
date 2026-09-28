# PROMPTS.md — Bộ prompt theo mốc

Cách dùng: mỗi mốc mở **phiên chat mới** trong Codex/Antigravity, dán đúng 1 prompt. Test xong thì `git commit` rồi mới sang mốc kế.

Câu mở đầu chung (đã có trong từng prompt): "Đọc AGENTS.md, GAME_DESIGN.md và PROGRESS.md trước."

---

## M1 — Khung dự án + PWA + màn hình rỗng
```
Đọc AGENTS.md, GAME_DESIGN.md và PROGRESS.md (nếu có). Làm MỐC 1:
1. Tạo cấu trúc thư mục và các file rỗng có sẵn khung theo AGENTS.md.
2. index.html + style.css: khung 390x844, safe-area, font to, palette theo GAME_DESIGN mục 12.
3. js/state.js: trạng thái ban đầu (tiền 200000, ngày 1, sao 4.0, tồn kho 0, nâng cấp rỗng), hàm save()/load().
4. js/data.js: đưa toàn bộ số liệu từ GAME_DESIGN mục 3, 4, 7, 8 vào dạng object.
5. js/main.js: hàm showScreen('title'|'prep'|'service'|'summary'), màn Bắt đầu "Chạm để vào".
6. manifest.json + meta iOS (icon tạm bằng màu trơn).
7. Tạo PROGRESS.md.
Nghiệm thu: `npx serve .` chạy không lỗi console; chuyển được giữa 4 màn hình (mỗi màn có nút chuyển tạm); vừa khít 390x844.
Chỉ làm mốc 1.
```

## M2 — Màn Chuẩn bị (mua nguyên liệu, nâng cấp)
```
Đọc AGENTS.md, GAME_DESIGN.md, PROGRESS.md. Làm MỐC 2 (js/prep.js):
1. Tab "Nguyên liệu": mỗi món có icon, giá vốn/phần, tồn kho, nút "Mua lố 10". Trừ tiền đúng, không cho mua khi thiếu tiền.
2. Tab "Nâng cấp": danh sách theo GAME_DESIGN mục 8, hiện giá, đã mua/chưa, không cho mua khi thiếu tiền hoặc đã đạt giới hạn.
3. HUD: tiền, ngày, sao. Nút "Mở bán" chuyển sang màn Bán hàng.
4. Áp dụng luật hao tồn kho qua đêm (mục 3) khi bắt đầu ngày mới (viết hàm trong state.js).
5. Lưu game sau mỗi lần mua.
Nghiệm thu: mua hàng làm tiền và tồn kho đổi đúng; F5 trang thì dữ liệu còn nguyên; console không lỗi.
```

## M3 — Bán hàng: vỉ nướng
```
Đọc AGENTS.md, GAME_DESIGN.md, PROGRESS.md. Làm MỐC 3A (chỉ vỉ nướng, chưa có khách) trong js/service.js:
1. Màn Bán hàng có vỉ nướng 4 ô (số ô lấy từ nâng cấp).
2. Chạm ô trống → đặt sườn (trừ kho). Độ chín chạy theo mục 5, vòng tròn đổi màu, có trạng thái sống/chín/hơi cháy/cháy.
3. Chạm miếng đã chín → cho vào "khay sườn" (hiện số miếng). Chạm khi sống → rung + thông báo "Chưa chín!". Miếng cháy → tự biến thành phế và báo.
4. Game loop bằng requestAnimationFrame với dt, tạm dừng khi tab ẩn.
Nghiệm thu: đặt 4 miếng, đợi đủ các mức độ chín, nhấc đúng lúc/để cháy đều xử lý đúng; kho sườn giảm đúng.
```

## M3B — Bán hàng: khách và lắp đĩa
```
Đọc AGENTS.md, GAME_DESIGN.md, PROGRESS.md. Làm MỐC 3B (nối vào màn Bán hàng đã có vỉ):
1. Sinh khách theo mục 4 (số lượng, khoảng cách, loại khách, giới hạn 4 khách trên màn).
2. Mỗi khách có bong bóng đơn (icon món) và thanh kiên nhẫn 3 màu.
3. Chạm khách để chọn. Khay dưới có nút các món; chạm để thêm vào đĩa; sườn lấy từ khay sườn. Nút "Giao" và "Đổ đĩa".
4. Chấm sao từng đơn theo mục 7, tính tiền + tiền boa, cập nhật sao quán (trung bình 20 đánh giá gần nhất). Khách hết kiên nhẫn thì bỏ đi và tính 1 sao.
5. Đồng hồ 120 giây; hết giờ thì chuyển sang màn Tổng kết.
Nghiệm thu: phục vụ trọn ngày 1 không lỗi, tiền và sao cập nhật đúng theo bảng.
```

## M4 — Tổng kết + qua ngày
```
Đọc AGENTS.md, GAME_DESIGN.md, PROGRESS.md. Làm MỐC 4 (js/summary.js):
1. Bảng tổng kết: doanh thu, tiền boa, chi phí thuê mặt bằng, tổng lời/lỗ, số khách phục vụ, số khách bỏ đi, sao quán (trước → sau).
2. Trừ tiền thuê theo công thức mục 2. Xử lý vay 1 lần và Game Over.
3. Nút "Qua ngày mới" → ngày +1, về màn Chuẩn bị, lưu game.
Nghiệm thu: chơi 3 ngày liên tiếp, số liệu cộng trừ khớp bằng tay.
```

## M5 — Nâng cấp có hiệu lực + khách mới + Chị Hai
```
Đọc AGENTS.md, GAME_DESIGN.md, PROGRESS.md. Làm MỐC 5:
1. Áp dụng hiệu ứng thật của 7 nâng cấp (mục 8) vào gameplay.
2. Mở khóa dần loại khách theo ngày (mục 4). Menu Chả/Canh chỉ hiện sau khi mua nâng cấp.
3. Chị Hai phụ bếp: tự lắp giúp 1 món mỗi 10s cho đơn đang chọn (hiển thị nhân vật + hiệu ứng nhỏ).
Nghiệm thu: mỗi nâng cấp có thể thấy tác động rõ ràng khi chơi.
```

## M6 — Hoàn thiện
```
Đọc AGENTS.md, GAME_DESIGN.md, PROGRESS.md. Làm MỐC 6:
1. Sự kiện ngẫu nhiên (mục 9), hiển thị thông báo đầu ngày.
2. Âm thanh (tiếng xèo xèo, ting khi giao, tiếng tiền) bằng Web Audio tạo tone đơn giản, có nút bật/tắt; chỉ khởi tạo sau lần chạm đầu.
3. Xuất/Nhập mã lưu (mục 11).
4. Hiệu ứng nhỏ: số tiền bay lên, rung nhẹ khi cháy, khói.
Nghiệm thu: chơi 10 ngày liền không lỗi console, không đứng game.
```

## M7 — Thay hình vẽ của bạn
```
Đọc AGENTS.md và bảng ASSETS trong js/data.js. Hãy:
1. Liệt kê tên file, kích thước khuyến nghị cho tất cả ảnh cần vẽ.
2. Đảm bảo game tự dùng ảnh trong /assets nếu có, còn thiếu thì dùng emoji.
Không sửa gameplay.
```

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
