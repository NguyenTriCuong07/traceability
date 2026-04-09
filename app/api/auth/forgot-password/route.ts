import { connectDB } from '@/lib/db/mongoose';
import { User } from '@/lib/db/models/User';
import { generateResetToken, sendPasswordResetEmail } from '@/lib/auth-advanced';
import { z } from 'zod';

const forgotPasswordSchema = z.object({
    email: z.string().email('Email không hợp lệ'),
});

export async function POST(request: Request) {
    try {
        await connectDB();

        const body = await request.json();
        const { email } = forgotPasswordSchema.parse(body);

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            // For security, don't reveal if email exists
            return Response.json(
                {
                    success: true,
                    message: 'Nếu tài khoản tồn tại, email đặt lại mật khẩu đã được gửi',
                },
                { status: 200 }
            );
        }

        // Generate reset token
        const resetToken = generateResetToken(email);

        // Send reset email
        const emailResult = await sendPasswordResetEmail(email, resetToken);

        return Response.json(
            {
                success: true,
                message: 'Email đặt lại mật khẩu đã được gửi',
                ...(process.env.NODE_ENV === 'development' && {
                    resetLink: emailResult.resetLink,
                }),
            },
            { status: 200 }
        );
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return Response.json(
                { success: false, error: error.errors[0].message },
                { status: 400 }
            );
        }

        console.error('Forgot password error:', error);
        return Response.json(
            { success: false, error: 'Lỗi máy chủ nội bộ' },
            { status: 500 }
        );
    }
}
