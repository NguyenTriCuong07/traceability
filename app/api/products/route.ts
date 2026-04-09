import { connectDB } from '@/lib/db/mongoose';
import { Product } from '@/lib/db/models/Product';
import { verifyToken, extractToken, generateProductToken } from '@/lib/auth';
import { generateSlug, generateQRCode, buildProductTraceUrl } from '@/lib/qr';
import { z } from 'zod';

const parseableDateString = z.string().trim().refine((value) => !Number.isNaN(Date.parse(value)), {
  message: 'Định dạng ngày không hợp lệ',
});

const toUtcDateOnlyTimestamp = (value: string | Date): number => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return Number.NaN;
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
};

const validateProductDateTimeline = ({
  packagingDate,
  harvestDate,
  expiryDate,
}: {
  packagingDate: string;
  harvestDate: string;
  expiryDate?: string;
}): string | null => {
  const packagingTs = toUtcDateOnlyTimestamp(packagingDate);
  const harvestTs = toUtcDateOnlyTimestamp(harvestDate);

  if (Number.isNaN(packagingTs) || Number.isNaN(harvestTs)) {
    return 'Ngày thu hoạch hoặc ngày đóng gói không hợp lệ';
  }

  const now = new Date();
  const todayTs = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());

  if (harvestTs > todayTs) {
    return 'Ngày thu hoạch không thể ở tương lai';
  }

  if (packagingTs > todayTs) {
    return 'Ngày đóng gói không thể ở tương lai';
  }

  if (harvestTs > packagingTs) {
    return 'Ngày thu hoạch phải trước hoặc bằng ngày đóng gói';
  }

  if (expiryDate) {
    const expiryTs = toUtcDateOnlyTimestamp(expiryDate);
    if (Number.isNaN(expiryTs)) {
      return 'Hạn sử dụng không hợp lệ';
    }

    if (packagingTs > expiryTs) {
      return 'Ngày đóng gói phải trước hoặc bằng hạn sử dụng';
    }
  }

  return null;
};

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

const productSchema = z.object({
  name: z.string().trim().min(1, 'Tên sản phẩm là bắt buộc'),
  batch_code: z.string().trim().min(1, 'Mã lô là bắt buộc'),
  description: z.string().optional(),
  image_url: z
    .string()
    .optional()
    .refine((value) => !value || value.startsWith('/') || /^https?:\/\//.test(value), {
      message: 'URL hình ảnh không hợp lệ',
    }),
  origin: z.object({
    region: z.string().trim().min(1, 'Vùng là bắt buộc'),
    province: z.string().trim().min(1, 'Tỉnh là bắt buộc'),
    district: z.string().optional(),
    farm_name: z.string().trim().min(1, 'Tên nông trại là bắt buộc'),
    producer_name: z.string().trim().min(1, 'Tên nhà sản xuất là bắt buộc'),
    coordinates: z.object({ lat: z.coerce.number(), lng: z.coerce.number() }).optional(),
  }),
  traceability: z.object({
    status: z.string().optional(),
    planting_date: parseableDateString,
    harvest_date: parseableDateString,
    pesticides_used: z.array(z.string()).optional(),
    fertilizer_used: z.array(z.string()).optional(),
    certification: z.object({
      organic: z.boolean().optional(),
      certifier: z.string().optional(),
      cert_number: z.string().optional(),
      cert_expiry: parseableDateString.optional(),
    }),
  }),
});

// Middleware to verify admin
function verifyAdmin(request: Request): boolean {
  const authHeader = request.headers.get('authorization');
  const token = extractToken(authHeader);
  if (!token) return false;

  const decoded = verifyToken(token);
  if (!decoded || decoded.role !== 'admin') return false;

  return true;
}

// GET /api/products - List all products
export async function GET(request: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';

    const skip = (page - 1) * limit;

    const query = search
      ? { $or: [{ name: { $regex: search, $options: 'i' } }, { batch_code: { $regex: search, $options: 'i' } }] }
      : {};

    const products = await Product.find(query).skip(skip).limit(limit).sort({ created_at: -1 });
    const total = await Product.countDocuments(query);

    return Response.json(
      {
        success: true,
        data: {
          products,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get products error:', error);
    return Response.json(
      { success: false, error: 'Lỗi server nội bộ' },
      { status: 500 }
    );
  }
}

// POST /api/products - Create product (admin only)
export async function POST(request: Request) {
  try {
    if (!verifyAdmin(request)) {
      return Response.json(
        { success: false, error: 'Không có quyền truy cập' },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await request.json();
    const validatedData = productSchema.parse(body);
    const dateValidationError = validateProductDateTimeline({
      packagingDate: validatedData.traceability.planting_date,
      harvestDate: validatedData.traceability.harvest_date,
      expiryDate: validatedData.traceability.certification.cert_expiry,
    });

    if (dateValidationError) {
      return Response.json(
        { success: false, error: dateValidationError },
        { status: 400 }
      );
    }

    const normalizedStatus = normalizeLotStatusInput(validatedData.traceability.status);
    const normalizedOrigin = {
      ...validatedData.origin,
      region: normalizePackagingUnit(validatedData.origin.region),
    };

    // Generate slug
    const slug = generateSlug(validatedData.name, validatedData.batch_code);

    // Check if slug already exists
    const existingProduct = await Product.findOne({ slug });
    if (existingProduct) {
      return Response.json(
        { success: false, error: 'Sản phẩm có tên và mã lô này đã tồn tại' },
        { status: 400 }
      );
    }

    // Generate QR token
    const timestamp = Date.now();
    const unique_token = generateProductToken(slug, timestamp);

    // Generate QR code
    const qrUrl = buildProductTraceUrl(slug);
    const qrCodeData = await generateQRCode(qrUrl);

    // Create product
    const product = await Product.create({
      name: validatedData.name,
      slug,
      batch_code: validatedData.batch_code,
      description: validatedData.description,
      image_url: validatedData.image_url,
      origin: normalizedOrigin,
      traceability: {
        status: normalizedStatus || 'Đang sơ chế',
        planting_date: new Date(validatedData.traceability.planting_date),
        harvest_date: new Date(validatedData.traceability.harvest_date),
        pesticides_used: validatedData.traceability.pesticides_used,
        fertilizer_used: validatedData.traceability.fertilizer_used,
        certification: {
          organic: validatedData.traceability.certification.organic || false,
          certifier: validatedData.traceability.certification.certifier,
          cert_number: validatedData.traceability.certification.cert_number,
          cert_expiry: validatedData.traceability.certification.cert_expiry
            ? new Date(validatedData.traceability.certification.cert_expiry)
            : undefined,
        },
      },
      qr_code_url: qrUrl,
      unique_token,
      view_count: 0,
      scan_count: 0,
    });

    return Response.json(
      {
        success: true,
        data: {
          product,
          qr_code: qrCodeData,
        },
      },
      { status: 201 }
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

    console.error('Create product error:', error);
    return Response.json(
      { success: false, error: 'Lỗi server nội bộ' },
      { status: 500 }
    );
  }
}
