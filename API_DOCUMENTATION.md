# 📚 TraceAgri API Documentation

## Authentication APIs

### 1. Register New User
```
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "data": {
    "userId": "...",
    "email": "user@example.com",
    "token": "jwt_token_here"
  }
}
```

### 2. Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@traceagri.com",
  "password": "Admin@123"
}

Response:
{
  "success": true,
  "data": {
    "userId": "...",
    "email": "admin@traceagri.com",
    "token": "jwt_token_here"
  }
}
```

### 3. Verify Token
```
GET /api/auth/verify
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "userId": "...",
    "email": "admin@traceagri.com",
    "role": "admin"
  }
}
```

### 4. Forgot Password
```
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}

Response:
{
  "success": true,
  "message": "Email đặt lại mật khẩu đã được gửi"
}
```

### 5. Reset Password
```
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "reset_token_from_email",
  "newPassword": "newpassword123",
  "confirmPassword": "newpassword123"
}

Response:
{
  "success": true,
  "message": "Mật khẩu đã được đặt lại thành công"
}
```

### 6. Verify Email
```
POST /api/auth/verify-email
Content-Type: application/json

{
  "token": "verification_token_from_email"
}

Response:
{
  "success": true,
  "message": "Email xác minh thành công!"
}
```

---

## Product APIs

### 1. Get All Products
```
GET /api/products?page=1&limit=10

Response:
{
  "success": true,
  "data": [
    {
      "id": "...",
      "name": "Cà chua Đà Lạt",
      "batch_code": "BATCH-001",
      "slug": "ca-chua-da-lat",
      "scan_count": 42,
      "created_at": "2024-01-01T..."
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50
  }
}
```

### 2. Create Product
```
POST /api/products
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Cà chua Đà Lạt",
  "batch_code": "BATCH-001-2024",
  "description": "Cà chua tươi từ Đà Lạt",
  "origin": {
    "region": "Tây Nguyên",
    "province": "Lâm Đồng",
    "district": "Đà Lạt",
    "farm_name": "Farm A",
    "producer_name": "Farmer John",
    "coordinates": {
      "lat": 11.94,
      "lng": 108.44
    }
  },
  "traceability": {
    "planting_date": "2024-01-01",
    "harvest_date": "2024-01-07",
    "pesticides_used": ["Pesticide A"],
    "fertilizer_used": ["Fertilizer B"],
    "certification": {
      "organic": true,
      "certifier": "Vietnam Organic",
      "cert_number": "ORG-123",
      "cert_expiry": "2025-01-01"
    }
  }
}

Response:
{
  "success": true,
  "data": {
    "id": "...",
    "name": "Cà chua Đà Lạt",
    "slug": "ca-chua-da-lat-1234567890",
    "qr_code_url": "data:image/png;base64,...",
    "scan_count": 0
  }
}
```

### 3. Get Product by ID
```
GET /api/products/:id

Response:
{
  "success": true,
  "data": {
    "id": "...",
    "name": "Cà chua Đà Lạt",
    "slug": "ca-chua-da-lat",
    "batch_code": "BATCH-001",
    "scan_count": 42,
    ...
  }
}
```

### 4. Update Product
```
PUT /api/products/:id
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Cà chua Đà Lạt (Updated)",
  "batch_code": "BATCH-001-UPDATED",
  ...
}

Response:
{
  "success": true,
  "data": { ... }
}
```

### 5. Delete Product
```
DELETE /api/products/:id
Authorization: Bearer <admin_token>

Response:
{
  "success": true,
  "message": "Sản phẩm đã được xóa"
}
```

### 6. Get Product by Slug
```
GET /api/products/slug/:slug

Response:
{
  "success": true,
  "data": {
    "id": "...",
    "name": "Cà chua Đà Lạt",
    "slug": "ca-chua-da-lat",
    "qr_code_url": "...",
    "scan_count": 42,
    "last_scanned_at": "2024-01-15T..."
  }
}
```

### 7. Get Product Analytics
```
GET /api/products/:id/analytics

Response:
{
  "success": true,
  "data": {
    "total_scans": 42,
    "unique_ips": 35,
    "scan_trends": [
      { "date": "2024-01-01", "count": 5 },
      { "date": "2024-01-02", "count": 8 },
      ...
    ],
    "recent_scans": [
      {
        "ip_address": "192.168.1.1",
        "country": "Vietnam",
        "city": "Hanoi",
        "device_user_agent": "Mozilla/5.0...",
        "scanned_at": "2024-01-15T..."
      }
    ]
  }
}
```

### 8. Export Products
```
GET /api/products/export?format=csv
GET /api/products/export?format=json

Response: File download
```

### 9. Import Products
```
POST /api/products/import
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data

File: products.csv

CSV Format:
Name,Batch Code,Region,Province,District,Farm Name,Producer Name,Planting Date,Harvest Date
Cà chua Đà Lạt,BATCH-001,Tây Nguyên,Lâm Đồng,Đà Lạt,Farm A,Farmer John,2024-01-01,2024-01-07

Response:
{
  "success": true,
  "message": "Import hoàn thành: X thành công, Y lỗi",
  "data": {
    "successCount": 10,
    "errorCount": 0,
    "importedProducts": [...]
  }
}
```

---

## User Management APIs

### 1. Get All Users
```
GET /api/users
Authorization: Bearer <admin_token>

Response:
{
  "success": true,
  "data": [
    {
      "id": "...",
      "email": "admin@traceagri.com",
      "role": "admin",
      "created_at": "2024-01-01T...",
      "last_login": "2024-01-15T..."
    }
  ]
}
```

### 2. Update User Role
```
PUT /api/users
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "userId": "user_id_here",
  "role": "viewer"
}

Response:
{
  "success": true,
  "message": "Role đã được cập nhật",
  "data": {
    "id": "...",
    "email": "user@example.com",
    "role": "viewer"
  }
}
```

---

## Authentication

All protected endpoints require JWT token in Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

Token expires in 7 days.

---

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "error": "Error message in Vietnamese"
}
```

Common HTTP Status Codes:
- `200` - Success
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error

---

## Environment Variables

```env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
PRODUCT_SECRET_KEY=your-secret-key
NEXT_PUBLIC_API_URL=http://localhost:3000
```
