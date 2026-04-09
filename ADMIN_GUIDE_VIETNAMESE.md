# 📖 Hướng Dẫn Quản Trị Viên - TraceAgri

## 🎯 Tổng Quan

TraceAgri là hệ thống truy xuất nguồn gốc nông sản sử dụng mã QR. Admin có thể quản lý sản phẩm, tạo mã QR, và theo dõi thống kê quét.

---

## 🔐 Đăng Nhập Admin

### Tài Khoản Mặc Định
- **Email**: `admin@traceagri.com`
- **Mật Khẩu**: `Admin@123`
- **⚠️ Lưu Ý**: Hãy đổi mật khẩu ngay khi đăng nhập lần đầu

### Cách Đăng Nhập
1. Truy cập: `http://localhost:3000/login`
2. Nhập email: `admin@traceagri.com`
3. Nhập mật khẩu: `Admin@123`
4. Nhấn "Đăng Nhập"

---

## 📊 Bảng Điều Khiển (Dashboard)

**URL**: `/admin`

Hiển thị:
- 📦 **Tổng Sản Phẩm**: Số lượng sản phẩm trong hệ thống
- 👁️ **Tổng Lần Quét**: Số lượt quét mã QR
- **Hành Động Nhanh**: Nút thêm sản phẩm
- **Sản Phẩm Gần Đây**: 5 sản phẩm mới nhất

---

## 🛒 Quản Lý Sản Phẩm

### 1. Xem Danh Sách Sản Phẩm

**URL**: `/admin/products`

Tính năng:
- Hiển thị bảng tất cả lô hàng với các cột: Mã lô, Sản phẩm, Vùng sản xuất, Ngày thu hoạch, Đơn vị đóng gói, Trạng thái
- Tìm kiếm theo mã lô, tên sản phẩm hoặc vùng
- Phân trang (10 sản phẩm/trang)
- Xem chi tiết trang công khai và chỉnh sửa lô hàng
- Theo dõi trạng thái lô hàng: Đang lưu thông, Đang sơ chế, Đã bán hết

### 2. Tạo Sản Phẩm Mới

**URL**: `/admin/products/new`

**Các Trường Cần Nhập**:

#### A. Thông Tin Cơ Bản
- **Tên Sản Phẩm** (bắt buộc): VD: "Cà chua Đà Lạt"
- **Mã Lô** (bắt buộc): VD: "DA-LAT-240107"
- **Mô Tả**: Chi tiết về sản phẩm
- **URL Hình Ảnh**: Liên kết ảnh sản phẩm

#### B. Thông Tin Nguồn Gốc
- **Vùng Miền** (bắt buộc): VD: "Tây Nguyên"
- **Tỉnh** (bắt buộc): VD: "Lâm Đồng"
- **Huyện**: VD: "Thành phố Đà Lạt"
- **Tên Nông Trại** (bắt buộc): VD: "Nông Trại A"
- **Tên Nhà Sản Xuất** (bắt buộc): VD: "Nguyễn Văn A"

#### C. Thông Tin Truy Xuất
- **Ngày Trồng** (bắt buộc): Chọn ngày/giờ
- **Ngày Thu Hoạch** (bắt buộc): Chọn ngày/giờ
- **Thuốc Trừ Sâu Dùng**: Cách nhau bằng dấu phẩy
  - VD: "Dầu Neem, Lưu Huỳnh"
- **Phân Bón Dùng**: Cách nhau bằng dấu phẩy
  - VD: "Phân Hữu Cơ, NPK 10-10-10"

#### D. Thông Tin Chứng Chỉ
- **Có Chứng Chỉ Hữu Cơ**: Checkbox (có/không)
- **Cơ Quan Cấp Chứng Chỉ**: VD: "VietGAP"
- **Số Chứng Chỉ**: VD: "VIET-2024-001"
- **Ngày Hết Hạn Chứng Chỉ**: Chọn ngày hết hạn

**Quy Trình Tạo**:
1. Nhập tất cả thông tin bắt buộc
2. Nhấn "Tạo Sản Phẩm"
3. Hệ thống tự động:
   - ✅ Tạo slug (URL): `ca-chua-da-lat-240107`
   - ✅ Generate QR code
   - ✅ Lưu vào database
4. Hiển thị QR code
5. Nhấn "Tải Mã QR" để tải ảnh

### 3. Chỉnh Sửa Sản Phẩm

**URL**: `/admin/products/:id/edit`

Cách truy cập:
- Vào danh sách sản phẩm
- Nhấn nút "Chi tiết" để mở trang công khai của sản phẩm
- Nhấn nút icon lưới để vào trang chỉnh sửa lô hàng
- Chỉnh sửa thông tin
- Nhấn "Cập Nhật Sản Phẩm"

---

## 📈 Phân Tích (Analytics)

**URL**: `/admin/analytics`

**Xem Thống Kê**:
- Biểu đồ quét trong 30 ngày gần đây
- Tổng số lần quét
- Tổng IP độc lập
- Danh sách quét gần đây

---

## 🔑 Quản Lý Tài Khoản

### Đổi Mật Khẩu

Hiện chưa có giao diện đổi mật khẩu. Bạn có thể:
1. Liên hệ quản trị viên hệ thống
2. Hoặc yêu cầu reset mật khẩu qua email

### Đăng Xuất

1. Nhấn menu "⎕" (sidebar)
2. Chọn "🚪 Đăng Xuất"
3. Xác nhận đăng xuất
4. Được chuyển hướng về trang đăng nhập

---

## 📱 Xem Sản Phẩm Công Khai

Khách hàng sẽ thấy sản phẩm ở:
- **URL**: `/product/{slug}`
- **VD**: `/product/ca-chua-da-lat-240107`
- **Cách truy cập**: 
  - Quét mã QR
  - Hoặc truy cập trực tiếp URL

**Thông Tin Hiển Thị**:
- ✅ Tên sản phẩm
- ✅ Hình ảnh
- ✅ Thông tin nguồn gốc
- ✅ Ngày trồng/thu hoạch
- ✅ Chứng chỉ
- ✅ Thông tin nhà sản xuất
- ✅ Số lần quét

---

## 🎯 Tips & Tricks

### 1. Tạo Slug Dễ Nhớ
Slug sẽ tự động tạo từ tên sản phẩm + ngày.
- ✅ Tốt: "Ca chua Da Lat 2024-01-07"
- ❌ Tránh: "aaaa", "test product 123"

### 2. Quản Lý Mã QR
- Hệ thống tự động generate QR code
- Chỉ cần nhấn "Tải Mã QR" để lấy file
- In ra hoặc dán trên bao bì sản phẩm

### 3. Tracking Quét
- Mỗi lần quét được ghi nhận
- Xem số liệu thống kê tại `/admin/analytics`
- Dùng để phân tích hành vi khách hàng

### 4. Tìm Kiếm Nhanh
- Sử dụng ô tìm kiếm tại `/admin/products`
- Tìm theo tên sản phẩm hoặc mã lô
- Hỗ trợ tìm kiếm bộ phận (partial search)

---

## ⚠️ Các Lỗi Thường Gặp

### Lỗi: "Email đã tồn tại"
- Nguyên nhân: Tài khoản đã được đăng ký
- Giải pháp: Sử dụng email khác hoặc đăng nhập

### Lỗi: "Token hết hạn"
- Nguyên nhân: Phiên đăng nhập hết hạn (7 ngày)
- Giải pháp: Đăng nhập lại tại `/login`

### Lỗi: "Không thể tải sản phẩm"
- Nguyên nhân: Kết nối database bị ngắt
- Giải pháp: Kiểm tra kết nối MongoDB

### Lỗi: "QR code không hiển thị"
- Nguyên nhân: `NEXT_PUBLIC_API_URL` sai
- Giải pháp: Kiểm tra `.env.local`

---

## 📞 Hỗ Trợ

Nếu gặp vấn đề:
1. Kiểm tra logs trong browser (F12 → Console)
2. Xóa cache browser: Ctrl+Shift+Delete
3. Đăng xuất rồi đăng nhập lại
4. Liên hệ quản trị viên hệ thống

---

## 🚀 Bước Tiếp Theo

Sau khi cài đặt thành công:
1. ✅ Đăng nhập tại `/login`
2. ✅ Tạo sản phẩm đầu tiên tại `/admin/products/new`
3. ✅ Tải mã QR và test quét
4. ✅ Xem analytics tại `/admin/analytics`

**Chúc bạn thành công! 🎉**
