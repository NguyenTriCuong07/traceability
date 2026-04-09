import { connectDB } from '@/lib/db/mongoose';
import { Product } from '@/lib/db/models/Product';
import { ScanLog } from '@/lib/db/models/ScanLog';

type ProductSlugRouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(request: Request, { params }: ProductSlugRouteContext) {
  try {
    await connectDB();

    const { slug: rawSlug } = await params;
    const slug = rawSlug.toLowerCase();

    const product = await Product.findOne({ slug });
    if (!product) {
      return Response.json(
        { success: false, error: 'Sản phẩm không tồn tại' },
        { status: 404 }
      );
    }

    // Check if product is expired
    if (product.expires_at && new Date(product.expires_at) < new Date()) {
      return Response.json(
        { success: false, error: 'Sản phẩm đã hết hạn' },
        { status: 410 }
      );
    }

    return Response.json(
      { success: true, data: product },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get product by slug error:', error);
    return Response.json(
      { success: false, error: 'Lỗi server nội bộ' },
      { status: 500 }
    );
  }
}

// POST - Log scan
export async function POST(request: Request, { params }: ProductSlugRouteContext) {
  try {
    await connectDB();

    const { slug: rawSlug } = await params;
    const slug = rawSlug.toLowerCase();
    let body: { country?: string; city?: string } = {};
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const product = await Product.findOne({ slug });
    if (!product) {
      return Response.json(
        { success: false, error: 'Sản phẩm không tìm thấy' },
        { status: 404 }
      );
    }

    // Increment scan count
    product.scan_count += 1;
    product.last_scanned_at = new Date();
    await product.save();

    // Log the scan
    const forwardedFor = request.headers.get('x-forwarded-for') || '';
    const ipAddress = forwardedFor.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';

    const userAgent = request.headers.get('user-agent') || 'unknown';

    await ScanLog.create({
      product_id: product._id,
      slug,
      event_type: 'scan',
      ip_address: ipAddress,
      device_user_agent: userAgent,
      country: body.country,
      city: body.city,
    });

    return Response.json(
      { success: true, data: { scanned: true, scan_count: product.scan_count } },
      { status: 200 }
    );
  } catch (error) {
    console.error('Log scan error:', error);
    return Response.json(
      { success: false, error: 'Lỗi server nội bộ' },
      { status: 500 }
    );
  }
}
