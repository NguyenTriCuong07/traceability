# TraceAgri - Agricultural Product Traceability System

A comprehensive web application for tracking the origin and authenticity of agricultural products using QR codes. Built with Next.js, MongoDB, and modern web technologies.

## Features

### Public Features
- **QR Code Scanning**: Direct access to product details via QR code
- **Product Details**: View origin, traceability, certifications, and producer information
- **Verification**: Verify product authenticity with token verification
- **Statistics**: See scan counts and transparency information
- **SEO Optimized**: Slug-based URLs with proper meta tags

### Admin Features
- **Authentication**: Secure login/register system with JWT tokens
- **Product Management**: Create, read, update, and delete products
- **QR Generation**: Automatic QR code generation for each product
- **Analytics**: Track scan statistics, view trends, and analyze engagement
- **Dashboard**: Overview of total products, scans, and recent activity

## Tech Stack

- **Frontend**: Next.js 14+ (React, TypeScript)
- **Backend**: Next.js API Routes
- **Database**: MongoDB + Mongoose
- **Authentication**: JWT + bcryptjs
- **UI Components**: shadcn/ui + TailwindCSS
- **QR Code**: qrcode.js library
- **Charts**: Recharts
- **Form Validation**: Zod + React Hook Form

## Project Structure

```
app/
├── page.tsx                     # Homepage
├── layout.tsx                   # Root layout with metadata
├── not-found.tsx               # 404 page
├── product/[slug]/page.tsx     # Public product page
├── login/page.tsx              # Admin login
├── register/page.tsx           # Admin registration
├── admin/                       # Admin routes (protected)
│   ├── layout.tsx              # Admin layout with sidebar
│   ├── page.tsx                # Dashboard
│   ├── products/
│   │   ├── page.tsx            # Products list
│   │   ├── new/page.tsx        # Create product
│   │   └── [id]/edit/page.tsx  # Edit product
│   └── analytics/page.tsx      # Analytics dashboard
└── api/                         # API routes
    ├── auth/
    │   ├── register/route.ts
    │   ├── login/route.ts
    │   └── verify/route.ts
    └── products/
        ├── route.ts            # List & create products
        ├── [id]/route.ts       # Get, update, delete
        ├── [id]/analytics/route.ts
        └── slug/[slug]/route.ts # Public product endpoint

lib/
├── db/
│   ├── mongoose.ts             # Database connection
│   └── models/
│       ├── User.ts
│       ├── Product.ts
│       └── ScanLog.ts
├── auth.ts                     # Authentication utilities
├── qr.ts                       # QR generation utilities

components/
├── ProductDetail.tsx           # Product display component
├── ProductForm.tsx             # Product creation/edit form
├── AuthGuard.tsx              # Protected route wrapper
├── Sidebar.tsx                # Admin navigation
└── ui/                        # shadcn/ui components
```

## Setup Instructions

### Prerequisites
- Node.js 18+
- MongoDB instance (local or Atlas)
- npm or pnpm

### Installation

1. **Install dependencies**:
```bash
npm install
# or
pnpm install
```

2. **Configure environment variables**:
```bash
cp .env.example .env.local
```

Then edit `.env.local` with your settings:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
JWT_SECRET=your-secret-key-change-in-production
PRODUCT_SECRET_KEY=your-product-secret-change-in-production
NEXT_PUBLIC_API_URL=http://localhost:3000
```

3. **Run development server**:
```bash
npm run dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage Guide

### For Customers

1. **Scan QR Code**: Use phone camera to scan product QR code
2. **View Details**: Automatically redirected to product page
3. **Check Origin**: See farm location, region, province
4. **Verify Authenticity**: Click "Verify Authenticity" to confirm product is genuine
5. **Check Statistics**: View how many others have scanned this product

### For Admins

1. **Register Account**:
   - Go to `/register`
   - Enter email and password (min 6 characters)
   - Credentials are saved securely with bcryptjs hashing

2. **Login**:
   - Go to `/login`
   - Enter credentials
   - JWT token saved to localStorage

3. **Create Product**:
   - Go to Admin Dashboard (`/admin`)
   - Click "Add Product"
   - Fill in all required fields:
     - Basic info (name, batch code, description)
     - Origin details (region, province, farm, producer)
     - Traceability (planting/harvest dates, certifications)
   - System automatically:
     - Generates unique slug from product name
     - Creates QR code with `/product/:slug` URL
     - Stores secure token for verification

4. **Manage Products**:
   - View all products in `/admin/products`
   - Search by name or batch code
   - Edit product details
   - Delete products
   - View product on public page

5. **View Analytics**:
   - Go to `/admin/analytics`
   - Select a product from dropdown
   - View scan statistics:
     - Total scans
     - Unique IP addresses
     - Scan trend graph (last 30 days)
     - Recent scan details with IP, location, time

## Database Schema

### Product Model
```javascript
{
  _id: ObjectId,
  name: String,                  // Product name
  slug: String,                  // URL-friendly identifier (unique)
  batch_code: String,            // Batch/lot code
  description: String,           // Optional description
  image_url: String,             // Optional product image
  
  origin: {
    region: String,              // Geographic region
    province: String,            // Province/state
    district: String,            // District (optional)
    farm_name: String,           // Farm name
    producer_name: String,       // Producer contact name
    coordinates: { lat, lng }    // GPS coordinates (optional)
  },
  
  traceability: {
    planting_date: Date,
    harvest_date: Date,
    pesticides_used: [String],
    fertilizer_used: [String],
    certification: {
      organic: Boolean,
      certifier: String,         // e.g., "VietGAP", "ECOCERT"
      cert_number: String,
      cert_expiry: Date
    }
  },
  
  qr_code_url: String,           // URL for QR code
  unique_token: String,          // SHA256 hash for verification
  scan_count: Number,            // Total scans
  last_scanned_at: Date,
  created_at: Date,
  updated_at: Date,
  expires_at: Date              // Optional expiry date
}
```

### User Model
```javascript
{
  _id: ObjectId,
  email: String,                 // Unique email
  password_hash: String,         // bcryptjs hashed
  role: String,                  // "admin" or "viewer"
  created_at: Date,
  last_login: Date
}
```

### ScanLog Model
```javascript
{
  _id: ObjectId,
  product_id: ObjectId,          // Reference to product
  slug: String,
  scanned_at: Date,
  ip_address: String,
  country: String,               // Derived from IP (optional)
  city: String,                  // Derived from IP (optional)
  device_user_agent: String
}
```

## API Endpoints

### Public Endpoints

**GET `/product/:slug`**
- Public product page (server-rendered with SEO)
- Returns HTML with product details

**GET `/api/products/slug/:slug`**
- Fetch product by slug (JSON)
- Response: `{ success: true, data: product }`

**POST `/api/products/slug/:slug`**
- Log a scan event
- Body: `{ country?: string, city?: string }`
- Increments scan counter

### Admin Endpoints (Protected with JWT)

**POST `/api/auth/register`**
- Register new admin account
- Body: `{ email: string, password: string }`
- Returns: `{ token, userId, email }`

**POST `/api/auth/login`**
- Admin login
- Body: `{ email: string, password: string }`
- Returns: `{ token, userId, email }`

**GET `/api/auth/verify`**
- Verify JWT token validity
- Header: `Authorization: Bearer <token>`
- Returns: `{ userId, email, role }`

**GET `/api/products`**
- List all products with pagination
- Query: `?page=1&limit=10&search=query`
- Returns: `{ products: [], pagination: { ... } }`

**POST `/api/products`**
- Create new product (generates QR code)
- Body: `{ name, batch_code, origin, traceability, ... }`
- Returns: `{ product, qr_code: dataUrl }`

**GET `/api/products/:id`**
- Get product by MongoDB ID
- Returns: `{ product }`

**PUT `/api/products/:id`**
- Update product details
- Body: Partial product object
- Returns: `{ product }`

**DELETE `/api/products/:id`**
- Delete product
- Returns: `{ message: "success" }`

**GET `/api/products/:id/analytics`**
- Get scan statistics for product
- Returns: `{ total_scans, unique_ips, scan_trend: [...], recent_scans: [...] }`

## Authentication Flow

1. **Registration**:
   - User enters email + password
   - Password hashed with bcryptjs (10 salt rounds)
   - User stored in MongoDB
   - JWT token generated and returned

2. **Login**:
   - User enters credentials
   - Password compared with bcrypt hash
   - JWT token generated (expires in 7 days)
   - Token stored in localStorage (client-side)

3. **Protected Routes**:
   - AuthGuard component wraps admin pages
   - Verifies token on `/api/auth/verify` endpoint
   - Redirects to login if invalid/expired
   - Token included in Authorization header for API calls

## Security Features

- **Password Security**: bcryptjs with 10 salt rounds
- **Token Security**: JWT signed with secret, 7-day expiry
- **Input Validation**: Zod schemas on all endpoints
- **SQL Injection Prevention**: Mongoose automatic escaping
- **Authentication**: Protected admin routes with AuthGuard
- **Product Verification**: SHA256 token verification for QR authenticity
- **HTTPS**: Required for production (configured in deployment)

## Deployment

### To Vercel

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel settings:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `PRODUCT_SECRET_KEY`
   - `NEXT_PUBLIC_API_URL` (production domain)
4. Deploy

### To Other Platforms

Ensure Node.js 18+ is installed and environment variables are set.

```bash
npm run build
npm start
```

## Testing

### Test Account
For testing purposes, register a new account via `/register` endpoint.

### Sample Product Data
Populate with test products via the admin dashboard at `/admin/products/new`.

## Common Issues

**MongoDB Connection Failed**
- Check `MONGODB_URI` environment variable
- Ensure IP is whitelisted in MongoDB Atlas
- Verify network connectivity

**QR Code Not Generating**
- Check `NEXT_PUBLIC_API_URL` is set correctly
- Ensure qrcode.js is installed
- Check browser console for errors

**Auth Token Expired**
- Tokens expire after 7 days
- User must login again
- Token auto-clears from localStorage on expiry

## Future Enhancements

- Geolocation tracking for scans
- Blockchain integration for anti-counterfeiting
- Multi-language support
- Mobile app (React Native)
- Advanced analytics with heatmaps
- Bulk product import/export
- SMS notifications
- Rate limiting and DDoS protection
- Two-factor authentication

## Support & Contributions

For issues or feature requests, please contact the development team.

## License

All rights reserved.
