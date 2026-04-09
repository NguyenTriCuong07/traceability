# 🚀 Tham Chiếu Nhanh - TraceAgri

## 📍 URL & Đường Dẫn

| Trang | URL | Mô Tả |
|-------|-----|-------|
| Trang Chủ | `/` | Giới thiệu hệ thống |
| Đăng Nhập | `/login` | Đăng nhập admin |
| Đăng Ký | `/register` | Tạo tài khoản admin mới |
| Dashboard | `/admin` | Bảng điều khiển chính |
| Sản Phẩm | `/admin/products` | Danh sách sản phẩm |
| Tạo SP | `/admin/products/new` | Tạo sản phẩm mới |
| Chỉnh Sửa SP | `/admin/products/:id/edit` | Chỉnh sửa sản phẩm |
| Phân Tích | `/admin/analytics` | Thống kê & biểu đồ |
| Chi Tiết SP | `/product/:slug` | Xem sản phẩm (QR) |
| 404 | `/not-found` | Trang không tìm thấy |

---

## 🔐 Tài Khoản Mặc Định

```
Email: admin@traceagri.com
Mật khẩu: Admin@123
```

**⚠️ Hãy đổi mật khẩu sau khi đăng nhập lần đầu!**

---

## 📋 Danh Sách Menu Sidebar

```
┌─────────────────────────────┐
│     TraceAgri               │
│     Bảng Quản Trị           │
├─────────────────────────────┤
│                             │
│ 📊 Bảng Điều Khiển          │
│    → Xem thống kê tổng quan  │
│                             │
│ 📦 Sản Phẩm                 │
│    → Danh sách sản phẩm      │
│    → Thêm sản phẩm           │
│    → Chỉnh sửa/Xóa          │
│                             │
│ 📈 Phân Tích                │
│    → Xem biểu đồ quét        │
│    → Thống kê IP             │
│                             │
├─────────────────────────────┤
│ 🚪 Đăng Xuất                │
└─────────────────────────────┘
```

---

## 📝 Form Tạo Sản Phẩm

### Bắt Buộc (*)
- ✓ Tên Sản Phẩm
- ✓ Mã Lô
- ✓ Vùng Miền
- ✓ Tỉnh
- ✓ Tên Nông Trại
- ✓ Tên Nhà Sản Xuất
- ✓ Ngày Trồng
- ✓ Ngày Thu Hoạch

### Tùy Chọn
- Mô Tả
- URL Hình Ảnh
- Huyện
- Thuốc Trừ Sâu
- Phân Bón
- Chứng Chỉ (Organic, VietGAP, etc.)

---

## 🎯 Luồng Tạo Sản Phẩm

```
1️⃣ Đăng nhập tại /login
                ↓
2️⃣ Vào /admin/products/new
                ↓
3️⃣ Nhập thông tin chi tiết
                ↓
4️⃣ Nhấn "Tạo Sản Phẩm"
                ↓
5️⃣ Hệ thống tự động:
   • Tạo slug (URL)
   • Generate QR code
   • Lưu database
                ↓
6️⃣ Hiển thị QR code
   Nhấn "Tải Mã QR" để lấy ảnh
```

---

## 💬 Tin Nhắn Thường Gặp

| Tin Nhắn | Nghĩa | Cách Giải Quyết |
|----------|-------|-----------------|
| "Đăng nhập thành công!" | ✅ Đã đăng nhập | Chuyển đến /admin |
| "Đăng nhập thất bại" | ❌ Sai email/mật khẩu | Kiểm tra lại thông tin |
| "Sản phẩm đã được tạo!" | ✅ Tạo thành công | Quay lại danh sách sản phẩm |
| "Không thể lưu sản phẩm" | ❌ Lỗi database | Kiểm tra kết nối MongoDB |
| "Đã xảy ra lỗi" | ⚠️ Lỗi không xác định | Reload trang, check console |

---

## 🔍 Tìm Kiếm & Lọc

### Tìm Kiếm Sản Phẩm
```
Tại: /admin/products
Nhập: Mã lô, tên sản phẩm hoặc vùng sản xuất
→ Hiện kết quả từng trang
```

### Phân Trang
```
Hiển thị: 10 sản phẩm/trang
Điều hướng: Các nút < >
Tổng cộng: Hiện số lượng sản phẩm
```

---

## 📊 Biểu Đồ & Thống Kê

### Dashboard (/admin)
- 📦 Tổng Sản Phẩm: Số lượng sản phẩm
- 👁️ Tổng Lần Quết: Số lượt quét QR
- 📅 Sản Phẩm Gần Đây: 5 sản phẩm mới

### Danh sách Lô Hàng (/admin/products)
- 📌 Cột dữ liệu: Mã lô, Sản phẩm, Vùng sản xuất, Ngày thu hoạch, Đơn vị đóng gói, Trạng thái
- 🟢 Trạng thái: Đang lưu thông, Đang sơ chế, Đã bán hết
- 🔗 Thao tác: Chi tiết (trang công khai) và Chỉnh sửa lô hàng

### Analytics (/admin/analytics)
- 📈 Biểu đồ quét 30 ngày
- 🌍 Quét theo địa điểm (IP)
- 📱 Thiết bị quét (User Agent)
- 🕐 Thời gian quét

---

## ⌨️ Phím Tắt (Keyboard Shortcuts)

| Phím | Hành Động |
|------|-----------|
| `Enter` | Gửi form / Tìm kiếm |
| `Esc` | Đóng dialog / Hủy |
| `Ctrl+S` | Lưu form (khi có) |
| `F12` | Mở Developer Tools |
| `Ctrl+Shift+Del` | Xóa cache (Chrome) |

---

## 🔐 Bảo Mật

### Token JWT
- ⏰ Thời hạn: 7 ngày
- 🔑 Lưu tại: localStorage
- ❌ Hết hạn: Phải đăng nhập lại

### Mật Khẩu
- 🔒 Hash với bcryptjs
- 🚫 Không lưu plaintext
- 🔄 Khuyến nghị: Đổi định kỳ

---

## 🐛 Xử Lý Sự Cố

### Đăng Nhập Không Được
1. Kiểm tra email đúng: `admin@traceagri.com`
2. Kiểm tra mật khẩu (chữ hoa/thường)
3. Xóa cache browser: `Ctrl+Shift+Del`
4. Thử đăng nhập lại

### Token Hết Hạn
1. Làm mới trang: `F5` hoặc `Ctrl+R`
2. Đăng xuất: Sidebar → Đăng Xuất
3. Đăng nhập lại tại `/login`

### QR Code Không Hiển Thị
1. Kiểm tra `.env.local` có `NEXT_PUBLIC_API_URL`
2. Restart dev server
3. Xóa `.next` folder

### Lỗi Database
1. Kiểm tra MongoDB đang chạy
2. Kiểm tra `MONGODB_URI` trong `.env.local`
3. Kiểm tra internet connection
4. Liên hệ admin hệ thống

---

## 📱 QR Code

### Tạo QR
```
Khi tạo sản phẩm
→ Hệ thống tự động generate
→ Nhấn "Tải Mã QR"
→ Lưu file (qr-code.png)
```

### In Ấn
```
In ảnh QR code
Dán trên bao bì sản phẩm
Khách hàng quét → Xem chi tiết
```

### Test Quét
1. Tạo sản phẩm test
2. Tải QR code
3. Dùng camera phone quét
4. Hoặc truy cập URL trực tiếp

---

## 🎓 Hướng Dẫn Chi Tiết

Xem tài liệu đầy đủ:
- 📖 **SETUP_VIETNAMESE.md**: Hướng dẫn cài đặt
- 📖 **ADMIN_GUIDE_VIETNAMESE.md**: Hướng dẫn chi tiết admin
- 📖 **VIETNAMESE_TRANSLATION_SUMMARY.md**: Tóm tắt dịch

---

## 📞 Hỗ Trợ

**Vấn đề?**
1. Xem console: `F12` → Console
2. Kiểm tra logs
3. Liên hệ quản trị viên hệ thống

---

## ✨ Tips Pro

💡 **Tạo Slug Dễ Nhớ**
```
Tên: "Cà chua Đà Lạt"
Mã Lô: "DA-LAT-20240107"
Slug tự động: "ca-chua-da-lat-da-lat-20240107"
```

💡 **Quản Lý QR Code**
```
• Lưu tệp: Tạo folder /qrcodes
• Đặt tên: Theo mã lô sản phẩm
• Backup: Lưu 2 bản sao
```

💡 **Theo Dõi Analytics**
```
• Kiểm tra hàng ngày
• Xem sản phẩm phổ biến
• Phân tích xu hướng quét
```

---

**v1.0 - Cập nhật: 2024**

*TraceAgri - Hệ Thống Truy Xuất Nguồn Gốc Nông Sản* 🌾
