# TraceAgri Quick Start Guide

Get the system running in 5 minutes.

## 1. Environment Setup

Create `.env.local` file in project root:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your MongoDB connection:

```
MONGODB_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/traceagri

JWT_SECRET=super-secret-jwt-key-change-this

PRODUCT_SECRET_KEY=super-secret-product-key-change-this

NEXT_PUBLIC_API_URL=http://localhost:3000
```

**MongoDB Atlas Setup** (if you don't have MongoDB):
1. Go to [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
2. Create free account
3. Create cluster (M0 free tier)
4. Create database user
5. Get connection string
6. Paste into `MONGODB_URI`

## 2. Install & Run

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 3. Create Admin Account

1. Go to [http://localhost:3000/register](http://localhost:3000/register)
2. Enter email and password (min 6 chars)
3. Click Register
4. You'll be redirected to admin dashboard

## 4. Create First Product

1. At admin dashboard, click "Add Product"
2. Fill in required fields:
   - Product Name: "Cà chua Đà Lạt" (or any name)
   - Batch Code: "BATCH-001-2024"
   - Region: "Tây Nguyên"
   - Province: "Lâm Đồng"
   - Farm Name: "Farm A"
   - Producer Name: "Farmer John"
   - Planting Date: 2024-01-01
   - Harvest Date: 2024-01-07
   - Certification: Check "Organic Certified"
3. Click "Create Product"
4. QR code will be generated and displayed
5. Click "Download QR Code"

## 5. Test Public Page

1. In admin products list, click the eye icon to view public page
2. Or visit: `http://localhost:3000/product/<slug>`
3. See product details, origin, certifications
4. Click "Verify Authenticity"
5. Notice scan counter increments

## 6. Admin Features

**Dashboard** (`/admin`)
- Overview of total products and scans
- Recent products list
- Quick actions

**Products** (`/admin/products`)
- Search products
- Edit/delete products
- View on public site
- Pagination

**Analytics** (`/admin/analytics`)
- Select a product
- View scan trends (30-day chart)
- See scan statistics
- View recent scans with IP/location

## Project Routes

### Public Routes
- `/` - Homepage
- `/login` - Admin login
- `/register` - Admin registration
- `/product/:slug` - Product detail page (SEO optimized)

### Admin Routes (Protected)
- `/admin` - Dashboard
- `/admin/products` - Products list
- `/admin/products/new` - Create product
- `/admin/products/:id/edit` - Edit product
- `/admin/analytics` - Analytics dashboard

### API Routes
```
POST   /api/auth/register       - Register admin
POST   /api/auth/login          - Login admin
GET    /api/auth/verify         - Verify JWT token

GET    /api/products            - List products (admin)
POST   /api/products            - Create product (admin)
GET    /api/products/:id        - Get product by ID (admin)
PUT    /api/products/:id        - Update product (admin)
DELETE /api/products/:id        - Delete product (admin)

GET    /api/products/slug/:slug - Get product by slug (public)
POST   /api/products/slug/:slug - Log scan (public)

GET    /api/products/:id/analytics - Get analytics (admin)
```

## Database Models

### Product
```
name: "Cà chua Đà Lạt"
slug: "ca-chua-da-lat-20240107"
batch_code: "BATCH-001-2024"
origin: {
  region: "Tây Nguyên",
  province: "Lâm Đồng",
  farm_name: "Farm A",
  producer_name: "Farmer John"
}
traceability: {
  planting_date: 2024-01-01,
  harvest_date: 2024-01-07,
  certification: { organic: true, certifier: "VietGAP" }
}
scan_count: 0
```

### User
```
email: "admin@example.com"
password_hash: "bcrypt_hashed_password"
role: "admin"
```

## Common Commands

```bash
# Development
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## Troubleshooting

**"MONGODB_URI is not defined"**
- Check `.env.local` file exists
- Verify `MONGODB_URI=...` is set
- Restart dev server after changes

**"Cannot read property 'findOne' of undefined"**
- MongoDB connection not established
- Check MONGODB_URI is correct
- Verify internet connection
- Check MongoDB Atlas whitelist includes your IP

**"Cast to ObjectId failed"**
- Invalid product ID in URL
- Use correct MongoDB ObjectId format
- Check browser console for exact error

**QR Code not showing**
- Check `NEXT_PUBLIC_API_URL` is correct
- Verify qrcode.js is installed (`npm list qrcode`)
- Check browser console for errors

**401 Unauthorized errors**
- Token expired - login again
- Token not in localStorage - check browser storage
- Wrong authorization header format

## Testing Scenarios

### Scenario 1: Complete Flow
1. Register new admin account
2. Create a product with all fields
3. Download QR code
4. Scan QR code or visit product page
5. Verify authenticity
6. Check analytics dashboard
7. View scan statistics

### Scenario 2: Product Management
1. Create multiple products
2. Search products by name
3. Edit product details
4. Delete a product
5. Verify deletions don't affect others

### Scenario 3: QR Scanning Simulation
1. Get product slug from admin (or check URL)
2. Visit `/product/:slug` multiple times
3. Check scan counter increases
4. Go to analytics to see scan trends

## Key Features

✅ **QR Code Generation**: Automatic slug + QR for each product
✅ **Secure Auth**: JWT tokens + bcryptjs password hashing
✅ **Product Tracking**: Track scans, view analytics
✅ **SEO Optimized**: Server-rendered pages with meta tags
✅ **Responsive**: Works on desktop and mobile
✅ **Admin Dashboard**: Complete product management
✅ **Public Verification**: Customers can verify products
✅ **Analytics**: Charts, trends, recent scans

## Next Steps

1. **Customize Styling**: Edit colors in TailwindCSS
2. **Add Your Logo**: Replace in components
3. **Deploy**: Push to GitHub → Connect to Vercel
4. **Set Environment Variables**: In Vercel project settings
5. **Add More Products**: Via admin dashboard
6. **Monitor Analytics**: Track customer engagement

## Support

For issues:
1. Check browser console (F12)
2. Check terminal for errors
3. Verify `.env.local` settings
4. Check MongoDB connection
5. See README.md for full documentation

---

**You're all set! Start creating products and tracking their origin.** 🌾
