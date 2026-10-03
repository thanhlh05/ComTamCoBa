# AGENTS.md — Luật dự án "Cơm Tấm Cô Ba"

## Tổng quan
- Game mô phỏng bán cơm tấm, tiếng Việt, chạy trên trình duyệt điện thoại (ưu tiên iPhone Safari/PWA).
- Triển khai dạng static trên Vercel. Thiết kế chi tiết nằm trong `GAME_DESIGN.md` (nguồn sự thật duy nhất về luật game và số liệu).

## Công nghệ (bắt buộc)
- Chỉ HTML + CSS + JavaScript thuần, dùng ES modules (`<script type="module">`).
- KHÔNG framework, KHÔNG bundler, KHÔNG npm package cho game, trừ khi tôi cho phép rõ ràng.
- UI bằng DOM (div, button). KHÔNG dùng canvas.
- Mobile-first, màn hình dọc (thiết kế theo 390x844), chỉ cảm ứng (không dùng hover).
- KHÔNG tạo backend/server tự viết cho bất kỳ tính năng nào. **Ngoại lệ duy nhất**: đồng bộ save ẩn danh lên Supabase (mục 39) — dùng dịch vụ có sẵn (Supabase free tier), gọi thẳng bằng `fetch` tới REST API của họ, không tự dựng server riêng, không thêm framework/SDK nào khác.

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
js/revenue.js    tab Doanh thu (2 tab con: Doanh thu | Đánh giá — xem mục 21)
js/reviews.js    logic tab Đánh giá: phân bố sao, danh sách, lọc, chọn câu bình luận theo lý do
js/pricing.js    tự chỉnh giá bán từng món + combo, tab "Giá bán" dạng bảng menu (mục 32, 35)
js/drinks.js     tab con "Nước" (đồ uống, mục 33)
js/servetype.js  ăn tại quán/mang đi, dĩa/hộp/bọc (mục 28)
js/staff.js      2 nhân viên độc lập (Nướng, Làm món): hiệu ứng, lỗi ngẫu nhiên, lương, cho nghỉ (mục 38)
js/cloudsync.js  đồng bộ save ẩn danh lên Supabase, không tài khoản/mật khẩu (mục 39)
js/cloud-config.js  chứa SUPABASE_URL và SUPABASE_ANON_KEY (2 chuỗi công khai theo đúng thiết kế của Supabase)
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
- **Giá bán** (mục 24 GAME_DESIGN.md): mỗi món có giá bán RIÊNG có thể chỉnh, nhưng hệ số ảnh hưởng khách đến (`heSoGia`) chỉ tính theo giá của món Cơm tấm — không tính trung bình phức tạp nhiều món. Công thức và các mốc nhãn (🟢/🟡/🔴) phải đúng số trong mục 24, không tự đặt số khác.
- **Đánh giá** (mục 21): phân bố sao là bộ đếm tích lũy KHÔNG giới hạn, tách biệt với danh sách 30 đánh giá gần nhất hiện chi tiết (có giới hạn) và tách biệt với "Sao quán" ở mục 7 (chỉ tính 20 đánh giá gần nhất) — ba con số này không được gộp chung một biến.
- **Khách quen** (mục 25): đếm theo LOẠI khách, không theo từng khách cá nhân cụ thể — không tạo hệ thống ID khách riêng lẻ ở mốc này.
- **Công thức khoảng cách khách** (mục 4, 24, 26): heSoGia và heSoSao đều dùng để CHIA (không phải nhân) vào công thức, đúng chiều: hệ số > 1 → khoảng cách ngắn hơn → khách đông hơn. Không tự đổi chiều công thức.
- **Đóng cửa sớm** (mục 19, 31): không còn kết thúc ngày ngay lập tức — chỉ dừng sinh khách mới, vẫn phải phục vụ hết khách đang có trong hàng đợi/đang chọn rồi mới chuyển Tổng kết. Áp dụng cùng luật cho cả "hết giờ tự nhiên" và "Đóng cửa sớm", dùng chung 1 đoạn code, không viết 2 lần.
- **Báo hết món** (mục 30): đơn được báo hết KHÔNG được cộng vào bất kỳ bộ đếm sao/đánh giá nào (mục 7, 21) — phải có bộ đếm riêng tách biệt hoàn toàn "Khách bỏ đi vì hết món".
- **Giá bán** (mục 32): khung nhập là 0 – 1.000.000đ, nhập số tùy ý (không dùng nút +/-). Giá = 0 hiển thị nhãn "FREE", không tính là lỗi hay chặn giao dịch.
- **Combo** (mục 35): chỉ là gói giá + danh sách món tham chiếu, không có nguyên liệu/giá vốn riêng cho bản thân combo — khi kiểm tra "hết món" (mục 30) phải kiểm tra từng món cấu thành, không kiểm tra "combo" như 1 nguyên liệu độc lập.
- **Nước mắm, nước giải khát mới**: thêm vào đúng cấu trúc dữ liệu món đã có trong `data.js` (cùng dạng với các món khác), không tạo cấu trúc riêng biệt.
- **Tương thích ngược cho save cũ** (áp dụng cho MỌI mốc từ giờ về sau): khi thêm field mới vào state, code đọc field đó luôn phải có giá trị mặc định dự phòng (`state.x ?? default`), không được giả định field đã tồn tại. Khi ĐỔI cấu trúc 1 field đã có (không chỉ thêm mới), bắt buộc viết kèm 1 đoạn migration chạy 1 lần lúc load save cũ, chuyển dữ liệu cũ sang đúng dạng mới, và phải nêu rõ trong nghiệm thu của mốc đó là đã test với 1 save cũ (chưa có field/tính năng mới) để đảm bảo không lỗi.
- **Số khách mỗi ngày** (mục 4): công thức tăng KHÔNG chặn cứng ở 30 — sau ngày 10 vẫn tăng chậm (+1/ngày) tới trần 60. Không tự ý quay lại công thức chặn 30 cũ.
- **Giá gốc hiệu chỉnh theo sự kiện** (mục 34): chỉ dịch chuyển ngưỡng nhãn cảnh báo/trừ sao của ĐÚNG món đang bị sự kiện tác động (sườn hoặc trứng), không đụng tới `heSoGia` (vẫn luôn tính theo giá Cơm tấm) và không đụng ngưỡng nhãn của các món khác.
- **Combo** (mục 35): giá combo bắt buộc nằm trong 50%-100% tổng giá bán lẻ hiện tại của các món cấu thành — đây là ràng buộc cứng, không phải gợi ý, phải kẹp giá nhập giống cách làm ở mục 32.
- **Nhân viên** (mục 38): 2 nhân viên (Nướng, Làm món) là 2 nâng cấp và 2 trạng thái hoàn toàn tách biệt trong state — không dùng chung 1 biến "đã thuê phụ bếp" như thiết kế "chị Hai" cũ. Cơ chế lỗi ngẫu nhiên của từng người (2% mỗi miếng với Nhân viên Nướng, 1% mỗi thao tác với Nhân viên Làm món) chỉ chạy khi người đó đang làm việc (không bị "cho nghỉ" hôm đó). Lỗi do nhân viên gây ra dùng lại đúng luật chấm sai/thiếu món ở mục 7, không tạo luật riêng.
- **Mở khóa Tóp mỡ** (mục 40): điều kiện `ngày ≥ 15` và `tiền ≥ 5.000.000đ` phải cùng đúng tại ĐÚNG 1 thời điểm kiểm tra (phép AND tức thời) — TUYỆT ĐỐI không cài thành 2 cờ "đã từng đạt ngày 15" và "đã từng có 5 triệu" rồi gộp sau, vì hai mốc đó có thể xảy ra ở hai thời điểm khác nhau không liên quan. Khi đủ điều kiện lần đầu: chỉ hiện nút "Mở khóa", không tự mở. Chỉ khi người chơi bấm nút đó mới đặt `state.tomMoUnlocked = true` vĩnh viễn.
- **Trả lời đánh giá** (mục 41): chỉ là tính năng hiển thị/roleplay, KHÔNG có công thức ảnh hưởng tới sao, tiền hay bất kỳ số liệu gameplay nào — giữ đúng nguyên tắc lean, tránh phát sinh hệ thống cân bằng mới không cần thiết.
- **Dĩa/Hộp/Bọc** (mục 28): là nguyên liệu tiêu hao thật, phải mua, không free. Dĩa dùng bộ đếm riêng tích lũy qua ngày (không reset theo ngày) để hao 1/5 lần, không được nhầm thành hao mỗi lần dùng như Hộp/Bọc.
- **Giao trống** (mục 7): số món khớp = 0 là một nhánh xử lý HOÀN TOÀN riêng với bảng 1-5 sao bình thường — không tính tiền (không phải 0.5× như 1-2 sao), không cộng "Khách phục vụ", mà cộng "Khách bỏ đi". Chỉ cần ≥1 món khớp (kể cả chỉ có Cơm) thì quay lại dùng bảng sao bình thường.
- **Giá vốn biến động theo ngày** (mục 34): bắt buộc reset toàn bộ giá vốn về gốc TRƯỚC khi roll sự kiện của ngày mới, mỗi ngày chỉ giữ đúng hiệu ứng của riêng ngày đó — không được để hiệu ứng ngày trước lọt sang ngày sau trong bất kỳ trường hợp nào (kể cả khi ngày sau trúng sự kiện khác).
- **Combo** (mục 35): lưu dạng mảng động trong state, KHÔNG hard-code số lượng combo cố định trong code — phải có đủ 3 thao tác Thêm/Sửa/Xóa, giới hạn duy nhất là độ dài mảng tối đa 5.

- **M30 / cloud:** Không triển khai đồng bộ Supabase trong bản hiện tại. Không tạo `js/cloudsync.js` / `js/cloud-config.js`. Save chỉ `localStorage` key `com_tam_save_v1`. Mục 39 GAME_DESIGN giữ làm tham chiếu tương lai, không bắt buộc code.
- **Tóp mỡ (mục 40):** giá bán cộng thêm **7.000đ**/phần khi thêm vào đơn (khớp `data.js` / scoring).
- **Combo (mục 35):** dữ liệu runtime là `state.combos` (mảng, max 5), không hard-code số combo cố định trong logic bán hàng.
- 
## Quy tắc UI màn Bán hàng (chống rối khi thêm món mới)
- Vỉ nướng: chiều cao luôn tự co theo đúng số ô đang có (4/6/8), không đặt chiều cao cố định lớn hơn nội dung, không để lộ scrollbar bên trong vỉ.
- Dĩa/Hộp/Bọc (mục 28): chỉ hiện đúng nút liên quan tới loại phục vụ của khách đang chọn — Tại quán chỉ hiện Dĩa; Mang đi chỉ hiện Hộp và Bọc. Không hiện cả 3 cùng lúc.
- Danh sách món trong khay chia 3 nhóm có nhãn nhỏ: "Món chính" (luôn mở), "Nước mắm" và "Nước uống" (gập mặc định, tự bung khi đơn đang chọn cần món trong nhóm đó, hoặc bấm vào nhãn để mở). Khi thêm món/nhóm mới sau này, luôn xếp vào đúng 1 trong các nhóm này hoặc tạo nhóm gập mới — không thêm thẳng vào 1 lưới phẳng không phân nhóm.
- Trong mỗi nhóm, món đang cần cho đơn hiện tại (viền xanh, mục 27) luôn xếp lên đầu nhóm.
- Dòng hiển thị order (mục 25) giữ tối đa 1-2 dòng, giảm cỡ chữ hoặc rút gọn tên nếu cần, không để tràn quá 2 dòng trong bong bóng đơn.

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
