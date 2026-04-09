import { connectDB } from '@/lib/db/mongoose';
import { User } from '@/lib/db/models/User';
import { comparePassword, generateToken } from '@/lib/auth';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu là bắt buộc'),
});

export async function POST(request: Request) {
  try {
    await connectDB();

    const body = await request.json();
    const { email, password } = loginSchema.parse(body);

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return Response.json(
        { success: false, error: 'Email hoặc mật khẩu không hợp lệ' },
        { status: 401 }
      );
    }

    // Compare password
    const isPasswordValid = await comparePassword(password, user.password_hash);
    if (!isPasswordValid) {
      return Response.json(
        { success: false, error: 'Email hoặc mật khẩu không hợp lệ' },
        { status: 401 }
      );
    }

    // Update last login
    user.last_login = new Date();
    await user.save();

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
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Login error:', error);
    return Response.json(
      { success: false, error: 'Lỗi server nội bộ' },
      { status: 500 }
    );
  }
}
