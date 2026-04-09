import { connectDB } from '@/lib/db/mongoose';
import { User } from '@/lib/db/models/User';
import { verifyVerificationToken } from '@/lib/auth-advanced';

export async function POST(request: Request) {
    try {
        await connectDB();

        const body = await request.json();
        const { token } = body;

        if (!token) {
            return Response.json(
                { success: false, error: 'Verification token không được cung cấp' },
                { status: 400 }
            );
        }

        // Verify token
        const decoded = verifyVerificationToken(token);
        if (!decoded) {
            return Response.json(
                { success: false, error: 'Verification token không hợp lệ hoặc đã hết hạn' },
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

        // Mark email as verified
        user.email_verified = true;
        user.email_verified_at = new Date();
        await user.save();

        return Response.json(
            {
                success: true,
                message: 'Email xác minh thành công!',
            },
            { status: 200 }
        );
    } catch (error: any) {
        console.error('Verify email error:', error);
        return Response.json(
            { success: false, error: 'Lỗi máy chủ nội bộ' },
            { status: 500 }
        );
    }
}
