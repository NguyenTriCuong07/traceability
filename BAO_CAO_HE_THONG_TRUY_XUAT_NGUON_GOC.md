# BÁO CÁO PHÂN TÍCH VÀ THIẾT KẾ HỆ THỐNG
## Đề tài: Hệ thống truy xuất nguồn gốc nông sản bằng QR Code trên nền tảng web

---

## PHẦN 1. GIỚI THIỆU ĐỀ TÀI

### 1. Mô tả đề tài
Đề tài xây dựng một hệ thống web cho phép truy xuất nguồn gốc nông sản thông qua QR Code. Mỗi sản phẩm hoặc lô hàng được gắn một mã QR chứa liên kết đến trang thông tin truy xuất. Khi người dùng quét mã, hệ thống hiển thị đầy đủ dữ liệu liên quan đến sản phẩm như thông tin cơ bản, vùng trồng, ngày gieo trồng, ngày thu hoạch, quy trình sơ chế, vận chuyển và trạng thái lô hàng.

Hệ thống gồm hai nhóm chức năng chính:
1. Nhóm chức năng công khai cho người dùng cuối (Viewer) để xem thông tin truy xuất.
2. Nhóm chức năng quản trị (Admin) để tạo và quản lý sản phẩm, lô hàng, mã QR và dữ liệu truy xuất.

### 2. Lý do chọn đề tài

#### 2.1. Lý do thực tiễn
1. Vấn đề gian lận nguồn gốc nông sản làm giảm niềm tin người tiêu dùng.
2. Nhu cầu minh bạch chuỗi cung ứng ngày càng cao từ thị trường trong nước và xuất khẩu.
3. Doanh nghiệp/hợp tác xã cần công cụ số hóa dữ liệu sản xuất để chuẩn hóa quản lý.
4. Cơ quan quản lý cần dữ liệu truy xuất để phục vụ kiểm tra chất lượng và an toàn thực phẩm.

#### 2.2. Lý do công nghệ
1. QR Code giúp truy cập nhanh thông tin, triển khai đơn giản, chi phí thấp.
2. Nền tảng web đa thiết bị, không phụ thuộc cài đặt ứng dụng.
3. Công nghệ frontend hiện đại cho phép giao diện trực quan, phản hồi nhanh.
4. Backend API kết hợp cơ sở dữ liệu NoSQL phù hợp với dữ liệu truy xuất linh hoạt.
5. Kiến trúc tách lớp giúp mở rộng sau này sang mobile app, IoT, blockchain.

### 3. Mục tiêu hệ thống
1. Xây dựng hệ thống truy xuất nguồn gốc chính xác, minh bạch, dễ sử dụng.
2. Hỗ trợ quản trị viên nhập liệu và quản lý vòng đời sản phẩm/lô hàng.
3. Cung cấp trang thông tin truy xuất thân thiện cho người tiêu dùng.
4. Tăng độ tin cậy của sản phẩm nông sản thông qua bằng chứng dữ liệu số.
5. Hỗ trợ phân tích cơ bản về lượt truy cập/lượt quét phục vụ quản trị.

### 4. Phạm vi hệ thống

#### 4.1. Trong phạm vi
1. Quản lý tài khoản quản trị.
2. Quản lý sản phẩm nông sản.
3. Quản lý lô hàng và thông tin truy xuất.
4. Sinh và quản lý QR Code dạng URL tĩnh.
5. Trang công khai hiển thị thông tin truy xuất theo mã định danh.
6. Dashboard thống kê cơ bản cho quản trị viên.

#### 4.2. Ngoài phạm vi
1. Tích hợp thanh toán thương mại điện tử.
2. Tích hợp sâu với thiết bị IoT nông nghiệp theo thời gian thực.
3. Chứng thực pháp lý bằng blockchain ở cấp quốc gia.
4. Quản lý logistics nâng cao đa chặng với bản đồ thời gian thực.

### 5. Đối tượng sử dụng
1. Người tiêu dùng: quét QR để kiểm tra nguồn gốc trước khi mua/sử dụng.
2. Doanh nghiệp/hợp tác xã: cập nhật dữ liệu sản xuất và lô hàng.
3. Quản trị hệ thống: quản trị tài khoản, danh mục, dữ liệu truy xuất.
4. Cơ quan kiểm định (mức tra cứu): đối chiếu thông tin phục vụ giám sát.

---

## PHẦN 2. TỔNG QUAN HỆ THỐNG

### 1. Mô hình tổng thể hệ thống
Mô hình hệ thống gồm bốn thành phần chính:

1. Frontend (Web Client)
- Giao diện cho Viewer và Admin.
- Viewer truy cập trang sản phẩm từ QR URL.
- Admin thao tác quản trị qua dashboard.

2. Backend (API Server)
- Cung cấp API xác thực, quản lý sản phẩm, lô hàng, upload ảnh, analytics.
- Xử lý nghiệp vụ và kiểm tra dữ liệu.

3. Database
- Lưu trữ dữ liệu sản phẩm, lô hàng, tài khoản, lịch sử cập nhật, thống kê quét.

4. QR Code Layer
- Sinh QR chứa URL tĩnh trỏ về trang thông tin sản phẩm/lô.
- Cho phép in ấn lên tem nhãn và quét bằng camera điện thoại.

### 2. Công nghệ sử dụng (đề xuất phù hợp đề tài)
1. Frontend: Next.js, React, TypeScript, Tailwind CSS.
2. Backend: Next.js API Routes hoặc Node.js API.
3. Database: MongoDB với Mongoose ODM.
4. Xác thực: JWT/Session + middleware phân quyền Admin.
5. Sinh QR: thư viện tạo QR Code từ URL.
6. Upload hình ảnh: API upload, lưu thư mục tĩnh hoặc object storage.
7. Biểu đồ thống kê: chart library tích hợp dashboard.
8. Triển khai: VPS/Cloud, reverse proxy, HTTPS.

### 3. Kiến trúc hệ thống
Hệ thống áp dụng kiến trúc client-server ba lớp:

1. Lớp trình bày (Presentation Layer)
- Trang công khai tra cứu và trang quản trị.
- Tương tác qua HTTP/HTTPS.

2. Lớp nghiệp vụ (Business Layer)
- Xử lý quy tắc tạo sản phẩm, lô hàng, mã QR.
- Kiểm tra dữ liệu đầu vào, phân quyền, logging.

3. Lớp dữ liệu (Data Layer)
- Lưu trữ dữ liệu có cấu trúc linh hoạt.
- Tối ưu truy vấn theo slug sản phẩm, mã lô, thời gian tạo.

Sơ đồ kiến trúc dạng text:

[Viewer/Admin Browser]  
        | HTTPS  
        v  
[Web App + API Server]  
        |  
        +--> [Auth Service Logic]  
        +--> [Product/Lot Service Logic]  
        +--> [QR Generate Logic]  
        +--> [Analytics Logic]  
        |  
        v  
[MongoDB Database]  
        ^  
        |  
[Static Upload Storage]

---

## PHẦN 3. USE CASE

### 1. Xác định Actor
1. Viewer (Người dùng công khai)
2. Admin (Quản trị viên)

### 2. Danh sách Use Case toàn hệ thống

#### 2.1. Use Case của Viewer
1. Quét QR Code.
2. Xem thông tin sản phẩm.
3. Xem nguồn gốc sản xuất.
4. Xem lịch sử lô hàng.
5. Xem hình ảnh minh họa sản phẩm/lô.
6. Xem trạng thái xác thực thông tin.

#### 2.2. Use Case của Admin
1. Đăng nhập hệ thống.
2. Quản lý sản phẩm (thêm/sửa/xóa/xem).
3. Quản lý lô hàng (thêm/sửa/xóa/xem).
4. Tạo QR Code cho sản phẩm/lô.
5. Quản lý dữ liệu nguồn gốc.
6. Upload ảnh sản phẩm/lô.
7. Theo dõi dashboard và thống kê lượt quét.
8. Quản lý người dùng quản trị (nếu phân quyền nhiều cấp).
9. Đăng xuất.

### 3. Use Case Diagram (dạng text)

                +------------------------+
                |   HỆ THỐNG TRUY XUẤT  |
                +------------------------+

 Viewer ---------------------------------> (Quét QR Code)
 Viewer ---------------------------------> (Xem thông tin sản phẩm)
 Viewer ---------------------------------> (Xem nguồn gốc)
 Viewer ---------------------------------> (Xem lịch sử lô hàng)

 Admin  ---------------------------------> (Đăng nhập)
 Admin  ---------------------------------> (Quản lý sản phẩm)
 Admin  ---------------------------------> (Quản lý lô hàng)
 Admin  ---------------------------------> (Tạo QR Code URL tĩnh)
 Admin  ---------------------------------> (Quản lý dữ liệu nguồn gốc)
 Admin  ---------------------------------> (Xem dashboard thống kê)
 Admin  ---------------------------------> (Đăng xuất)

(Quản lý sản phẩm) ----include----> (Upload ảnh)
(Quản lý lô hàng) -----include----> (Cập nhật trạng thái lô)
(Tạo QR Code) ---------include----> (Sinh URL truy xuất)

### 4. Mô tả chi tiết từng Use Case

#### UC-01: Quét QR Code
- Actor: Viewer
- Mô tả: Người dùng dùng camera/ứng dụng quét mã QR trên bao bì.
- Luồng chính:
1. Viewer mở camera điện thoại.
2. Camera nhận mã QR và giải mã URL.
3. Trình duyệt mở trang thông tin truy xuất.
4. Hệ thống ghi nhận lượt truy cập (nếu bật analytics).
- Luồng thay thế:
1. Mã QR hỏng/không đọc được: người dùng quét lại.
2. URL không hợp lệ: hiển thị trang lỗi không tìm thấy.

#### UC-02: Xem thông tin sản phẩm
- Actor: Viewer
- Mô tả: Xem dữ liệu cơ bản về sản phẩm.
- Luồng chính:
1. Hệ thống nhận mã định danh từ URL.
2. API truy vấn sản phẩm trong cơ sở dữ liệu.
3. Trả dữ liệu tên, mô tả, hình ảnh, đơn vị, thương hiệu.
4. Frontend hiển thị nội dung.
- Luồng thay thế:
1. Sản phẩm không tồn tại: trả thông báo không tìm thấy.
2. Sản phẩm bị ẩn: trả trạng thái không công khai.

#### UC-03: Xem nguồn gốc
- Actor: Viewer
- Mô tả: Xem vùng trồng, ngày gieo trồng, ngày thu hoạch, đơn vị sản xuất.
- Luồng chính:
1. Viewer chọn tab/khối thông tin nguồn gốc.
2. Hệ thống tải dữ liệu traceability.
3. Hiển thị theo timeline hoặc bảng.
- Luồng thay thế:
1. Thiếu dữ liệu một số mốc: hiển thị “chưa cập nhật”.

#### UC-04: Đăng nhập Admin
- Actor: Admin
- Mô tả: Quản trị viên đăng nhập để truy cập hệ thống quản trị.
- Luồng chính:
1. Admin nhập email/tên đăng nhập và mật khẩu.
2. API xác thực thông tin.
3. Hệ thống tạo token/phiên đăng nhập.
4. Chuyển hướng về dashboard.
- Luồng thay thế:
1. Sai mật khẩu: thông báo xác thực thất bại.
2. Tài khoản bị khóa: từ chối đăng nhập.

#### UC-05: Quản lý sản phẩm
- Actor: Admin
- Mô tả: Tạo mới, chỉnh sửa, xóa mềm, tra cứu sản phẩm.
- Luồng chính:
1. Admin vào danh sách sản phẩm.
2. Chọn thêm mới hoặc sửa dữ liệu.
3. Nhập tên, slug, mô tả, danh mục, ảnh.
4. Hệ thống kiểm tra hợp lệ và lưu DB.
- Luồng thay thế:
1. Trùng slug: báo lỗi yêu cầu sửa slug.
2. Thiếu trường bắt buộc: báo lỗi xác thực.

#### UC-06: Quản lý lô hàng
- Actor: Admin
- Mô tả: Gán lô hàng theo từng sản phẩm với thông tin sản xuất.
- Luồng chính:
1. Admin chọn sản phẩm.
2. Tạo lô với mã lô, ngày sản xuất, ngày thu hoạch, nơi trồng.
3. Cập nhật trạng thái lô theo tiến trình.
4. Lưu và công khai dữ liệu.
- Luồng thay thế:
1. Mã lô trùng: từ chối lưu.
2. Ngày dữ liệu không hợp lệ: báo lỗi định dạng.

#### UC-07: Tạo QR Code
- Actor: Admin
- Mô tả: Sinh QR từ URL tĩnh của sản phẩm hoặc lô.
- Luồng chính:
1. Admin chọn sản phẩm/lô.
2. Hệ thống sinh URL truy xuất chuẩn.
3. Sinh ảnh QR và lưu liên kết.
4. Cho phép tải xuống/in tem.
- Luồng thay thế:
1. Không đủ dữ liệu để tạo URL: báo lỗi.
2. Lỗi sinh ảnh QR: yêu cầu thử lại.

#### UC-08: Xem dashboard thống kê
- Actor: Admin
- Mô tả: Theo dõi số lượng sản phẩm, lô hàng, lượt truy cập/quét.
- Luồng chính:
1. Admin mở trang analytics.
2. API trả dữ liệu tổng hợp.
3. Frontend hiển thị biểu đồ và chỉ số.
- Luồng thay thế:
1. Chưa có dữ liệu thống kê: hiển thị trạng thái rỗng.

---

## PHẦN 4. LUỒNG HOẠT ĐỘNG HỆ THỐNG

### 1. Luồng người dùng quét QR và xem thông tin
Sequence dạng text:

Viewer -> Camera App: Quét QR  
Camera App -> Browser: Mở URL sản phẩm/lô  
Browser -> API: GET thông tin truy xuất  
API -> Database: Truy vấn theo slug/mã lô  
Database -> API: Trả dữ liệu  
API -> Browser: JSON sản phẩm + nguồn gốc + lịch sử  
Browser -> Viewer: Hiển thị giao diện truy xuất

### 2. Luồng Admin tạo sản phẩm, lô hàng, QR
Activity dạng text:

Bắt đầu  
-> Admin đăng nhập  
-> Tạo sản phẩm mới  
-> Tạo lô hàng thuộc sản phẩm  
-> Nhập dữ liệu nguồn gốc  
-> Lưu hệ thống  
-> Chọn “Tạo QR”  
-> Hệ thống sinh URL + ảnh QR  
-> In tem/đính lên sản phẩm  
-> Kết thúc

### 3. Luồng cập nhật dữ liệu
1. Admin chọn sản phẩm/lô cần chỉnh sửa.
2. Hệ thống nạp dữ liệu hiện tại.
3. Admin thay đổi thông tin (ví dụ ngày đóng gói, nơi vận chuyển).
4. API kiểm tra ràng buộc dữ liệu.
5. Ghi dữ liệu mới và cập nhật mốc thời gian chỉnh sửa.
6. Viewer quét QR sẽ thấy thông tin mới nhất ngay sau cập nhật.

### 4. Gợi ý sơ đồ để vẽ chính thức
1. Sequence Diagram cho UC quét QR.
2. Activity Diagram cho quy trình tạo lô và QR.
3. State Diagram cho trạng thái lô hàng (Khởi tạo -> Đang canh tác -> Thu hoạch -> Đóng gói -> Phân phối).

---

## PHẦN 5. CHỨC NĂNG HỆ THỐNG

## A. Chức năng Viewer (Người dùng)

### A1. Quét QR Code
| Thành phần | Nội dung |
|---|---|
| Input | Mã QR trên nhãn sản phẩm |
| Output | URL truy xuất mở trên trình duyệt |
| Xử lý | Giải mã QR, điều hướng trang, ghi nhận lượt truy cập |

### A2. Xem thông tin sản phẩm
| Thành phần | Nội dung |
|---|---|
| Input | Slug/mã sản phẩm từ URL |
| Output | Tên sản phẩm, mô tả, ảnh, quy cách |
| Xử lý | Truy vấn cơ sở dữ liệu, chuẩn hóa dữ liệu, render giao diện |

### A3. Xem nguồn gốc
| Thành phần | Nội dung |
|---|---|
| Input | Mã lô hoặc khóa truy xuất |
| Output | Vùng trồng, đơn vị sản xuất, ngày gieo, ngày thu hoạch |
| Xử lý | Lấy dữ liệu traceability theo lô, sắp xếp theo mốc thời gian |

### A4. Xem lịch sử lô hàng
| Thành phần | Nội dung |
|---|---|
| Input | Mã lô |
| Output | Danh sách các mốc xử lý lô |
| Xử lý | Truy vấn bản ghi timeline, hiển thị theo thứ tự tăng dần thời gian |

### A5. Giao diện hiển thị
| Thành phần | Nội dung |
|---|---|
| Input | Dữ liệu tổng hợp từ API |
| Output | Trang truy xuất trực quan, đọc tốt trên mobile |
| Xử lý | Responsive layout, xử lý trạng thái loading/lỗi/rỗng |

Ví dụ minh họa:
- Người dùng quét mã trên gói xoài.
- Hệ thống hiển thị:
1. Tên sản phẩm: Xoài cát Hòa Lộc.
2. Mã lô: HL-2026-04-001.
3. Vùng trồng: Cai Lậy, Tiền Giang.
4. Ngày thu hoạch: 10/04/2026.
5. Trạng thái: Đã đóng gói, sẵn sàng phân phối.

## B. Chức năng Admin

### B1. Đăng nhập và xác thực
| Thành phần | Nội dung |
|---|---|
| Input | Email/tên đăng nhập, mật khẩu |
| Output | Token/phiên đăng nhập hợp lệ |
| Xử lý | So khớp thông tin, kiểm tra quyền, tạo session |

### B2. Quản lý sản phẩm
| Thành phần | Nội dung |
|---|---|
| Input | Tên, slug, mô tả, ảnh, trạng thái hiển thị |
| Output | Bản ghi sản phẩm mới/cập nhật |
| Xử lý | Validate, lưu DB, ghi log thao tác |

### B3. Quản lý lô hàng
| Thành phần | Nội dung |
|---|---|
| Input | Mã lô, sản phẩm liên quan, ngày sản xuất/thu hoạch |
| Output | Bản ghi lô hàng và timeline |
| Xử lý | Kiểm tra trùng mã lô, chuẩn hóa định dạng ngày, liên kết sản phẩm |

### B4. Tạo QR Code (URL tĩnh)
| Thành phần | Nội dung |
|---|---|
| Input | Định danh sản phẩm/lô |
| Output | Ảnh QR và URL truy xuất |
| Xử lý | Sinh URL chuẩn, mã hóa thành QR, lưu metadata |

### B5. Quản lý dữ liệu nguồn gốc
| Thành phần | Nội dung |
|---|---|
| Input | Vùng trồng, nhà cung cấp giống, phân bón, lịch canh tác |
| Output | Hồ sơ truy xuất đầy đủ |
| Xử lý | Lưu theo cấu trúc timeline, cho phép cập nhật nhiều mốc |

### B6. Cập nhật/xóa dữ liệu
| Thành phần | Nội dung |
|---|---|
| Input | ID bản ghi và thông tin chỉnh sửa |
| Output | Dữ liệu sau cập nhật hoặc trạng thái xóa mềm |
| Xử lý | Kiểm tra quyền Admin, cập nhật timestamp, ghi nhận audit |

### B7. Dashboard
| Thành phần | Nội dung |
|---|---|
| Input | Khoảng thời gian lọc thống kê |
| Output | Tổng số sản phẩm, số lô, lượt quét, biểu đồ xu hướng |
| Xử lý | Tổng hợp dữ liệu theo ngày/tháng, trả về API analytics |

## C. Mô tả chi tiết chức năng theo từng trang (Public -> Admin)

### C1. Tầng Public (không cần đăng nhập)

#### Trang chủ `/`
- Mục tiêu: Cung cấp điểm bắt đầu cho người dùng công khai, giới thiệu hệ thống truy xuất và danh sách lô hàng đang công khai.
- Chức năng chính:
1. Hiển thị phần giới thiệu, lợi ích truy xuất và nút điều hướng nhanh tới danh sách sản phẩm.
2. Tìm kiếm lô hàng theo từ khóa (mã lô, tên sản phẩm, vùng sản xuất).
3. Hiển thị danh sách sản phẩm dạng thẻ với thông tin tóm tắt (ảnh, tên, mã lô, trạng thái).
4. Mở hộp thoại tạo mã QR tại chỗ cho từng sản phẩm và sao chép liên kết truy xuất.
- API liên quan: `GET /api/products` (lấy danh sách), hàm tạo QR client-side từ slug.
- Dữ liệu hiển thị nổi bật: tên sản phẩm, mã lô, đơn vị đóng gói, vùng sản xuất, ngày thu hoạch, trạng thái.

#### Trang chi tiết truy xuất `/product/[slug]`
- Mục tiêu: Hiển thị đầy đủ hồ sơ truy xuất của một lô hàng khi người dùng quét QR hoặc mở liên kết trực tiếp.
- Chức năng chính:
1. Truy vấn sản phẩm theo slug, tự động trả 404 nếu không tồn tại.
2. Tăng bộ đếm lượt truy cập và ghi log sự kiện `visit` vào nhật ký quét/truy cập.
3. Từ chối hiển thị khi lô hàng đã hết hạn sử dụng.
4. Tạo metadata động (title/description/OpenGraph) để chia sẻ liên kết thân thiện.
5. Hiển thị 3 nhóm thông tin theo tab:
1. Nguồn gốc: đơn vị sơ chế/đóng gói, vùng sản xuất, nông trại, người phụ trách, tọa độ và bản đồ.
2. Truy xuất: trạng thái lô hàng, timeline chuỗi cung ứng, ngày đóng gói/thu hoạch, thuốc BVTV, phân bón, chứng nhận.
3. Thống kê: tổng lượt quét và lần quét gần nhất.
6. Cho phép người dùng thực hiện thao tác xác thực sản phẩm.
- API liên quan: `GET /api/products/slug/[slug]` (đọc), `POST /api/products/slug/[slug]` (xác thực/quét), ghi `scanlogs` trên server.

#### Trang lỗi không tìm thấy `not-found`
- Mục tiêu: Thông báo rõ ràng khi người dùng truy cập slug không hợp lệ hoặc dữ liệu đã bị gỡ.
- Chức năng chính:
1. Hiển thị mã lỗi 404 và mô tả nguyên nhân dễ hiểu.
2. Cung cấp nút quay lại trang chủ để tiếp tục tra cứu.

### C2. Tầng xác thực tài khoản quản trị

#### Trang đăng nhập `/login`
- Mục tiêu: Xác thực quản trị viên trước khi truy cập khu vực quản trị.
- Chức năng chính:
1. Nhập email và mật khẩu.
2. Gọi API đăng nhập, nhận JWT token.
3. Lưu token vào `localStorage`.
4. Điều hướng sang trang dashboard admin khi thành công.
5. Hiển thị thông báo lỗi/thành công trực quan.
- API liên quan: `POST /api/auth/login`.

#### Trang đăng ký `/register`
- Mục tiêu: Tạo tài khoản admin mới cho hệ thống.
- Chức năng chính:
1. Nhập email, mật khẩu và xác nhận mật khẩu.
2. Kiểm tra khớp mật khẩu ở phía client trước khi gửi API.
3. Gọi API đăng ký, nhận token và tự động đăng nhập sau khi tạo tài khoản.
4. Chuyển vào khu vực quản trị ngay sau khi đăng ký thành công.
- API liên quan: `POST /api/auth/register`.

### C3. Tầng Admin (cần đăng nhập và đúng quyền)

#### Layout quản trị `/admin/layout`
- Mục tiêu: Tạo khung điều hướng thống nhất cho toàn bộ trang quản trị.
- Chức năng chính:
1. Kiểm tra phiên đăng nhập bằng `AuthGuard` trước khi render nội dung.
2. Gọi API verify token, kiểm tra role phải là `admin`.
3. Hiển thị thanh điều hướng trái (`Sidebar`) với các module Dashboard, Sản phẩm, Phân tích.
4. Hỗ trợ đăng xuất và xóa token.
- API liên quan: `GET /api/auth/verify`.

#### Trang dashboard admin `/admin`
- Mục tiêu: Cung cấp bức tranh tổng quan vận hành nhanh cho quản trị viên.
- Chức năng chính:
1. Tải danh sách sản phẩm có phân quyền qua token.
2. Tính nhanh các KPI: tổng sản phẩm, tổng lượt quét, danh sách sản phẩm gần đây.
3. Điều hướng nhanh tới tạo mới lô hàng hoặc chỉnh sửa lô gần nhất.
- API liên quan: `GET /api/products` (kèm Authorization).

#### Trang danh sách lô hàng `/admin/products`
- Mục tiêu: Quản trị tập trung toàn bộ lô hàng/sản phẩm trong hệ thống.
- Chức năng chính:
1. Phân trang danh sách dữ liệu (page, limit).
2. Tìm kiếm theo nhiều tiêu chí nghiệp vụ.
3. Hiển thị các chỉ số trạng thái theo danh sách hiện tại: đang lưu thông, đang sơ chế, đã bán hết.
4. Bảng dữ liệu chi tiết gồm mã lô, sản phẩm, vùng sản xuất, ngày thu hoạch, đơn vị đóng gói, trạng thái.
5. Cung cấp thao tác mở trang public chi tiết và trang chỉnh sửa admin cho từng dòng.
- API liên quan: `GET /api/products` (kèm Authorization).

#### Trang tạo lô hàng mới `/admin/products/new`
- Mục tiêu: Khởi tạo hồ sơ truy xuất hoàn chỉnh và sinh QR cho lô hàng mới.
- Chức năng chính (thông qua `ProductForm`):
1. Nhập thông tin sản phẩm cốt lõi, mã lô, nguồn gốc, tọa độ, ngày đóng gói/thu hoạch, chứng nhận, thuốc/phân bón.
2. Hỗ trợ gợi ý dữ liệu từ lịch sử và danh mục địa phương để nhập nhanh, giảm sai sót.
3. Cho phép tải ảnh sản phẩm lên server và xem trước.
4. Kiểm tra ràng buộc nghiệp vụ trước khi lưu:
1. Trường bắt buộc.
2. Định dạng ngày.
3. Quan hệ thời gian (thu hoạch không sau đóng gói, không vượt ngày hiện tại).
4. Biên độ tọa độ hợp lệ.
5. Sau khi lưu thành công, hiển thị mã QR đã sinh và link truy xuất để tải/in.
- API liên quan: `POST /api/products`, `POST /api/upload/product-image`.

#### Trang chỉnh sửa lô hàng `/admin/products/[id]/edit`
- Mục tiêu: Cập nhật hoặc xóa một lô hàng hiện có.
- Chức năng chính:
1. Tải chi tiết lô hàng theo `id`, chuẩn hóa dữ liệu ngày về input date.
2. Chỉnh sửa bằng cùng form nghiệp vụ như trang tạo mới.
3. Cập nhật dữ liệu và đồng bộ lại QR/link truy xuất nếu có thay đổi.
4. Xóa lô hàng với bước xác nhận an toàn trước khi thực thi.
5. Tự xử lý hết phiên đăng nhập: xóa token và chuyển về trang login.
- API liên quan: `GET /api/products/[id]`, `PUT /api/products/[id]`, `DELETE /api/products/[id]`, `POST /api/upload/product-image`.

#### Trang phân tích quản trị `/admin/analytics`
- Mục tiêu: Phân tích hành vi truy cập/quét theo thời gian cho toàn hệ thống và từng sản phẩm.
- Chức năng chính:
1. Bộ lọc thống nhất theo `timeframe` (7/30/90 ngày) và `granularity` (ngày/giờ).
2. Tab Toàn hệ thống:
1. KPI tổng sản phẩm hoạt động, lượt truy cập, lượt quét.
2. Biểu đồ xu hướng theo thời gian.
3. Top sản phẩm hoạt động cao nhất.
4. Phân bố truy cập/quét theo khung giờ.
3. Tab Theo sản phẩm:
1. Chọn sản phẩm cần phân tích.
2. KPI truy cập/quét theo kỳ và tích lũy.
3. Biểu đồ xu hướng, biểu đồ theo giờ.
4. Nhật ký sự kiện gần nhất (thời gian, loại sự kiện, IP, vị trí).
4. Hỗ trợ nút đồng bộ analytics thủ công để cập nhật bộ đếm từ log thực tế.
- API liên quan: `GET /api/analytics/system`, `GET /api/products/[id]/analytics`, `POST /api/admin/analytics/sync`, `GET /api/products?limit=100`.

### C4. Luồng quyền truy cập giữa các trang
1. Public (`/`, `/product/[slug]`, `not-found`): không yêu cầu token.
2. Auth (`/login`, `/register`): dùng để tạo/nhận token admin.
3. Admin (`/admin`, `/admin/products`, `/admin/products/new`, `/admin/products/[id]/edit`, `/admin/analytics`): bắt buộc token hợp lệ và role admin.
4. Nếu token sai/hết hạn: hệ thống tự động xóa token và chuyển về `/login`.

### C5. Giá trị nghiệp vụ của phân tầng trang
1. Tách rõ trải nghiệm người tiêu dùng và trải nghiệm quản trị.
2. Đảm bảo dữ liệu công khai minh bạch nhưng thao tác sửa/xóa được bảo vệ bằng xác thực.
3. Hỗ trợ vận hành thực tế theo vòng đời lô hàng: tạo mới -> cập nhật -> công khai truy xuất -> phân tích hành vi quét.
4. Dễ mở rộng thêm module (kiểm định, báo cáo nâng cao, phân quyền nhiều cấp) mà không phá vỡ cấu trúc hiện tại.

---

## PHẦN 6. CƠ SỞ DỮ LIỆU

### 1. Thiết kế database (mô hình collection)

Đề xuất các collection chính:
1. users
2. products
3. lots
4. trace_records
5. qr_codes
6. scan_logs
7. media_files (tùy chọn)

### 2. Mô tả từng bảng/collection

### 2.1. users
| Trường | Kiểu dữ liệu | Mô tả |
|---|---|---|
| _id | ObjectId | Khóa chính |
| username | String | Tên đăng nhập |
| email | String | Email quản trị |
| password_hash | String | Mật khẩu đã băm |
| role | String | admin/super_admin |
| is_active | Boolean | Trạng thái tài khoản |
| created_at | Date | Ngày tạo |
| updated_at | Date | Ngày cập nhật |

### 2.2. products
| Trường | Kiểu dữ liệu | Mô tả |
|---|---|---|
| _id | ObjectId | Khóa chính |
| name | String | Tên sản phẩm |
| slug | String | Định danh URL, duy nhất |
| description | String | Mô tả chi tiết |
| category | String | Nhóm sản phẩm |
| packaging_unit | String | Đơn vị đóng gói |
| images | Array<String> | Danh sách URL ảnh |
| status | String | draft/published/archived |
| created_by | ObjectId | Admin tạo |
| created_at | Date | Ngày tạo |
| updated_at | Date | Ngày cập nhật |

### 2.3. lots
| Trường | Kiểu dữ liệu | Mô tả |
|---|---|---|
| _id | ObjectId | Khóa chính |
| lot_code | String | Mã lô, duy nhất |
| product_id | ObjectId | Liên kết products |
| farm_region | String | Vùng trồng |
| sowing_date | Date | Ngày gieo trồng |
| harvest_date | Date | Ngày thu hoạch |
| packing_date | Date | Ngày đóng gói |
| expiry_date | Date | Hạn sử dụng |
| status | String | in_progress/harvested/packed/shipped |
| created_at | Date | Ngày tạo |
| updated_at | Date | Ngày cập nhật |

### 2.4. trace_records
| Trường | Kiểu dữ liệu | Mô tả |
|---|---|---|
| _id | ObjectId | Khóa chính |
| lot_id | ObjectId | Liên kết lô hàng |
| step_name | String | Tên công đoạn |
| step_time | Date | Thời điểm |
| location | String | Vị trí thực hiện |
| note | String | Ghi chú |
| actor_name | String | Đơn vị/cá nhân thực hiện |
| attachments | Array<String> | Ảnh/chứng từ |
| created_at | Date | Ngày tạo |

### 2.5. qr_codes
| Trường | Kiểu dữ liệu | Mô tả |
|---|---|---|
| _id | ObjectId | Khóa chính |
| product_id | ObjectId | Liên kết sản phẩm (tùy chọn) |
| lot_id | ObjectId | Liên kết lô (ưu tiên) |
| qr_url | String | URL truy xuất |
| qr_image_url | String | Đường dẫn ảnh QR |
| is_active | Boolean | Trạng thái QR |
| generated_by | ObjectId | Admin tạo |
| generated_at | Date | Ngày tạo |

### 2.6. scan_logs
| Trường | Kiểu dữ liệu | Mô tả |
|---|---|---|
| _id | ObjectId | Khóa chính |
| qr_code_id | ObjectId | Liên kết qr_codes |
| scanned_at | Date | Thời điểm quét |
| device_type | String | Mobile/Desktop |
| ip_hash | String | Mã hóa IP (bảo mật) |
| user_agent | String | Chuỗi trình duyệt |

### 3. Quan hệ giữa các bảng

1. users (1) - (N) products theo created_by.
2. products (1) - (N) lots theo product_id.
3. lots (1) - (N) trace_records theo lot_id.
4. lots (1) - (1/N) qr_codes theo lot_id tùy chính sách sinh mã.
5. qr_codes (1) - (N) scan_logs theo qr_code_id.

ERD text mô tả nhanh:

users ---< products ---< lots ---< trace_records  
                         |  
                         +---< qr_codes ---< scan_logs

---

## PHẦN 7. KẾT LUẬN

### 1. Kết quả đạt được
1. Xây dựng được hệ thống truy xuất nguồn gốc hoạt động trên web.
2. Hỗ trợ đầy đủ chu trình: tạo sản phẩm, tạo lô, tạo QR, tra cứu công khai.
3. Dữ liệu truy xuất được tổ chức có cấu trúc, dễ quản trị, dễ mở rộng.
4. Giao diện Viewer thân thiện, giúp người dùng kiểm chứng thông tin nhanh.
5. Dashboard cung cấp số liệu vận hành cơ bản cho quản trị.

### 2. Hạn chế
1. Chưa tích hợp xác thực dữ liệu từ bên thứ ba (cơ quan chứng nhận).
2. Chưa có cơ chế chống giả nâng cao ngoài QR URL.
3. Chưa tích hợp hệ thống kho vận và cảm biến môi trường theo thời gian thực.
4. Mức phân quyền admin có thể cần chi tiết hơn cho vận hành thực tế lớn.

### 3. Hướng phát triển
1. Tích hợp chữ ký số/chứng thư số cho bản ghi truy xuất.
2. Bổ sung xác thực đa lớp (QR + tem bảo an + mã OTP ngắn hạn).
3. Triển khai ứng dụng di động cho nông hộ và nhân sự kho.
4. Tích hợp bản đồ số vùng trồng và nhật ký canh tác theo GPS.
5. Mở API kết nối với hệ thống ERP, logistics và sàn thương mại điện tử.
6. Nâng cấp analytics bằng mô hình dự báo nhu cầu và cảnh báo bất thường.

---

## Phụ lục minh họa ngắn (gợi ý đưa vào báo cáo chính thức)

### Ví dụ dữ liệu lô hàng
- Mã lô: XOAI-CL-2026-001  
- Sản phẩm: Xoài cát Hòa Lộc  
- Vùng trồng: Cai Lậy, Tiền Giang  
- Ngày gieo trồng: 12/01/2026  
- Ngày thu hoạch: 10/04/2026  
- Ngày đóng gói: 12/04/2026  
- QR URL: https://domain.vn/product/xoai-cat-hoa-loc?lot=XOAI-CL-2026-001

### Ví dụ timeline truy xuất
1. 12/01/2026: Gieo trồng.
2. 05/02/2026: Bón phân đợt 1.
3. 20/03/2026: Kiểm tra chất lượng trước thu hoạch.
4. 10/04/2026: Thu hoạch.
5. 12/04/2026: Đóng gói và dán QR.
6. 13/04/2026: Xuất kho phân phối.
