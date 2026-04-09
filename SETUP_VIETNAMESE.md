# 🚀 Hướng Dẫn Cài Đặt Hệ Thống TraceAgri

## 📋 Yêu Cầu Trước Tiên

- Node.js 16+ 
- MongoDB (cục bộ hoặc Atlas cloud)
- npm hoặc pnpm

---

## ⚙️ Cài Đặt Từng Bước

### 1. Cài Đặt Dependencies

```bash
npm install
# hoặc
pnpm install
```

### 2. Tạo File .env.local

Tạo file `.env.local` trong thư mục gốc:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/traceagri
# Hoặc dùng MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/traceagri

# JWT Secrets (tạo random string)
JWT_SECRET=your_super_secret_key_here_min_32_chars
NEXT_PUBLIC_API_URL=http://localhost:3000

# QR Code Settings
NEXT_PUBLIC_QR_SIZE=300
```

### 3. Tạo Tài Khoản Admin Mặc Định

Chạy script seed admin:

```bash
node scripts/seed-admin.js
```

**Output sẽ hiển thị:**
```
✓ Kết nối MongoDB thành công
✓ Tạo tài khoản admin thành công!
  Email: admin@traceagri.com
  Mật khẩu: Admin@123
  ⚠️  Hãy đổi mật khẩu sau khi đăng nhập lần đầu
```

### 4. Chạy Dev Server

```bash
npm run dev
# hoặc
pnpm dev
```

Truy cập: **http://localhost:3000**

---

## 🔐 Đăng Nhập Admin

1. Truy cập: **http://localhost:3000/login**
2. Email: `admin@traceagri.com`
3. Mật khẩu: `Admin@123`

---

## 📱 Kiểm Tra Chức Năng

### Trang Chủ Công Khai
- URL: `http://localhost:3000`
- Hiển thị thông tin về hệ thống
- Nút "Đăng Nhập Admin"

### Bảng Điều Khiển Admin  
- URL: `http://localhost:3000/admin`
- Xem thống kê tổng quan
- Quản lý sản phẩm

### Quản Lý Sản Phẩm
- URL: `http://localhost:3000/admin/products`
- Danh sách sản phẩm
- Nút "Thêm Sản Phẩm"

### Tạo Sản Phẩm
- URL: `http://localhost:3000/admin/products/new`
- Form chi tiết với QR code tự động generate

### Trang Chi Tiết Sản Phẩm (QR)
- URL: `/product/{slug}`
- Hiển thị tất cả thông tin khi quét QR
- VD: `http://localhost:3000/product/ca-chua-da-lat-20240107`

---

## 🎯 Quy Trình Hoạt Động

### 1. Admin Tạo Sản Phẩm
```
1. Đăng nhập tại /login
2. Vào /admin/products/new
3. Nhập thông tin:
   - Tên sản phẩm
   - Mã lô hàng
   - Địa điểm gốc (tỉnh, huyện, nông trại)
   - Thông tin truy xuất (ngày trồng, ngày thu hoạch)
   - Chứng chỉ (VietGAP, Organic...)
   - Thông tin nhà sản xuất
4. Nhấn "Tạo Sản Phẩm"
5. Hệ thống tự động:
   - Tạo slug (URL thân thiện)
   - Generate QR code
   - Lưu vào database
```

### 2. Khách Hàng Quét QR
```
1. Dùng camera/QR scanner
2. Quét mã QR trên bao bì
3. Được chuyển hướng tới /product/{slug}
4. Xem chi tiết sản phẩm:
   - Thông tin gốc
   - Chứng chỉ
   - Thông tin nhà sản xuất
   - Số lần quét
```

---

## 📊 API Endpoints (Tiếng Anh - Dùng Cho Developer)

### Public APIs
```
GET  /api/products/slug/:slug       - Lấy sản phẩm theo slug
POST /api/products/:slug/verify     - Xác thực sản phẩm
```

### Admin APIs (Yêu Cầu JWT Token)
```
GET    /api/products                       - Danh sách sản phẩm
POST   /api/products                       - Tạo sản phẩm
GET    /api/products/:id                   - Chi tiết sản phẩm
PUT    /api/products/:id                   - Cập nhật sản phẩm
DELETE /api/products/:id                   - Xóa sản phẩm
GET    /api/products/:id/analytics         - Thống kê quét
```

---

## 🚀 Deploy Lên Production

### Dùng Vercel (Khuyến Nghị)

```bash
npm i -g vercel
vercel login
vercel
```

### Dùng Docker

```bash
docker build -t traceagri .
docker run -p 3000:3000 traceagri
```

---

## 🔧 Troubleshooting

### Lỗi: "MONGODB_URI not found"
→ Kiểm tra file `.env.local` có `MONGODB_URI` chưa?

### Lỗi: "Cannot connect to MongoDB"
→ Đảm bảo MongoDB đang chạy hoặc URI hợp lệ

### QR Code không hiển thị
→ Kiểm tra `NEXT_PUBLIC_API_URL` trong `.env.local`

### Token hết hạn
→ Đăng nhập lại hoặc xóa localStorage.token

---

## 📞 Support

Nếu gặp vấn đề:
1. Kiểm tra logs trong terminal
2. Xóa `.next` folder và rebuild: `npm run dev`
3. Clear browser cache: Ctrl+Shift+Delete

**Happy Coding! 🎉**
