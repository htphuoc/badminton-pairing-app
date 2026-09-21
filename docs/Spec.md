# PROMPT: XÂY DỰNG APP XẾP CẦU THỦ CẦU LÔNG THÔNG MINH

## 0. THUẬT NGỮ & QUY ƯỚC GIAO DIỆN ĐÃ CHỐT

Đây là các quy ước bắt buộc, áp dụng xuyên suốt toàn bộ app — nếu phần nào bên dưới còn dùng thuật ngữ cũ thì lấy mục này làm chuẩn.

| Khái niệm | Dùng | Không dùng |
|---|---|---|
| 4 cấp trình độ | `Y` (Yếu) / `TBY` (Trung bình yếu) / `TB` (Trung bình) / `K` (Khá) | thang điểm số, thang khác |
| Loại thành viên | **Cố định** / **Vãng lai** | Fixed / Casual |
| Loại trận đấu | **Đôi Nam** / **Đôi Nữ** / **Đôi Nam Nữ** | MD / WD / XD (chỉ dùng nội bộ trong code nếu cần, không hiển thị cho người dùng) |
| Trường tên người chơi | chỉ 1 trường **"Tên"** | không tách "Họ" và "Tên" riêng, không dùng nhãn "Họ và tên" |
| Tên thương hiệu app | **CẦU LÔNG 360°** | Badminton Session / BADMINTON SESSION |
| Avatar giới tính | avatar thể thao nam (xanh) / nữ (hồng) đúng giới tính | chữ cái đầu tên, icon Mars/Venus thay avatar |

**Tiêu đề màn hình**: toàn bộ tiêu đề chính của mỗi màn hình (header/app bar) viết hoa toàn câu (UPPERCASE), cụ thể:

| Màn hình | Tiêu đề |
|---|---|
| Danh sách thành viên | **DANH SÁCH THÀNH VIÊN** |
| Form thêm thành viên | **THÊM THÀNH VIÊN** |
| Tạo buổi chơi mới | **TẠO BUỔI CHƠI** |
| Bảng chia tiền cuối buổi | **BẢNG CHIA TIỀN** |

Các tiêu đề màn hình khác (Match Preview, Lịch sử, Thống kê, Cài đặt...) áp dụng cùng nguyên tắc viết hoa toàn câu.

**Xoá thành viên**: cho phép Admin xoá thành viên (khác với việc chỉ tắt `active=false`), nhưng bắt buộc có hộp thoại xác nhận rõ ràng (nêu tên người sắp xoá, cảnh báo không thể hoàn tác). Vì Match/Session lưu tên người chơi dạng snapshot độc lập tại thời điểm diễn ra trận (không tham chiếu sống theo `playerId`), việc xoá một thành viên khỏi danh sách hiện tại **không làm mất hoặc sai lệch lịch sử các buổi chơi cũ**. Mục 6 bên dưới được cập nhật theo quy tắc này thay vì cấm xoá tuyệt đối.

---

## 1. ROLE

Bạn là **Senior Full-Stack Developer + UI/UX Designer + Algorithm Engineer**.

Hãy xây dựng một ứng dụng quản lý nhóm chơi cầu lông chuyên đánh **đôi (Doubles)**.

Ứng dụng phải ưu tiên:

* thao tác cực nhanh tại sân;
* giao diện dễ dùng trên điện thoại;
* xếp người công bằng;
* cân bằng trình độ;
* hạn chế một người phải chờ quá lâu;
* tránh lặp lại cùng đồng đội/cặp đấu;
* quản lý nhiều sân;
* theo dõi lịch sử từng buổi;
* tự động tính tiền cuối buổi.

**Không chỉ tạo UI mockup. Hãy xây dựng ứng dụng có logic hoạt động thực tế.**

---

# 2. PRODUCT GOAL

Ứng dụng dùng để quản lý một buổi chơi cầu lông với số sân linh hoạt (sân đánh số cố định **1 → 16**).

Ví dụ:

* 2 sân (vd. Sân 1, Sân 2)
* 3 sân (vd. Sân 1, Sân 2, Sân 5)
* 4 sân
* 5 sân

Khi tạo buổi: set **thời gian chơi** (slider, bội số 15 phút, mặc định 2h), chọn các sân sử dụng, và **chọn thành viên tham gia** từ danh sách (Cố định mặc định được chọn).

Mỗi sân đánh 1 trận đôi gồm:

**2 người vs 2 người**

Hệ thống phải hỗ trợ:

* Đôi Nam
* Đôi Nữ
* Đôi Nam Nữ

Admin có thể:

1. Auto hoàn toàn
2. Xếp tay
3. Auto trước → chỉnh → xác nhận

Mục tiêu của thuật toán là tạo ra các trận đấu **cân bằng + công bằng + xoay vòng tốt**.

---

# 3. TECHNOLOGY

Nếu không có yêu cầu khác, sử dụng:

### Frontend

Công nghệ đã chốt, không đổi sang stack khác:

* **React**
* **Vite**
* **Tailwind CSS**
* TypeScript
* Responsive design
* Mobile-first
* PWA-ready

Lý do chọn (tham khảo bảng so sánh đã thống nhất): nhẹ, build/deploy nhanh, dễ biến thành PWA, miễn phí, cấu hình đơn giản hơn các framework full-stack như Next.js.

### Cấu hình & cài đặt

* Ưu tiên **zero-config / cấu hình tối thiểu**: `npm install` → `npm run dev` là chạy được ngay, không cần thiết lập server, database hay biến môi trường phức tạp cho bản MVP (dùng localStorage/IndexedDB).
* File cấu hình (Tailwind, Vite, tsconfig) dùng giá trị mặc định hợp lý, có comment giải thích, không bắt người dùng cuối phải sửa code mới đổi được các thông số thường dùng (số sân mặc định, giá sân, giá cầu) — các giá trị này nằm trong màn hình **Cài đặt** (Settings) của app, không hard-code.
* Khi deploy, ưu tiên hướng dẫn 1 lệnh (ví dụ build ra static site để host miễn phí trên Cloudflare Pages/GitHub Pages/Vercel).

### Thương hiệu & giao diện (Look & Feel)

* Sử dụng **logo đã cung cấp** (cô gái đánh cầu lông, phong cách năng động, tông xanh lá – xanh ngọc – trắng/đen) làm biểu tượng app (app icon, favicon, header, splash screen PWA).
* Tên app hiển thị trên header toàn cục: **CẦU LÔNG 360°** (không dùng "BADMINTON SESSION").
* Avatar mặc định: bộ icon thể thao **nam (xanh) / nữ (hồng)** đúng giới tính trên Danh sách thành viên, Tạo buổi chơi, danh sách chờ.
* Bảng màu chủ đạo theo logo: **xanh ngọc/teal** làm accent chính (nút chính, trạng thái đang hoạt động, số liệu nổi bật), nền trắng/xám nhạt, thẻ (card) bo góc mềm, đổ bóng nhẹ.
* Phong cách UI bám theo bộ mockup đã cung cấp (Main, Auto Assign / Match Preview, Add New Member, Member List, Money Sharing, Tạo buổi chơi, Xếp thủ công): dạng thẻ (card-based), bottom navigation 4 mục (Thành viên / Lịch / Thống kê / Cài đặt) trên mobile, avatar tròn cho từng người chơi, badge trạng thái bằng chấm màu + nhãn chữ (không chỉ dùng màu).
* Ưu tiên giao diện:
  * sạch;
  * hiện đại;
  * thao tác nhanh;
  * dễ nhìn ngoài sân (ánh sáng mạnh, màn hình điện thoại);
  * button lớn, dễ bấm một tay;
  * typography rõ ràng, tương phản tốt;
  * không quá nhiều popup;
  * hạn chế thao tác nhập liệu thủ công.

Có thể sử dụng một UI component library phổ biến (ví dụ shadcn/ui trên nền Tailwind) nếu giúp tăng tốc phát triển, miễn giữ đúng bảng màu và bố cục đã mô tả.

### Storage

MVP sử dụng:

**localStorage hoặc IndexedDB**

để có thể dùng offline tại sân.

Thiết kế data layer đủ tốt để sau này có thể chuyển sang:

* REST API
* PostgreSQL / SQL Server
* Firebase / Supabase

mà không phải viết lại business logic.

---

# 4. USER ROLES

## Admin

Có toàn quyền:

* quản lý thành viên;
* tạo buổi chơi;
* chọn số sân;
* bật/tắt người chơi;
* chọn chế độ xếp;
* xác nhận trận;
* bắt đầu/kết thúc trận;
* chỉnh trận;
* quản lý chi phí;
* chốt buổi;
* xem thống kê;
* xem lịch sử.

## Member

MVP có thể chưa cần authentication.

Sau này hỗ trợ:

* xem trạng thái có mặt;
* xem sân đang đánh;
* xem lượt tiếp theo;
* xem lịch sử;
* xem tiền phải trả.

---

# 5. PLAYER MANAGEMENT

Mỗi người chơi có:

```text
Player
- id
- name
- gender
- skillLevel
- memberType
- active
- createdAt
- updatedAt
```

### Chỉnh sửa loại thành viên

Admin có thể mở **Chỉnh sửa thành viên** từ danh sách và chuyển loại thành viên theo cả hai chiều: `Vãng lai ↔ Cố định`.

Thay đổi có hiệu lực với buổi chơi tạo sau đó. Buổi đang chạy giữ nguyên danh sách người tham gia và dữ liệu snapshot tại thời điểm tạo, không tự động thêm/xoá người hoặc làm sai lịch sử.

## Gender

Chỉ gồm:

```text
MALE
FEMALE
```

## Skill Level

Chỉ sử dụng 4 cấp cố định:

```text
Y   = Yếu
TBY = Trung bình yếu
TB  = Trung bình
K   = Khá
```

Không tự ý thay đổi thành thang điểm khác trong MVP.

Có thể internally map sang số để phục vụ thuật toán:

```text
Y   = 1
TBY = 2
TB  = 3
K   = 4
```

## Member Type

```text
CỐ ĐỊNH
VÃNG LAI
```

### Cố định

Mỗi khi tạo Session mới:

```text
attendance = PRESENT
```

### Vãng lai

Mỗi khi tạo Session mới:

```text
attendance = ABSENT
```

Admin có thể bật sang:

```text
PRESENT
```

khi người đó đến sân.

---

# 6. XOÁ THÀNH VIÊN (CÓ XÁC NHẬN)

Business rule đã cập nhật: **cho phép xoá thành viên**, khác với bản nháp trước (chỉ ẩn bằng `active=false`).

Quy tắc bắt buộc:

1. Xoá là một hành động nguy hiểm → **luôn hiển thị hộp thoại xác nhận**, nêu rõ tên thành viên sắp xoá và không thể hoàn tác.
2. Để lịch sử không bị vỡ dữ liệu khi xoá, mỗi `Match`/`SessionPlayer` phải lưu **tên người chơi dạng snapshot** (chuỗi text tại thời điểm trận đấu diễn ra), không chỉ lưu `playerId` tham chiếu. Nhờ vậy:
   * Xoá một `Player` khỏi danh sách hiện tại **không** làm mất tên người đó trong lịch sử các Session cũ.
   * Không cần cấm xoá vật lý như quy tắc cũ.
3. Nếu vẫn muốn giữ khả năng "khôi phục" thay vì xoá hẳn, có thể cung cấp thêm tuỳ chọn `active = false` (ẩn khỏi danh sách chọn nhưng chưa xoá) như một bước trung gian trước khi Admin xoá hẳn — nhưng đây là tuỳ chọn nâng cao, không bắt buộc cho MVP.
4. Không được xoá một thành viên đang ở trạng thái `PLAYING` (đang thi đấu) — phải kết thúc trận trước.

---

# 7. SESSION

Mỗi buổi chơi là một Session độc lập.

```text
Session
- id
- date
- startTime
- endTime
- plannedDurationMinutes   // thời gian chơi đã set (bội số 15 phút)
- numberOfCourts
- courtNumbers             // mảng số sân đã chọn, ví dụ [1, 2, 5] (từ 1→16)
- status
- players
- matches
- costs
- createdAt
- updatedAt
```

Session status:

```text
PLANNED
RUNNING
FINISHED
```

---

# 8. SESSION SETUP

Khi tạo buổi chơi (màn hình **TẠO BUỔI CHƠI**):

Admin chọn:

### Ngày

Mặc định:

```text
Today
```

### Thời gian chơi (planned duration)

- Dùng **thanh trượt (slider)** giống mockup: nhãn "Thời gian chơi:" + giá trị dạng `Xh Ym` (ví dụ `2h 0m`).
- **Bội số của 15 phút** (15, 30, 45, 60, …).
- **Tối thiểu**: 15 phút.
- **Tối đa**: 6 giờ (360 phút).
- **Mặc định**: 2 giờ (120 phút).
- Giá trị này dùng để tính **chi phí sân** cuối buổi — **không** tính theo thời gian đánh thực tế của từng trận.
- Persist vào `session.plannedDurationMinutes`.

### Số sân & danh sách sân

- Sân được **đánh số cố định từ 1 đến 16** (Sân 1, Sân 2, …, Sân 16).
- Admin chọn **số lượng sân** sử dụng trong buổi (mặc định 3) và/hoặc chọn **các số sân cụ thể** trong khoảng 1–16.
- `numberOfCourts` = số phần tử của `courtNumbers`.
- Mặc định gợi ý: Sân 1, 2, 3 (có thể đổi).

### Chọn thành viên tham gia (từ danh sách)

Trên màn hình tạo buổi, **hiển thị danh sách toàn bộ thành viên** (active) để Admin chọn ai tham gia buổi này:

```text
┌──────────────────────────────────────┐
│  THÀNH VIÊN THAM GIA                 │
│                                      │
│  ☑ Nguyễn A     M · TB · Cố định     │
│  ☑ Trần B       F · K  · Cố định     │
│  ☐ Lê C         M · TBY · Vãng lai   │
│  ☐ Phạm D       F · Y  · Vãng lai    │
│  ...                                 │
│                                      │
│  [Chọn tất cả Cố định]  [Bỏ chọn]    │
└──────────────────────────────────────┘
```

Quy tắc mặc định khi mở form tạo buổi:

| Loại thành viên | Mặc định checkbox | attendance khi tạo Session |
|---|---|---|
| **Cố định** | **Được chọn (checked)** | `PRESENT` → vào Waiting Queue |
| **Vãng lai** | **Không chọn (unchecked)** | `ABSENT` |

- Admin có thể **bật/tắt** từng người (tick/untick) trước khi tạo buổi.
- Chỉ những người **được chọn** mới đưa vào `session.players` với `attendance = PRESENT` (WAITING).
- Người không chọn: không thêm vào session, hoặc thêm với `ABSENT` (tuỳ implement — khuyến nghị chỉ thêm người đã chọn để gọn).
- Có nút tiện ích: **“Chọn tất cả Cố định”**, **“Bỏ chọn tất cả”**, filter theo giới tính / trình độ nếu danh sách dài.
- Sau khi buổi đã chạy, Admin thêm người từ nút **THÊM THÀNH VIÊN** trên màn hình chính (cạnh **THÊM SÂN**). Màn hình này chỉ liệt kê thành viên **chưa có trong buổi** (ở ngoài), cùng kiểu thẻ 2 cột như lúc tạo buổi: avatar đúng giới tính, tên, trình độ, số trận lịch sử (`Ntr`), Cố định/Vãng lai. Chọn một hoặc nhiều người rồi xác nhận — họ vào Waiting Queue (`attendance = WAITING`). Không hiện lại người đang chờ hoặc đang đánh.

---

# 9. MAIN SCREEN

Màn hình chính phải tối ưu cho điện thoại.

Layout:

```text
┌──────────────────────────────┐
│  ĐANG CHƠI                   │
│  19/09/2026 · 3 sân · 2h 0m  │
├──────────────────────────────┤
│ [THÊM THÀNH VIÊN] [THÊM SÂN] │  ← hai nút cạnh nhau
├──────────────────────────────┤
│  SÂN 1              ĐÔI NAM  │  ← loại trận ở header card
│  ┌────────────────────────┐  │
│  │ sân ngang, nét trắng   │  │
│  │ avatar+tên trong 4 ô   │  │
│  │ ⏱ 23 phút      12:32   │  │
│  │ [🔚 KẾT THÚC TRẬN]     │  │
│  │ [TRẢ SÂN] (disabled)   │  │
│  └────────────────────────┘  │
│  SÂN 2                       │
├──────────────────────────────┤
│ ĐANG CHỜ  (2 cột)            │
│ [avatar] Nam TB ·3tr ·Cố định│
│ [XẾP TỰ ĐỘNG]                │
└──────────────────────────────┘
```

Lưu ý: nhãn sân dùng "SÂN 1", "SÂN 2", … (số từ 1→16). Header hiển thị thêm thời gian chơi đã set (vd. 2h 0m). Nút **TRẢ SÂN** chỉ **enabled** với sân được thêm sau khi buổi đã chạy; sân chọn lúc tạo buổi thì nút disabled/xám. Nút thêm sân ghi **THÊM SÂN** (không dùng "BỔ SUNG SÂN").

### Kẻ sân (Court Drawing)

Mỗi sân đang chơi hiển thị hình **kẻ sân cầu lông nằm ngang**, nền xanh đặc, **chỉ đường trắng mảnh** — không tô ô, không gradient, không badge hay tên đè lên đường kẻ:

- **Biên ngoài** — hình chữ nhật sân đôi
- **Hai đường biên đơn** — song song cạnh dài, tạo lối đi (alley)
- **Lưới** — nét **đứt** trắng, thẳng đứng đúng giữa sân
- **Đường giao cầu ngắn** — hai đường thẳng đứng, mỗi bên một đường, gần lưới
- **Đường giao cầu dài (đôi)** — hai đường thẳng đứng sát hai biên cuối
- **Đường giữa** — từ đường giao cầu ngắn tới biên cuối, chia mỗi nửa sân thành ô trên và ô dưới

**Avatar kèm tên** của 4 cầu thủ đặt **giữa 4 ô giao cầu** (ô chữ nhật không có đường kẻ cắt qua). Không đặt ở bốn góc, không đặt lên đường kẻ, không dùng nhãn nền tối che sân. Tên một dòng, cắt bớt nếu dài.

**Loại trận** (`ĐÔI NAM` / `ĐÔI NỮ` / `ĐÔI NAM NỮ`) hiển thị ở **header của card sân** (badge màu), không vẽ lại giữa hình sân.

**Thời gian thực (live timer):**

- Hiển thị **tổng số phút đang chạy** của trận (ví dụ: `⏱ 23 phút`)
- Cạnh đó hiển thị giờ bắt đầu trận (ví dụ: `12:32`)
- Timer update mỗi 30 giây hoặc 1 phút (không cần update mỗi giây để tiết kiệm render)
- Dùng `elapsed = currentTime - match.startTime` thay vì counter, tránh sai khi browser sleep

**Nút Kết thúc trận** (`🔚 KẾT THÚC TRẬN`):

- Nằm **bên trong** card kẻ sân, ở phần dưới (sau timer)
- Không nằm ngoài card, tránh chiếm không gian
- Kích thước đủ bấm bằng ngón tay (min-height 44px)
- Màu nổi bật (đỏ/cam) để dễ phân biệt với nút AUTO ASSIGN

### Danh sách chờ (Waiting Queue) — 2 cột

Danh sách chờ hiển thị **2 cột** để tiết kiệm không gian màn hình:

```text
┌─────────────────────────────────────┐
│ ĐANG CHỜ (8 người)                   │
│                                      │
│ 🟢 Nam    TB  ·3tr  │ 🟢 Hùng  K  ·8p │
│ 🟢 Minh  TBY ·6p   │ 🟡 Lan   Y  ·2p │
│ 🟢 Tuấn   TB  ·4p  │ 🟢 Hoa  TBY ·1tr│
│ 🟢 Đức    K   ·0p  │ 🟢 Mai   TB  ·5p │
└─────────────────────────────────────┘
```

Mỗi ô trong queue hiển thị tối giản: **avatar đúng giới tính + Tên + Trình độ + số trận trong buổi (`Ntr`) + Cố định/Vãng lai**.

Ưu tiên:

* avatar giới tính;
* tên người;
* trình độ;
* số trận đã tham gia trong buổi;
* loại Cố định/Vãng lai.

### Danh sách chờ

Mỗi hàng hiển thị đủ thông tin nhận diện nhanh khi xếp lượt: avatar, tên, trình độ, số trận trong buổi, loại thành viên.

**Cập nhật UI:** danh sách thành viên, danh sách đăng ký buổi chơi (grid trên **TẠO BUỔI CHƠI**), màn **THÊM THÀNH VIÊN** giữa buổi (chỉ người chưa tham gia) và danh sách chờ đều hiển thị: **avatar nam/nữ đúng giới tính**, Tên, trình độ, số trận (tổng lịch sử trên danh sách thành viên / tạo buổi / thêm thành viên; trong buổi trên danh sách chờ), và Cố định/Vãng lai.

Mỗi sân đã chọn luôn xuất hiện thành một thẻ riêng. Với sân trống, Admin chọn **Tự động** (xem đề xuất, xác nhận hoặc làm lại) hoặc **Xếp thủ công** (chọn đúng 4 cầu thủ; hai người đầu là Đội A).

---

# 10. PLAYER STATUS

Một player trong Session có thể ở:

```text
ABSENT
WAITING
PLAYING
RESTING
FINISHED
```

Logic:

```text
PRESENT → WAITING
WAITING → PLAYING
PLAYING → RESTING
RESTING → WAITING
```

Khi Session kết thúc:

```text
→ FINISHED
```

---

# 11. COURT STATUS

Mỗi sân:

```text
AVAILABLE
PLAYING
PAUSED
```

Thông thường:

```text
AVAILABLE → PLAYING → AVAILABLE
```

Không được cho phép 2 Match active cùng lúc trên một Court.

### Số sân & chọn sân khi xếp trận

- Danh sách sân toàn hệ thống: **Sân 1 → Sân 16** (cố định).
- Khi tạo / xếp trận (Match Preview, Auto Assign, Manual Assign), **tự động hiện danh sách sân** thuộc buổi chơi hiện tại (các `courtNumbers` đã chọn khi tạo Session).
- Admin **chọn sân** ngay lúc bắt đầu/xác nhận trận (dropdown hoặc danh sách nút Sân 1, Sân 2, …).
- Chỉ cho chọn sân đang `AVAILABLE` trong session; sân đang `PLAYING` bị disable / ẩn.
- `match.courtId` lưu số sân đã chọn (1–16).

---

# 12. THREE ASSIGNMENT MODES

## MODE 1 – AUTO

Hệ thống tự động:

1. chọn 4 người;
2. chọn loại trận;
3. chia 2 đội;
4. đưa ra recommendation;
5. admin xác nhận.

Nếu yêu cầu UX là "Auto hoàn toàn", sau khi admin bấm:

```text
AUTO ASSIGN
```

có thể xác nhận tự động theo setting.

Tuy nhiên vẫn phải có Undo.

---

# 13. MODE 2 – MANUAL

Admin chọn đúng 4 người từ Waiting Queue.

Ví dụ:

```text
☑ Nam
☑ Hùng
☑ Minh
☑ Tuấn
```

Sau khi đủ 4:

```text
[CREATE MATCH]
```

Hệ thống tự tính cách chia đội tốt nhất.

Admin có thể:

```text
SWAP
RANDOMIZE
CHANGE TYPE
CONFIRM
```

Không cho chọn 3 hoặc 5 người.

---

# 14. MODE 3 – AUTO THEN EDIT

Đây là mode mặc định đề xuất.

Hệ thống:

```text
1. chọn 4 người
2. chọn loại trận
3. chia Team A / Team B
4. hiển thị Preview
```

Ví dụ:

```text
┌──────────────────────────────┐
│ MATCH PREVIEW                │
│                              │
│ Team A                       │
│ Nguyễn Văn A      TB         │
│ Nguyễn Văn B      K          │
│                              │
│          VS                  │
│                              │
│ Team B                       │
│ Nguyễn Văn C      TB         │
│ Nguyễn Văn D      K          │
│                              │
│ Type: ĐÔI NAM NỮ             │
│                              │
│ Sân: [SÂN 1 ▼]  (list 1–16,  │
│      chỉ hiện sân AVAILABLE) │
│                              │
│ Balance Score: 92%           │
│                              │
│ [CHANGE PLAYERS]             │
│ [SWAP TEAMS]                 │
│ [SHUFFLE]                    │
│ [CONFIRM]                    │
└──────────────────────────────┘
```

Trên màn hình xếp trận (Auto / Manual / Preview) **luôn tự động hiện danh sách sân** của buổi (các số sân đã chọn), cho admin chọn sân trước khi CONFIRM / START.

---

# 15. MATCH TYPES

## ĐÔI NAM

4 người đều:

```text
MALE
```

## ĐÔI NỮ

4 người đều:

```text
FEMALE
```

## ĐÔI NAM NỮ

Phải có:

```text
2 MALE
2 FEMALE
```

Mặc định:

```text
Male + Female
vs
Male + Female
```

Nếu admin chọn type thủ công thì phải validate điều kiện.

Không cho tạo:

```text
3 male + 1 female → ĐÔI NAM NỮ
```

---

# 16. SMART MATCHING ALGORITHM

Đây là phần quan trọng nhất.

Input:

```text
Waiting Players
- skillLevel
- gender
- waitingTime          // số giây/phút đã chờ liên tục từ lần cuối kết thúc trận
- matchesPlayed        // số trận đã đánh trong buổi
- minutesPlayed        // số phút đã đánh trong buổi
- previous teammates   // danh sách playerId đã là đồng đội
- previous opponents   // danh sách playerId đã là đối thủ
```

---

# 17. FAIRNESS PRIORITY – ƯU TIÊN NGƯỜI ĐỢI LÂU

**Nguyên tắc cốt lõi**: Người chờ lâu nhất phải được ưu tiên vào trận trước. Đây là quy tắc quan trọng nhất, vượt trên cân bằng trình độ khi cần.

Không đơn giản chỉ sort:

```text
waitingTime DESC
```

Mà tạo `priorityScore` cho từng người theo công thức:

```text
priorityScore =
    w1 × normalizedWaitingTime      // ưu tiên cao nhất
    + w2 × (1 - normalizedMatches)  // người đánh ít được ưu tiên hơn
    + w3 × (1 - normalizedMinutes)  // người đánh ít phút được ưu tiên hơn
```

**Trọng số mặc định (configurable trong Settings):**

```text
w1 (waitingWeight)     = 0.60   // ưu tiên hàng đầu
w2 (matchCountWeight)  = 0.25
w3 (minutesWeight)     = 0.15
```

**Chuẩn hoá (Normalization):**

```text
normalizedWaitingTime = waitingSeconds / maxWaitingSecondsInQueue
normalizedMatches     = matchesPlayed  / maxMatchesPlayedInSession
normalizedMinutes     = minutesPlayed  / maxMinutesPlayedInSession
```

Nếu chỉ có 1 người trong queue (mẫu số = 0), gán giá trị = 0 (tránh chia 0).

**Kết quả thực tế:**

| Người | Chờ | Trận | Phút | priorityScore |
|---|---|---|---|---|
| A | 20 phút | 1 | 15 | **Cao nhất** → xếp vào trước |
| B | 5 phút  | 3 | 60 | Thấp hơn |
| C | 3 phút  | 0 | 0  | Trung bình (mới vào, chờ ít) |

**Quy trình chọn 4 người cho 1 trận:**

1. Tính `priorityScore` cho tất cả người đang `WAITING`.
2. Chọn **4 người có priorityScore cao nhất** làm ứng viên ban đầu.
3. Trong 4 người này, tìm cách chia 2 đội tối ưu theo `skillBalance`.
4. Nếu không thoả điều kiện giới tính (ví dụ cần 2M+2F nhưng không đủ), mở rộng tập ứng viên sang người thứ 5, 6… cho đến khi tìm được tổ hợp hợp lệ.
5. Nếu người đợi lâu nhất buộc phải bị bỏ qua do không thoả điều kiện giới tính, ghi nhận lý do và hiển thị trong `reasons[]`.

**Ràng buộc bắt buộc** (không được vi phạm dù score thấp):

- Không xếp người đang `PLAYING` hoặc `ABSENT`.
- Không cho 1 người xuất hiện ở 2 sân cùng lúc.
- Loại trận phải hợp lệ về giới tính (xem mục 15).

**Mục tiêu cuối buổi:**

> Chênh lệch số trận giữa những người đã đến (PRESENT) phải thấp nhất có thể.
> Không cần tuyệt đối bằng nhau nếu điều kiện thực tế không cho phép.

---

# 18. SKILL BALANCE

Skill mapping:

```text
Y   = 1
TBY = 2
TB  = 3
K   = 4
```

Team skill:

```text
teamSkill = sum(player.skill)
```

Ví dụ:

```text
Team A:
K + Y = 5

Team B:
TB + TBY = 5
```

→ rất cân.

Một cách chia khác:

```text
K + TB = 7

Y + TBY = 3
```

→ không cân.

Thuật toán phải ưu tiên:

```text
abs(teamA.skill - teamB.skill)
```

càng nhỏ càng tốt.

---

# 19. MATCH SCORE

Mỗi candidate match phải có score.

Ví dụ:

```text
Match Score =
    Skill Balance
    + Waiting Fairness
    + Match Count Fairness
    + Playing Time Fairness
    + Partner Diversity
    + Opponent Diversity
```

Score càng cao càng tốt.

Có thể sử dụng trọng số configurable:

```text
skillWeight
waitingWeight
matchCountWeight
minutesWeight
partnerRepeatPenalty
opponentRepeatPenalty
```

Không hard-code toàn bộ logic vào UI.

Tách thành:

```text
matchingEngine
```

để dễ test và thay đổi sau này.

---

# 20. REPEAT PARTNER RULE

Không ưu tiên ghép lại cùng đồng đội nhiều lần liên tiếp.

Ví dụ:

```text
A + B
```

vừa đánh xong.

Trận tiếp theo:

```text
A + B
```

phải bị penalty.

Nếu thiếu người và không còn phương án khác:

> vẫn được phép ghép lại.

Không được làm thuật toán fail chỉ vì rule này.

---

# 21. REPEAT OPPONENT RULE

Tương tự:

Nếu:

```text
A + B vs C + D
```

vừa xảy ra,

thì trận tiếp theo nên tránh:

```text
A + B vs C + D
```

hoặc cùng một cặp đối thủ nếu còn lựa chọn khác.

---

# 22. FAIR ROTATION

Theo dõi:

```text
matchesPlayed
totalMinutesPlayed
lastMatchEndTime
waitingTime
```

Ví dụ:

```text
Player A
matches = 2
minutes = 40

Player B
matches = 5
minutes = 100
```

Nếu cả hai cùng chờ:

> ưu tiên A.

Mục tiêu cuối buổi:

```text
chênh lệch số trận thấp
chênh lệch thời gian chơi thấp
```

nhưng không cần tuyệt đối bằng nhau nếu điều kiện thực tế không cho phép.

---

# 23. SHUFFLE

Nút:

```text
SHUFFLE
```

không được random mù.

Phải:

1. tạo nhiều candidate;
2. tính score;
3. chọn các phương án hợp lệ;
4. random trong nhóm phương án có score gần nhau.

Mục tiêu:

> Shuffle tạo cảm giác đa dạng nhưng vẫn giữ chất lượng trận.

---

# 24. AUTO MATCH TYPE

Nếu Auto:

Hệ thống phân tích:

```text
number of males waiting
number of females waiting
```

Ví dụ:

```text
2M + 2F
```

→ ĐÔI NAM NỮ là candidate tốt.

```text
4M
```

→ ĐÔI NAM.

```text
4F
```

→ ĐÔI NỮ.

Nếu nhiều lựa chọn:

> đưa recommendation cho admin.

Ví dụ:

```text
Recommended: ĐÔI NAM NỮ

Reason:
2 male + 2 female are waiting
```

Admin vẫn có thể đổi.

---

# 25. START MATCH

Khi admin bấm:

```text
START MATCH
```

(hoặc CONFIRM trên Match Preview):

1. Bắt buộc đã chọn **sân** (court number 1–16 thuộc session, đang AVAILABLE).
2. Hệ thống:

```text
match.status = PLAYING
match.startTime = currentTime
match.courtId = selectedCourtNumber

court.status = PLAYING

all 4 players.status = PLAYING
```

Timer chạy realtime (dùng để theo dõi thời gian từng trận và fairness, **không** dùng để tính chi phí sân).

---

# 26. END MATCH

Khi:

```text
END MATCH
```

hệ thống:

```text
match.endTime = currentTime
match.status = COMPLETED
```

Tính:

```text
durationMinutes
```

và cộng vào:

```text
player.totalMinutesPlayed
player.totalMatchesPlayed
```

4 player chuyển về:

```text
WAITING
```

trừ khi admin chọn:

```text
REST
```

---

# 27. TIMER

Timer phải dùng:

```text
startTime
```

thay vì chỉ tăng counter mỗi giây.

Ví dụ:

```text
elapsed =
currentTime - startTime
```

để tránh sai thời gian khi:

* browser background;
* refresh;
* mất focus;
* điện thoại sleep.

---

# 28. EDIT ACTIVE MATCH

Admin có thể:

```text
Replace Player
Swap Team
Change Type
End Match
```

Nhưng phải cảnh báo nếu thay đổi ảnh hưởng đến lịch sử.

Không được làm mất dữ liệu match cũ.

Nếu thay player giữa trận:

> tạo event/history thay đổi thay vì overwrite toàn bộ lịch sử.

---

# 29. COST MANAGEMENT

Session có:

```text
CostSettings
```

```text
courtFeeFixedPerHour    // Giá thuê sân cố định / giờ (VND)
courtFeeCasualPerHour   // Giá thuê sân vãng lai / giờ (VND)
shuttleCostPerShuttle   // Đơn giá cầu / quả (không phải giá ống)
splitMethod
femaleDiscountPercent  // mặc định 10
```

> **Đã loại bỏ `otherFee` / chi phí khác** khỏi Cài đặt và Bảng chia tiền.

Ví dụ:

```text
Court fee (Cố định):
130,000 VND / court / hour

Court fee (Vãng lai):
180,000 VND / court / hour

Cầu:
28,000 VND / quả      ← Đơn giá cầu / quả
```

Không hard-code giá.

Admin có thể thay đổi trong màn **THIẾT LẬP CÀI ĐẶT**.

`splitMethod` chỉ gồm **Chia đều** và **Theo số trận**; loại bỏ chia theo số phút. Khi tính phần tiền, trọng số của cầu thủ nữ được giảm `femaleDiscountPercent` so với cầu thủ nam (mặc định 10%), sau đó chuẩn hoá để tổng vẫn bằng tổng chi phí.

**Giá trị mặc định:** giá thuê sân cố định **130.000đ / 60 phút**, giá thuê sân vãng lai **180.000đ / 60 phút**, đơn giá cầu **28.000đ / quả**.

Tại **Bảng chia tiền**, Admin nhập số quả cầu đã sử dụng. Tổng chi phí cùng phần tiền mỗi người phải tính lại ngay và có nút lưu cho buổi chơi đó. Box tổng tiền hiển thị QR thanh toán do Admin cung cấp để chụp màn hình và gửi nhóm.

**Bảng chia tiền phải liệt kê tất cả thành viên đã tham gia buổi** (mọi `SessionPlayer` có `attendance ≠ ABSENT`), kể cả người có `matchesPlayed = 0`. Không được lọc chỉ những người đã đánh ít nhất 1 trận — đó là lỗi khiến danh sách trống.

**Bảng chia tiền hiển thị mới nhất lên đầu**: danh sách các buổi chơi trong màn hình bảng chia tiền / lịch sử sắp theo thứ tự **giảm dần theo ngày** (buổi gần nhất xuất hiện ở vị trí đầu tiên).

Trong khi buổi chơi đang chạy, header màn hình có **hai nút cạnh nhau**: **THÊM THÀNH VIÊN** và **THÊM SÂN** (không dùng nhãn "BỔ SUNG SÂN").

**THÊM THÀNH VIÊN** mở màn hình chọn người **chưa có trong buổi**. Danh sách cùng kiểu thẻ với màn tạo buổi (đủ thông tin): avatar đúng giới tính, tên, trình độ, số trận lịch sử, Cố định/Vãng lai. Người được chọn vào hàng chờ.

**THÊM SÂN** mở modal gồm: chọn số sân (Sân 1–16 chưa dùng) + **thanh trượt thời gian** (bội 15 phút, **mặc định 1h = 60 phút**). **Không nhập đơn giá riêng** — sân thêm sau **tự động lấy đơn giá vãng lai** (`courtFeeCasualPerHour`). Sân này được đánh dấu `isSupplemental`; chỉ sân này mới enable nút **TRẢ SÂN**, và **chỉ khi sân không còn trận đang chơi** (đã bấm KẾT THÚC TRẬN).

Trên card sân trống, 3 nút nằm **cùng một hàng**: **XẾP TỰ ĐỘNG** | **Thủ công** | **TRẢ SÂN**. Nút xếp toàn cục dưới danh sách chờ cũng dùng nhãn **XẾP TỰ ĐỘNG** (không dùng "AUTO ASSIGN").

---

# 30. COURT COST

## 6. QUY TRÌNH TÍNH TIỀN SÂN CHI TIẾT (COST RECONCILIATION)

Đơn giá dùng khi quy đổi tiền sân:

* Thành viên **Cố định** → `courtFeeFixedPerHour`
* Thành viên **Vãng lai** → `courtFeeCasualPerHour`
* Tổng tiền sân buổi = `(tổng giờ sân billable) × (đơn giá trung bình của người tham gia)`

Trong đó mỗi sân có số phút billable riêng theo 3 trường hợp:

### 1) Sân chơi trọn buổi (sân chọn lúc tạo buổi)

```text
Tiền sân (phần giờ) = Số sân × (Thời gian kế hoạch (phút) / 60)
→ nhân với đơn giá trung bình theo loại thành viên tham gia
```

### 2) Sân trả sớm (TRẢ SÂN) — chỉ sân bổ sung

```text
Phút thực tế = Thời điểm bấm Trả – Thời điểm Bắt đầu (sân bổ sung)
Phút làm tròn = ⌈Phút thực tế / 30⌉ × 30
(không vượt quá thời gian bổ sung đã set trên slider)
Tiền sân = (Phút làm tròn / 60) × đơn giá
```

Nút **TRẢ SÂN** trên card sân: **enabled chỉ khi sân là sân bổ sung** và chưa trả; sân ban đầu → disabled (xám).

### 3) Sân bổ sung (chưa trả sớm)

```text
Tiền sân bổ sung = (Thời gian bổ sung trên slider / 60) × đơn giá
(hoặc tính theo thời gian trả sân thực tế nếu trả trước hạn — mục 2)
```

**Không** cộng dồn thời gian từng match để tính tiền sân.

---

# 31. SHUTTLE COST

Admin nhập:

```text
numberOfShuttles     // Số quả cầu đã dùng
pricePerShuttle      // Đơn giá cầu / quả (VND)
```

Tổng chi phí cầu:

```text
shuttleCost = numberOfShuttles × pricePerShuttle
```

Ví dụ:

```text
5 quả × 28,000 VND/quả = 140,000 VND
```

Label trong UI: **"Đơn giá cầu / quả"** (không dùng "Giá ống cầu", "Giá/tube", hay "Giá cầu/ống").

---

# 32. OTHER COST

**Đã loại bỏ.** Không còn trường chi phí khác trong Cài đặt hay Bảng chia tiền. Tổng chi phí = tiền sân + tiền cầu.

---

# 33. COST SPLIT METHOD

Hỗ trợ:

## METHOD 1 – EQUAL

Chia đều cho tất cả người tham gia.

```text
totalCost / participantCount
```

## METHOD 2 – BY MINUTES

Người chơi nhiều phút trả nhiều hơn.

Ví dụ:

```text
Player A = 60 minutes
Player B = 120 minutes
```

Player B chịu phần chi phí lớn hơn.

## METHOD 3 – BY MATCHES

Tuỳ chọn nâng cao:

```text
cost / totalMatches
```

Mỗi match participation có trọng số tương ứng.

---

# 34. ROUNDING MONEY

VND không dùng decimal nhỏ.

Khi chia tiền:

```text
round to nearest 1,000 VND
```

Nếu rounding tạo chênh lệch:

> phân bổ phần dư vào người có phần tiền lớn nhất hoặc cho phép admin điều chỉnh.

Tổng tiền người chơi phải trả:

```text
== total session cost
```

Không được lệch.

---

# 35. END SESSION

Khi admin bấm:

```text
FINISH SESSION
```

hiển thị confirmation:

```text
Are you sure?

Total players: 18
Total matches: 24
Total cost: 1,250,000 VND

[BACK]
[FINISH SESSION]
```

Sau khi finish:

```text
session.status = FINISHED
```

Không cho sửa dữ liệu quan trọng trực tiếp.

Nếu cần:

```text
Reopen Session
```

chỉ dành cho Admin.

---

# 36. SESSION SUMMARY

Sau khi kết thúc:

```text
SESSION SUMMARY

Date: 19/09/2026
Courts: 3
Players: 18
Matches: 24

Total Court Cost: 600,000
Total Shuttle Cost: 600,000
Other Cost: 50,000

TOTAL:
1,250,000 VND
```

---

# 37. PLAYER SUMMARY

Hiển thị:

| Player | Matches | Minutes | Amount |
| ------ | ------: | ------: | -----: |
| A      |       5 |     100 | 70,000 |
| B      |       4 |      80 | 60,000 |

Có filter:

```text
All
Male
Female
Y
TBY
TB
K
```

---

# 38. STATISTICS

Session statistics:

```text
Most Played
Least Played
Longest Waiting
Highest Waiting Time
Most Partner Repeats
Most Opponent Repeats
```

Ví dụ:

```text
🏆 Most Played
Nguyễn A – 6 matches

⏳ Longest Waiting
Nguyễn B – 24 min

⚖ Most Balanced Player
Nguyễn C
```

Không cần tạo ranking tổng thể trong MVP nếu không có đủ dữ liệu.

---

# 39. HISTORY

Cho phép xem danh sách:

```text
Sessions
```

Sắp xếp: **mới nhất lên đầu** (giảm dần theo ngày).

**Mỗi buổi chơi hiển thị trong 1 dòng duy nhất** dạng nút/thẻ bấm được (compact row), đủ thông tin nhận diện:

```text
┌─────────────────────────────────────────────────────┐
│ 📅 19/09/2026  18 người · 24 trận · 3 sân · 1,250k  │  ← nút bấm
├─────────────────────────────────────────────────────┤
│ 📅 12/09/2026  16 người · 20 trận · 3 sân · 1,050k  │  ← nút bấm
└─────────────────────────────────────────────────────┘
```

Mỗi dòng là một **nút bấm** (button / clickable row), không cần accordion hay thẻ mở rộng mặc định.

Thông tin bên trong mỗi nút (1 dòng, viết tắt):

| Trường | Ví dụ |
|---|---|
| Ngày | 19/09/2026 |
| Số người | 18 người |
| Số trận | 24 trận |
| Số sân | 3 sân |
| Tổng tiền | 1,250k |

Click/tap vào nút:

> mở trang chi tiết buổi chơi → xem toàn bộ lịch sử trận, bảng chia tiền, thống kê.

---

# 40. MATCH HISTORY

Mỗi Match phải lưu:

```text
id
sessionId
courtId
type

team1
team2

startTime
endTime
duration

createdMode
AUTO
MANUAL
AUTO_EDITED

createdAt
updatedAt
```

Không được overwrite lịch sử cũ.

---

# 41. UNDO

Các thao tác quan trọng nên hỗ trợ Undo:

```text
Undo Assign
Undo End Match
Undo Remove Player
Undo Change Team
```

MVP tối thiểu:

```text
Undo End Match
Undo Last Assignment
```

---

# 42. VALIDATION

Không cho:

### Trùng player

Một player không thể xuất hiện trong 2 active matches.

### Thiếu player

Match phải có:

```text
4 players
```

### Trùng court

Một court không thể có 2 active matches.

### Sai loại trận

ĐÔI NAM:

```text
4 male
```

ĐÔI NỮ:

```text
4 female
```

ĐÔI NAM NỮ:

```text
2 male + 2 female
```

### Player absent

Không được xếp người:

```text
ABSENT
```

### Player đang đánh

Không được xếp người:

```text
PLAYING
```

---

# 43. EDGE CASES

Phải xử lý:

### Chỉ có 3 người chờ

Hiển thị:

```text
Not enough players

Need 1 more player
```

### Có 5 người

Không tự ý loại người thứ 5.

Hiển thị:

```text
4 players can be assigned.
1 player remains waiting.
```

Thuật toán chọn người phù hợp dựa trên fairness.

### Có 8 người và 3 sân

Chỉ có tối đa:

```text
8 players playing
```

1 sân không thể hoạt động nếu không đủ 4 người.

### Không thể tạo trận cân bằng

Không được fail.

Hiển thị:

```text
No perfectly balanced match found.

Best available option:
Skill difference: 2

[USE THIS MATCH]
[TRY AGAIN]
```

---

# 44. EMPTY STATES

Không được để màn hình trắng.

Ví dụ:

```text
No players waiting.

Players currently playing:
8 / 12
```

Hoặc:

```text
No active match.

Add 4 players to start a match.
```

---

# 45. UX PRINCIPLES

Ưu tiên thao tác bằng một tay trên điện thoại.

Các action quan trọng phải dễ nhìn:

```text
AUTO ASSIGN
START
END
CONFIRM
SHUFFLE
```

Không dùng quá nhiều modal.

Các thao tác nguy hiểm:

```text
DELETE
FINISH SESSION
RESET
```

phải có confirmation.

---

# 46. PLAYER CARD

Mỗi Player Card nên hiển thị:

```text
Tên
Giới tính
Trình độ
Số trận
Số phút
Thời gian chờ
Status
```

Ví dụ:

```text
┌──────────────────────────┐
│ Nguyễn Hoàng             │
│ M · TB                   │
│                          │
│ Matches: 3               │
│ Played: 62 min           │
│ Waiting: 14 min          │
│                          │
│ WAITING                  │
└──────────────────────────┘
```

---

# 47. VISUAL STATUS

Dùng màu để phân biệt:

```text
WAITING
PLAYING
REST
ABSENT
AVAILABLE COURT
```

Nhưng không được chỉ dựa vào màu.

Luôn có:

* text;
* icon;
* status label.

để dễ sử dụng ngoài trời.

---

# 48. DATA MODEL

Đề xuất:

```typescript
type Gender = "MALE" | "FEMALE";

type SkillLevel = "Y" | "TBY" | "TB" | "K";

type MemberType = "CO_DINH" | "VANG_LAI";

type AttendanceStatus =
  | "ABSENT"
  | "WAITING"
  | "PLAYING"
  | "RESTING"
  | "FINISHED";

type MatchType = "DOI_NAM" | "DOI_NU" | "DOI_NAM_NU";

type MatchStatus =
  | "DRAFT"
  | "PLAYING"
  | "COMPLETED"
  | "CANCELLED";
```

Player:

```typescript
interface Player {
  id: string;
  name: string;
  gender: Gender;
  skillLevel: SkillLevel;
  memberType: MemberType;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}
```

SessionPlayer:

```typescript
interface SessionPlayer {
  playerId: string;
  playerName: string;           // snapshot tên
  gender?: Gender;              // snapshot — dùng cho avatar + ưu đãi nữ
  skillLevel?: SkillLevel;      // snapshot hiển thị
  memberType?: MemberType;      // snapshot — đơn giá sân cố định/vãng lai
  attendance: AttendanceStatus;
  matchesPlayed: number;
  totalMinutesPlayed: number;
  waitingSince?: string;
}
```

Match:

```typescript
interface Match {
  id: string;
  sessionId: string;
  /** Số sân đã chọn (1–16). Bắt buộc khi START/CONFIRM. */
  courtId: number;
  type: MatchType;

  team1: string[];
  team2: string[];

  /** Snapshot tên người chơi tại thời điểm trận (không chỉ playerId). */
  team1Names?: string[];
  team2Names?: string[];

  startTime?: string;
  endTime?: string;
  durationMinutes?: number;

  status: MatchStatus;

  assignmentMode:
    | "AUTO"
    | "MANUAL"
    | "AUTO_EDITED";

  createdAt: string;
  updatedAt: string;
}
```

Session:

```typescript
interface Session {
  id: string;
  date: string;
  startTime?: string;
  endTime?: string;

  /** Thời gian chơi đã set khi tạo buổi (phút). Bội số 15, min 15, max 360. Mặc định 120. */
  plannedDurationMinutes: number;

  numberOfCourts: number;

  /** Các số sân đã chọn trong buổi (1–16). Ví dụ [1, 2, 5]. length === numberOfCourts */
  courtNumbers: number[];

  /** Sân chọn lúc tạo buổi — TRẢ SÂN disabled với các sân này */
  initialCourtNumbers?: number[];

  /** Metadata sân: bổ sung / trả sớm / phút billable */
  courtMeta?: Record<string, {
    isSupplemental: boolean;
    plannedMinutes: number;
    startedAt: string;
    returnedAt?: string;
    billableMinutes?: number;
  }>;

  players: SessionPlayer[];
  matches: Match[];

  costs: CostSettings;

  status: "PLANNED" | "RUNNING" | "FINISHED";

  createdAt: string;
  updatedAt: string;
}
```

Match.courtId: số sân (1–16) đã chọn khi bắt đầu trận.

CostSettings:

```typescript
interface CostSettings {
  courtFeeFixedPerHour: number;   // Giá thuê sân cố định / giờ (VND)
  courtFeeCasualPerHour: number;  // Giá thuê sân vãng lai / giờ (VND)
  courtFeePerHour?: number;       // legacy — map sang courtFeeFixedPerHour
  shuttleCostPerShuttle: number;  // Đơn giá cầu / quả (VND) — không phải giá ống
  numberOfShuttles: number;       // Số quả cầu đã dùng (trên Session.shuttleCount)
  // otherFee: ĐÃ LOẠI BỎ
  splitMethod: "EQUAL" | "BY_MATCHES";
  femaleDiscountPercent: number;  // mặc định 10
  qrCodeUrl?: string;             // QR thanh toán của Admin
}
```

---

# 49. ARCHITECTURE

Không viết toàn bộ ứng dụng trong một component.

Tách:

```text
src/
  components/
  pages/
  hooks/
  services/
  domain/
  algorithms/
  models/
  storage/
  utils/
  constants/
```

Đặc biệt:

```text
algorithms/
    matchingEngine.ts
    scoring.ts
    teamBalancer.ts
    matchTypeSelector.ts
```

Business logic không được nằm trực tiếp trong React component.

---

# 50. MATCHING ENGINE

API mong muốn:

```typescript
generateMatchSuggestion({
  waitingPlayers,
  activeMatches,
  sessionHistory,
  availableCourts,
  preferredMatchType,
  settings
});
```

Return:

```typescript
{
  players: string[],
  team1: string[],
  team2: string[],
  type: MatchType,
  score: number,
  skillDifference: number,
  reasons: string[]
}
```

Ví dụ:

```json
{
  "score": 92,
  "skillDifference": 0,
  "reasons": [
    "Longest waiting players prioritized",
    "Teams have equal skill score",
    "No repeated teammate",
    "Playing time is balanced"
  ]
}
```

Điều này rất quan trọng để Admin hiểu:

> Tại sao hệ thống lại xếp 4 người này?

---

# 51. ALGORITHM TESTS

Viết unit tests cho matching engine.

Ít nhất phải có:

1. 4 người cùng trình độ.
2. 4 người khác trình độ.
3. 2M + 2F.
4. 4M.
5. 4F.
6. Người chờ lâu được ưu tiên.
7. Người đã đánh nhiều bị giảm priority.
8. Không lặp đồng đội nếu có lựa chọn khác.
9. Không xếp người đang PLAYING.
10. Không xếp người ABSENT.
11. Không tạo ĐÔI NAM NỮ sai giới tính.
12. Không tạo match có skill difference vượt ngưỡng.
13. Không có duplicate player.
14. Không có duplicate active court.
15. Không đủ 4 người.

---

# 52. CONFIGURATION

Không hard-code các threshold.

Ví dụ:

```typescript
MatchingSettings {
  maxSkillDifference: number;
  repeatPartnerPenalty: number;
  repeatOpponentPenalty: number;
  waitingWeight: number;
  matchCountWeight: number;
  minutesWeight: number;
}
```

Default:

```text
maxSkillDifference = 1
```

Nhưng Admin có thể thay đổi sau này.

---

# 53. IMPORTANT BUSINESS PRINCIPLE

Thuật toán không cần tìm:

> trận đấu "hoàn hảo"

mà phải tìm:

> phương án tốt nhất khả dụng trong điều kiện hiện tại.

Nếu không có trận hoàn toàn cân:

```text
hãy chọn phương án ít mất cân bằng nhất
```

đồng thời ưu tiên:

1. đủ điều kiện giới tính;
2. không vi phạm trạng thái;
3. công bằng thời gian chờ;
4. cân bằng trình độ;
5. tránh lặp;
6. cân bằng số trận.

---

# 54. ADMIN SETTINGS

Tạo Settings page:

```text
General
────────────
Default courts: 3
Default planned duration: 2h (120 phút)
Default court numbers: 1, 2, 3

Matching
────────────
Max skill difference: 1

Waiting priority: High

Avoid repeated partner: ON

Avoid repeated opponent: ON

Auto match type: ON

Costs
────────────
Default court fee
Default shuttle price
Default split method
```

---

# 55. EXPORT

MVP hỗ trợ:

```text
Export Summary
```

Format:

* PNG/image
* PDF

Nội dung:

```text
🏸 CẦU LÔNG 360°

19/09/2026

Players: 18
Courts: 3
Matches: 24

--------------------------------
PLAYER       MATCH   MIN    FEE
--------------------------------
Nguyen A       5    100   70,000
Nguyen B       4     80   60,000
...

TOTAL: 1,250,000 VND
```

Có thể thêm:

```text
Copy summary
```

để gửi Zalo/Messenger.

---

# 56. RESPONSIVE

Phải hoạt động tốt trên:

* mobile portrait;
* mobile landscape;
* tablet;
* desktop.

Desktop có thể sử dụng:

```text
Court 1 | Court 2 | Court 3
```

Mobile:

```text
Court 1
Court 2
Court 3
```

---

# 57. OFFLINE-FIRST

Nếu sử dụng local storage:

Ứng dụng phải tiếp tục hoạt động khi:

```text
mất Internet
```

Timer và session data không được mất khi refresh page.

Mỗi mutation quan trọng phải persist ngay.

---

# 58. DATA BACKUP

Tạo:

```text
Export Data
Import Data
```

Format:

```text
JSON
```

Admin có thể backup toàn bộ dữ liệu.

Ví dụ:

```text
[EXPORT BACKUP]
[IMPORT BACKUP]
```

---

# 59. SEED DATA

Tạo sample data để test:

### Players

Ít nhất:

```text
5 Y
5 TBY
5 TB
5 K
```

bao gồm cả:

```text
Male
Female
Cố định
Vãng lai
```

### Sessions

Tạo ít nhất:

```text
2 sample sessions
```

để test History và Statistics.

---

# 60. ERROR HANDLING

Không để lỗi JavaScript làm trắng màn hình.

Có:

```text
Error Boundary
```

và thông báo thân thiện.

Ví dụ:

```text
Something went wrong.

Your session data is safe.

[RETRY]
```

---

# 61. PERFORMANCE

Không cần over-engineering.

Nhưng phải đảm bảo:

* matching calculation không block UI;
* không render lại toàn bộ player list không cần thiết;
* timer không gây re-render toàn app mỗi giây;
* storage operations được tối ưu.

---

# 62. ACCESSIBILITY

Hỗ trợ:

* keyboard navigation trên desktop;
* button có label;
* contrast tốt;
* không chỉ dùng màu để thể hiện status;
* font đủ lớn ngoài sân.

---

# 63. DEVELOPMENT APPROACH

Thực hiện theo thứ tự:

## Phase 1

Build:

```text
Player Management
Session Creation
Attendance
Court Management
```

## Phase 2

Build:

```text
Manual Assignment
Match Timer
End Match
Queue
```

## Phase 3

Build:

```text
Smart Matching Engine
Auto Assignment
Auto + Edit
```

## Phase 4

Build:

```text
Cost Calculation
Settlement
Export
```

## Phase 5

Build:

```text
History
Statistics
Backup/Restore
Settings
```

---

# 64. DO NOT

Không:

* thay đổi 4 skill level đã chốt;
* xoá tên người chơi khỏi dữ liệu Match/Session đã lưu (chỉ được xoá Player khỏi danh sách hiện tại, không sửa/xoá snapshot lịch sử);
* xoá player mà không có hộp thoại xác nhận;
* hard-code 3 sân (sân đánh số 1→16, cho chọn khi tạo buổi / bắt đầu trận);
* hard-code giá tiền;
* tính chi phí sân theo thời gian đánh thực tế từng trận (phải dùng `plannedDurationMinutes`);
* cho thời gian chơi không phải bội số 15 phút / ngoài khoảng 15 phút–6 giờ;
* bỏ qua bước chọn thành viên trên màn hình tạo buổi (Cố định phải mặc định được chọn);
* random player một cách đơn giản (phải dùng priorityScore với `waitingWeight = 0.60`);
* bỏ qua waiting time (người chờ lâu phải được xếp trước);
* bỏ qua số trận đã chơi;
* cho một player xuất hiện ở 2 sân cùng lúc;
* tạo ĐÔI NAM NỮ sai giới tính;
* overwrite match history;
* đặt business logic trong UI;
* tạo một file React khổng lồ khó bảo trì;
* dùng label "Giá ống cầu" hay "Giá/tube" — phải dùng **"Đơn giá cầu / quả"**;
* đặt nút Kết thúc trận ngoài card sân (phải nằm bên trong hình kẻ sân);
* chồng avatar hoặc tên cầu thủ lên đường kẻ sân (avatar + tên nằm giữa 4 ô giao cầu);
* vẽ sân rối (tô ô, lưới đậm ngang, badge loại trận đè giữa sân) — sân nằm ngang, nét trắng mảnh, lưới là nét đứt đứng;
* dùng nhãn "BỔ SUNG SÂN" (nút và modal là **THÊM SÂN**, cạnh **THÊM THÀNH VIÊN**);
* hiển thị danh sách chờ 1 cột khi có thể hiển thị 2 cột;
* sắp xếp lịch sử buổi cũ lên đầu (phải mới nhất lên đầu);
* ẩn loại trận (ĐÔI NAM / ĐÔI NỮ / ĐÔI NAM NỮ) trên card sân đang chơi.

---

# 65. ACCEPTANCE CRITERIA

Ứng dụng được xem là hoàn thành MVP khi:

### Player

* [ ] Thêm player (chỉ 1 trường "Tên", không tách Họ/Tên)
* [ ] Sửa player
* [ ] Xoá player (có hộp thoại xác nhận, không ảnh hưởng lịch sử cũ)
* [ ] Cố định/Vãng lai
* [ ] 4 skill levels (Y/TBY/TB/K)
* [ ] Gender

### Session

* [ ] Tạo session
* [ ] Chọn thời gian chơi bằng slider (bội số 15 phút, min 15', max 6h, mặc định 2h)
* [ ] Chọn số sân / danh sách sân (sân đánh số 1→16)
* [ ] Chọn thành viên từ danh sách trên màn hình tạo buổi
* [ ] Cố định mặc định được chọn (PRESENT); Vãng lai mặc định không chọn (ABSENT)
* [ ] Bật/tắt attendance sau khi buổi đã chạy
* [ ] THÊM THÀNH VIÊN giữa buổi: chỉ hiện người chưa tham gia, đủ avatar / tên / trình / số trận / loại, đưa vào hàng chờ

### Queue

* [ ] Waiting queue
* [ ] Waiting time
* [ ] Filter skill
* [ ] Filter gender

### Court

* [ ] Nhiều sân (sân số 1→16)
* [ ] Court available/playing
* [ ] Tự động hiện danh sách sân trên màn hình xếp trận
* [ ] Cho phép chọn sân khi bắt đầu / xác nhận trận
* [ ] Start match
* [ ] End match
* [ ] Timer
* [ ] Kẻ sân đơn giản (nét trắng mảnh, lưới đứt đứng); avatar kèm tên trong 4 ô giao cầu, không đè đường kẻ

### Matching

* [ ] Auto
* [ ] Manual
* [ ] Auto → Edit → Confirm
* [ ] Skill balance
* [ ] Waiting fairness
* [ ] Match fairness
* [ ] Partner repeat penalty
* [ ] Opponent repeat penalty
* [ ] ĐÔI NAM
* [ ] ĐÔI NỮ
* [ ] ĐÔI NAM NỮ

### Cost

* [ ] Court cost (sân trọn buổi / sân bổ sung / TRẢ SÂN làm tròn 30p; đơn giá cố định vs vãng lai; không dùng otherFee)
* [ ] Shuttle cost
* [ ] Other cost
* [ ] Equal split
* [ ] Minutes split
* [ ] Match split
* [ ] Rounding
* [ ] Total reconciliation

### History

* [ ] Session history
* [ ] Match history
* [ ] Player statistics
* [ ] Export
* [ ] Backup/restore

---

# 66. FINAL IMPLEMENTATION INSTRUCTION

Bắt đầu bằng việc:

### STEP 1

Phân tích requirement và tạo:

```text
architecture
data model
component tree
state management design
matching algorithm design
```

### STEP 2

Tạo project structure.

### STEP 3

Implement MVP theo từng phase.

### STEP 4

Viết unit tests cho:

```text
matchingEngine
teamBalancer
costCalculator
session state transitions
```

### STEP 5

Chạy test.

### STEP 6

Kiểm tra toàn bộ edge cases.

### STEP 7

Hoàn thiện responsive UI.

### STEP 8

Không dừng ở mockup.

**Phải tạo application có thể chạy được.**

---

# 67. DEFINITION OF DONE

Không coi task hoàn thành chỉ vì:

```text
UI đã hiển thị.
```

Task chỉ hoàn thành khi:

```text
Application chạy được
+
Data persistence hoạt động
+
Session hoạt động
+
Queue hoạt động
+
Court hoạt động
+
Timer hoạt động
+
Matching hoạt động
+
Cost calculation hoạt động
+
History hoạt động
+
Unit tests pass
+
Không có critical console errors
```

Nếu có requirement chưa rõ, hãy ưu tiên:

```text
1. Business rules trong prompt
2. Data integrity
3. Fairness
4. Simple UX
5. Maintainable architecture
```

Không tự ý thêm feature lớn ngoài phạm vi MVP.

---

# PHỤ LỤC: CÁCH DÙNG PROMPT NÀY VỚI CURSOR

## Chuẩn bị trước khi mở Cursor
1. Cài **Node.js** bản LTS (18 trở lên) — kiểm tra bằng `node -v`.
2. Cài **Cursor** (cursor.com), đăng nhập tài khoản.
3. Tạo một **thư mục dự án trống**, ví dụ `badminton-app`, mở thư mục đó bằng Cursor (File → Open Folder). Không mở Cursor vào thư mục có sẵn code khác — agent sẽ hiểu nhầm ngữ cảnh.
4. Copy các file sau vào trong thư mục dự án (để Cursor đọc được qua `@`):
   - File prompt này (`prompt-app-xep-cau-long-final.md`)
   - Logo đã cung cấp (đặt tên rõ, ví dụ `logo.webp`)
   - Các ảnh mockup tham khảo (Main, Auto Assign, Add New Member, Member List, Money Sharing, Tao Buoi Choi, Xếp Thủ Công) — gom vào một thư mục con `design-reference/`

## Mở Agent/Composer và đính kèm ngữ cảnh
Mở panel Agent (Composer) của Cursor, đính kèm (`@` hoặc kéo-thả):
- File prompt `.md`
- Thư mục `design-reference/`
- File `logo.webp`

## Lệnh duy nhất để gõ vào Cursor

```text
Đọc kỹ toàn bộ file prompt đính kèm (prompt-app-xep-cau-long-final.md) — đây là spec đầy đủ, bắt buộc tuân thủ 100%, đặc biệt mục 0 (thuật ngữ đã chốt) và mục 65 (Acceptance Criteria).

Hãy tự thực hiện từ đầu đến cuối, không dừng lại hỏi tôi trừ khi thực sự cần quyết định nghiệp vụ quan trọng chưa có trong spec:

1. Scaffold project bằng npm create vite@latest (React + TypeScript), cài Tailwind CSS, cấu hình theo mục 3 và mục "Cấu hình & cài đặt" của prompt.
2. Tạo cấu trúc thư mục đúng như mục 49 (components/pages/hooks/services/domain/algorithms/models/storage/utils/constants).
3. Dùng logo.webp và các ảnh trong design-reference/ làm tài liệu tham khảo giao diện — bám sát bố cục, bảng màu, kiểu card như trong ảnh.
4. Cài đặt persistence bằng localStorage/IndexedDB theo mục 57.
5. Implement lần lượt theo đúng thứ tự Phase 1 → Phase 5 ở mục 63.
6. Sau mỗi phase, TỰ CHẠY `npm install` và `npm run dev`, đọc log lỗi trong terminal, tự sửa cho tới khi không còn lỗi console và app chạy được thật, không chỉ là UI tĩnh.
7. Viết unit test cho matchingEngine, teamBalancer, costCalculator theo mục 51 và chạy test.
8. Sau khi xong, tự kiểm tra lại toàn bộ checklist ở mục 65 (Acceptance Criteria) và báo cáo cho tôi mục nào đã xong / chưa xong.

Không tạo mockup tĩnh không có logic. Không dừng ở việc hiển thị UI. Ứng dụng phải chạy được thật ngay trên trình duyệt qua `npm run dev` khi tôi mở lại project.
```

## Sau khi Cursor chạy xong
- Kiểm tra terminal của Cursor không còn lỗi đỏ.
- Gõ `npm run dev`, mở link `localhost` hiện ra để test tay từng chức năng theo đúng checklist mục 65.
- Nếu muốn deploy host miễn phí: yêu cầu Cursor thêm bước build tĩnh (`npm run build`) và hướng dẫn deploy lên Cloudflare Pages hoặc GitHub Pages (build output thường ở thư mục `dist/`).
- Nếu Cursor báo thiếu thông tin nghiệp vụ (ví dụ giá sân mặc định, ngưỡng chênh trình), trả lời ngắn gọn theo đúng giá trị đã có trong app cũ (bản HTML mẫu): 80.000đ/sân/giờ, chênh trình tối đa 2 bậc, split mặc định "chia đều".
