import { connectDB } from '@/lib/db/mongoose';
import { User } from '@/lib/db/models/User';
import { hashPassword, generateToken } from '@/lib/auth';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});

export async function POST(request: Request) {
  try {
    await connectDB();

    const body = await request.json();
    const { email, password } = registerSchema.parse(body);

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return Response.json(
        { success: false, error: 'Email này đã được đăng ký' },
        { status: 400 }
      );
    }

    // Hash password
    const password_hash = await hashPassword(password);

    // Create user
    const user = await User.create({
      email,
      password_hash,
      role: 'admin',
    });

    // Generate token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    return Response.json(
      {
        success: true,
        data: {
          userId: user._id,
          email: user.email,
          token,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Register error:', error);
    return Response.json(
      { success: false, error: 'Lỗi server nội bộ' },
      { status: 500 }
    );
  }
}
