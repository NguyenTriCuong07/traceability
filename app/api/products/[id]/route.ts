import { connectDB } from '@/lib/db/mongoose';
import { Product } from '@/lib/db/models/Product';
import { verifyToken, extractToken } from '@/lib/auth';
import { generateSlug, generateQRCode, buildProductTraceUrl } from '@/lib/qr';
import { z } from 'zod';
import { Types } from 'mongoose';

const parseableDateString = z.string().trim().refine((value) => !Number.isNaN(Date.parse(value)), {
  message: 'Định dạng ngày không hợp lệ',
});

const LEGACY_PACKAGING_UNIT_MAP: Record<string, string> = {
  'Đông Bắc Bộ': 'Công ty CP Bao Bì Nông Sản Bến Tre',
  'Tây Bắc Bộ': 'Công ty TNHH Đóng gói Nông sản Nam Bộ',
  'Đồng Bằng Sông Hồng': 'Công ty CP Chế biến và Đóng gói VinaFarm',
  'Bắc Trung Bộ': 'Công ty TNHH Sơ chế Nông sản Trà Vinh',
  'Duyên Hải Nam Trung Bộ': 'Trung tâm Đóng gói Nông sản Đồng Khởi',
  'Tây Nguyên': 'HTX Sơ chế và Đóng gói Cầu Kè',
  'Đông Nam Bộ': 'Công ty TNHH Đóng gói Mekong Green',
  'Đồng Bằng Sông Cửu Long': 'Công ty CP Bao Bì Nông Sản Bến Tre',
  'Nam Trung Bộ': 'Công ty CP Dịch vụ Hậu cần Nông nghiệp An Phú',
};

const normalizePackagingUnit = (value: string): string => {
  const cleaned = value.replace(/\s+/g, ' ').trim();
  if (!cleaned) return '';
  return LEGACY_PACKAGING_UNIT_MAP[cleaned] || cleaned;
};

const STATUS_MAP: Record<string, 'Đang lưu thông' | 'Đang sơ chế' | 'Đã bán hết'> = {
  'dang luu thong': 'Đang lưu thông',
  'dang so che': 'Đang sơ chế',
  'da ban het': 'Đã bán hết',
  'da tieu thu': 'Đã bán hết',
  'da dong goi': 'Đang sơ chế',
  'tam ngung': 'Đang sơ chế',
};

const normalizeLotStatusInput = (value?: unknown): 'Đang lưu thông' | 'Đang sơ chế' | 'Đã bán hết' | undefined => {
  if (typeof value !== 'string') return undefined;

  const cleaned = value.trim();
  if (!cleaned) return undefined;

  if (cleaned === 'Đang lưu thông' || cleaned === 'Đang sơ chế' || cleaned === 'Đã bán hết') {
    return cleaned;
  }

  const key = cleaned
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();

  return STATUS_MAP[key] || undefined;
};

const updateProductSchema = z.object({
  name: z.string().trim().min(1).optional(),
  batch_code: z.string().trim().min(1).optional(),
  description: z.string().optional(),
  image_url: z
    .string()
    .optional()
    .nullable()
    .refine((value) => !value || value.startsWith('/') || /^https?:\/\//.test(value), {
      message: 'URL hình ảnh không hợp lệ',
    }),
  origin: z.object({
    region: z.string().trim().min(1).optional(),
    province: z.string().trim().min(1).optional(),
    district: z.string().optional(),
    farm_name: z.string().trim().min(1).optional(),
    producer_name: z.string().trim().min(1).optional(),
    coordinates: z.object({ lat: z.coerce.number(), lng: z.coerce.number() }).optional(),
  }).optional(),
  traceability: z.object({
    status: z.string().optional(),
    planting_date: parseableDateString.optional(),
    harvest_date: parseableDateString.optional(),
    pesticides_used: z.array(z.string()).optional(),
    fertilizer_used: z.array(z.string()).optional(),
    certification: z.object({
      organic: z.boolean().optional(),
      certifier: z.string().optional(),
      cert_number: z.string().optional(),
      cert_expiry: parseableDateString.nullable().optional(),
    }).optional(),
  }).optional(),
});

function verifyAdmin(request: Request): boolean {
  const authHeader = request.headers.get('authorization');
  const token = extractToken(authHeader);
  if (!token) return false;

  const decoded = verifyToken(token);
  return decoded?.role === 'admin' || false;
}

type ProductRouteContext = {
  params: Promise<{ id: string }>;
};

// GET /api/products/[id]
export async function GET(request: Request, { params }: ProductRouteContext) {
  try {
    const { id } = await params;

    await connectDB();

    if (!Types.ObjectId.isValid(id)) {
      return Response.json(
        { success: false, error: 'ID sản phẩm không hợp lệ' },
        { status: 400 }
      );
    }

    const product = await Product.findById(id);
    if (!product) {
      return Response.json(
        { success: false, error: 'Sản phẩm không tồn tại' },
        { status: 404 }
      );
    }

    const qrCodeData = await generateQRCode(product.qr_code_url);

    return Response.json(
      {
        success: true,
        data: product,
        meta: {
          qr_code: qrCodeData,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get product error:', error);
    return Response.json(
      { success: false, error: 'Lỗi server nội bộ' },
      { status: 500 }
    );
  }
}

// PUT /api/products/[id]
export async function PUT(request: Request, { params }: ProductRouteContext) {
  try {
    const { id } = await params;

    if (!verifyAdmin(request)) {
      return Response.json(
        { success: false, error: 'Không có quyền truy cập' },
        { status: 401 }
      );
    }

    await connectDB();

    if (!Types.ObjectId.isValid(id)) {
      return Response.json(
        { success: false, error: 'ID sản phẩm không hợp lệ' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = updateProductSchema.parse(body);
    const normalizedStatus = normalizeLotStatusInput(validatedData.traceability?.status);
    const normalizedData = {
      ...validatedData,
      origin: validatedData.origin
        ? {
          ...validatedData.origin,
          ...(validatedData.origin.region
            ? { region: normalizePackagingUnit(validatedData.origin.region) }
            : {}),
        }
        : undefined,
      traceability: validatedData.traceability
        ? {
          ...validatedData.traceability,
          ...(typeof validatedData.traceability.status !== 'undefined'
            ? { status: normalizedStatus || 'Đang sơ chế' }
            : {}),
        }
        : undefined,
    };

    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return Response.json(
        { success: false, error: 'Sản phẩm không tồn tại' },
        { status: 404 }
      );
    }

    const updateData: any = {
      ...normalizedData,
      updated_at: new Date(),
    };

    if (validatedData.image_url === null) {
      updateData.image_url = undefined;
    }

    const shouldRegenerateSlug =
      typeof normalizedData.name !== 'undefined' || typeof normalizedData.batch_code !== 'undefined';

    if (shouldRegenerateSlug) {
      const nextName = normalizedData.name || existingProduct.name;
      const nextBatchCode = normalizedData.batch_code || existingProduct.batch_code;
      const newSlug = generateSlug(nextName, nextBatchCode);

      if (newSlug !== existingProduct.slug) {
        const duplicateSlug = await Product.findOne({ slug: newSlug, _id: { $ne: id } });
        if (duplicateSlug) {
          return Response.json(
            { success: false, error: 'Sản phẩm có tên và mã lô này đã tồn tại' },
            { status: 400 }
          );
        }

        updateData.slug = newSlug;
        updateData.qr_code_url = buildProductTraceUrl(newSlug);
      }
    }

    if (normalizedData.traceability?.planting_date) {
      updateData.traceability.planting_date = new Date(normalizedData.traceability.planting_date);
    }
    if (normalizedData.traceability?.harvest_date) {
      updateData.traceability.harvest_date = new Date(normalizedData.traceability.harvest_date);
    }

    if (normalizedData.traceability?.certification && 'cert_expiry' in normalizedData.traceability.certification) {
      const certExpiry = normalizedData.traceability.certification.cert_expiry;
      updateData.traceability = updateData.traceability || {};
      updateData.traceability.certification = updateData.traceability.certification || {};
      updateData.traceability.certification.cert_expiry = certExpiry ? new Date(certExpiry) : undefined;
    }

    const product = await Product.findByIdAndUpdate(id, updateData, { new: true });
    const qrCodeData = product ? await generateQRCode(product.qr_code_url) : null;

    return Response.json(
      {
        success: true,
        data: product,
        meta: {
          qr_code: qrCodeData,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        {
          success: false,
          error: error.errors[0]?.message || 'Dữ liệu không hợp lệ',
          details: error.errors.map((issue) => `${issue.path.join('.')}: ${issue.message}`),
        },
        { status: 400 }
      );
    }

    console.error('Update product error:', error);
    return Response.json(
      { success: false, error: 'Lỗi server nội bộ' },
      { status: 500 }
    );
  }
}

// DELETE /api/products/[id]
export async function DELETE(request: Request, { params }: ProductRouteContext) {
  try {
    const { id } = await params;

    if (!verifyAdmin(request)) {
      return Response.json(
        { success: false, error: 'Không có quyền truy cập' },
        { status: 401 }
      );
    }

    await connectDB();

    if (!Types.ObjectId.isValid(id)) {
      return Response.json(
        { success: false, error: 'ID sản phẩm không hợp lệ' },
        { status: 400 }
      );
    }

    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return Response.json(
        { success: false, error: 'Sản phẩm không tồn tại' },
        { status: 404 }
      );
    }

    return Response.json(
      { success: true, data: { message: 'Đã xóa sản phẩm thành công' } },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete product error:', error);
    return Response.json(
      { success: false, error: 'Lỗi server nội bộ' },
      { status: 500 }
    );
  }
}
