import { connectDB } from '@/lib/db/mongoose';
import { User } from '@/lib/db/models/User';
import { z } from 'zod';

const updateRoleSchema = z.object({
    userId: z.string().min(1, 'ID người dùng là bắt buộc'),
    role: z.enum(['admin', 'viewer'], {
        errorMap: () => ({ message: 'Role phải là admin hoặc viewer' }),
    }),
});

export async function GET(request: Request) {
    try {
        // Check authorization (only admin can access)
        const authHeader = request.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return Response.json(
                { success: false, error: 'Không được phép' },
                { status: 401 }
            );
        }

        await connectDB();

        // Get all users
        const users = await User.find({}, { password_hash: 0 }).lean();

        return Response.json(
            {
                success: true,
                data: users.map(u => ({
                    id: u._id,
                    email: u.email,
                    role: u.role,
                    created_at: u.created_at,
                    last_login: u.last_login,
                })),
            },
            { status: 200 }
        );
    } catch (error: any) {
        console.error('Users list error:', error);
        return Response.json(
            { success: false, error: 'Lỗi máy chủ nội bộ' },
            { status: 500 }
        );
    }
}

export async function PUT(request: Request) {
    try {
        // Check authorization
        const authHeader = request.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return Response.json(
                { success: false, error: 'Không được phép' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { userId, role } = updateRoleSchema.parse(body);

        await connectDB();

        // Update user role
        const user = await User.findByIdAndUpdate(userId, { role }, { new: true });

        if (!user) {
            return Response.json(
                { success: false, error: 'Người dùng không tìm thấy' },
                { status: 404 }
            );
        }

        return Response.json(
            {
                success: true,
                message: 'Role đã được cập nhật',
                data: {
                    id: user._id,
                    email: user.email,
                    role: user.role,
                },
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

        console.error('Update role error:', error);
        return Response.json(
            { success: false, error: 'Lỗi máy chủ nội bộ' },
            { status: 500 }
        );
    }
}
