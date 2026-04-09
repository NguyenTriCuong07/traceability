const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in .env.local');
  process.exit(1);
}

// Define User schema matching the TypeScript model in lib/db/models/User.ts
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password_hash: { type: String, required: true },
  role: {
    type: String,
    enum: ['admin', 'viewer'],
    default: 'viewer',
  },
  created_at: { type: Date, default: Date.now },
  last_login: { type: Date, default: null },
  email_verified: { type: Boolean, default: false },
  email_verified_at: { type: Date, default: null },
});

userSchema.index({ email: 1 });

const User = mongoose.model('User', userSchema);

async function seedAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✓ Kết nối MongoDB thành công');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@traceagri.com' });
    if (existingAdmin) {
      console.log('✓ Admin đã tồn tại: admin@traceagri.com');
      await mongoose.disconnect();
      return;
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('Admin@123', 10);
    const admin = new User({
      email: 'admin@traceagri.com',
      password_hash: hashedPassword,
      role: 'admin', // Explicitly set role to admin
    });

    await admin.save();
    console.log('✓ Tạo tài khoản admin thành công!');
    console.log('  Email: admin@traceagri.com');
    console.log('  Mật khẩu: Admin@123');
    console.log('  ⚠️  Hãy đổi mật khẩu sau khi đăng nhập lần đầu');

    await mongoose.disconnect();
    console.log('✓ Đóng kết nối MongoDB');
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    process.exit(1);
  }
}

seedAdmin();
