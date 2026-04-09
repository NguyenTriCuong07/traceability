import { connectDB } from '@/lib/db/mongoose';
import { User } from '@/lib/db/models/User';
import { verifyResetToken } from '@/lib/auth-advanced';
import { hashPassword } from '@/lib/auth';
import { z } from 'zod';

const resetPasswordSchema = z.object({
    token: z.string().min(1, 'Token đặt lại mật khẩu là bắt buộc'),
    newPassword: z
        .string()
        .min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
    confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
});

export async function POST(request: Request) {
    try {
        await connectDB();

        const body = await request.json();
        const { token, newPassword, confirmPassword } = resetPasswordSchema.parse(body);

        // Verify reset token
        const decoded = verifyResetToken(token);
        if (!decoded) {
            return Response.json(
                { success: false, error: 'Reset token không hợp lệ hoặc đã hết hạn' },
                { status: 400 }
            );
        }

        // Find user
        const user = await User.findOne({ email: decoded.email });
        if (!user) {
            return Response.json(
                { success: false, error: 'Người dùng không tìm thấy' },
                { status: 404 }
            );
        }

        // Hash new password
        const hashedPassword = await hashPassword(newPassword);

        // Update password
        user.password_hash = hashedPassword;
        await user.save();

        return Response.json(
            {
                success: true,
                message: 'Mật khẩu đã được đặt lại thành công. Vui lòng đăng nhập.',
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

        console.error('Reset password error:', error);
        return Response.json(
            { success: false, error: 'Lỗi máy chủ nội bộ' },
            { status: 500 }
        );
    }
}
