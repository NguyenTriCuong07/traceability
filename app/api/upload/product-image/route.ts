import { extractToken, verifyToken } from '@/lib/auth';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

function verifyAdmin(request: Request): boolean {
    const authHeader = request.headers.get('authorization');
    const token = extractToken(authHeader);
    if (!token) return false;

    const decoded = verifyToken(token);
    return decoded?.role === 'admin' || false;
}

function getExtensionFromMimeType(mimeType: string): string {
    switch (mimeType) {
        case 'image/jpeg':
            return '.jpg';
        case 'image/png':
            return '.png';
        case 'image/webp':
            return '.webp';
        case 'image/gif':
            return '.gif';
        default:
            return '';
    }
}

export async function POST(request: Request) {
    try {
        if (!verifyAdmin(request)) {
            return Response.json(
                { success: false, error: 'Không có quyền truy cập' },
                { status: 401 }
            );
        }

        const formData = await request.formData();
        const image = formData.get('image');

        if (!(image instanceof File)) {
            return Response.json(
                { success: false, error: 'Vui lòng chọn file ảnh' },
                { status: 400 }
            );
        }

        if (!ALLOWED_MIME_TYPES.has(image.type)) {
            return Response.json(
                { success: false, error: 'Định dạng ảnh không hỗ trợ' },
                { status: 400 }
            );
        }

        if (image.size > MAX_FILE_SIZE) {
            return Response.json(
                { success: false, error: 'Ảnh vượt quá 5MB' },
                { status: 400 }
            );
        }

        const extension = getExtensionFromMimeType(image.type);
        const fileName = `${Date.now()}-${crypto.randomUUID()}${extension}`;
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'products');
        const filePath = path.join(uploadDir, fileName);

        await mkdir(uploadDir, { recursive: true });

        const bytes = await image.arrayBuffer();
        await writeFile(filePath, Buffer.from(bytes));

        const imageUrl = `/uploads/products/${fileName}`;

        return Response.json(
            {
                success: true,
                data: {
                    image_url: imageUrl,
                },
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Upload product image error:', error);
        return Response.json(
            { success: false, error: 'Lỗi server nội bộ' },
            { status: 500 }
        );
    }
}
