import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { connectDB } from '@/lib/db/mongoose';
import { Product } from '@/lib/db/models/Product';
import { ScanLog } from '@/lib/db/models/ScanLog';
import ProductDetail from '@/components/ProductDetail';
import { normalizeProductImageUrl, toAbsoluteProductImageUrl } from '@/lib/product-image';

interface Props {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const requestHeaders = await headers();
    const forwardedProto = requestHeaders.get('x-forwarded-proto') || 'http';
    const forwardedHost = requestHeaders.get('x-forwarded-host') || requestHeaders.get('host') || 'localhost:3000';
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `${forwardedProto}://${forwardedHost}`;

    const { slug } = await params;
    await connectDB();
    const product = await Product.findOne({ slug: slug.toLowerCase() });
    const normalizedImageUrl = normalizeProductImageUrl(product?.image_url);
    const metadataImageUrl = normalizedImageUrl ? toAbsoluteProductImageUrl(normalizedImageUrl, baseUrl) : '';

    if (!product) {
      return {
        title: 'Không tìm thấy sản phẩm',
        description: 'Không tìm thấy thông tin của sản phẩm này.',
      };
    }

    return {
      title: `${product.name} - Truy xuất nguồn gốc`,
      description: `Xem thông tin nguồn gốc và truy xuất của ${product.name} từ ${product.origin.farm_name}.`,
      openGraph: {
        title: product.name,
        description: `Từ: ${product.origin.region}, ${product.origin.province}`,
        images: metadataImageUrl ? [{ url: metadataImageUrl }] : [],
      },
    };
  } catch (error) {
    return {
      title: 'Truy xuất nguồn gốc sản phẩm',
      description: 'Xem thông tin truy xuất nguồn gốc nông sản.',
    };
  }
}

export default async function ProductPage({ params }: Props) {
  try {
    const { slug } = await params;
    await connectDB();
    const product = await Product.findOne({ slug: slug.toLowerCase() });

    if (!product) {
      notFound();
    }

    // Check if expired
    if (product.expires_at && new Date(product.expires_at) < new Date()) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-destructive mb-4">Sản phẩm đã hết hạn</h1>
            <p className="text-muted-foreground">Sản phẩm này không còn khả dụng.</p>
          </div>
        </div>
      );
    }

    // Log visit (server-side)
    try {
      const requestHeaders = await headers();
      const purpose = requestHeaders.get('purpose') || requestHeaders.get('x-middleware-prefetch') || requestHeaders.get('next-router-prefetch');
      if (purpose === 'prefetch' || purpose === '1') {
        return <ProductDetail product={JSON.parse(JSON.stringify(product))} />;
      }

      const forwardedFor = requestHeaders.get('x-forwarded-for') || '';
      const ipAddress = forwardedFor.split(',')[0]?.trim() || requestHeaders.get('x-real-ip') || 'unknown';
      const userAgent = requestHeaders.get('user-agent') || 'unknown';

      product.view_count = (product.view_count || 0) + 1;
      product.last_viewed_at = new Date();
      await product.save();

      await ScanLog.create({
        product_id: product._id,
        slug: product.slug,
        event_type: 'visit',
        ip_address: ipAddress,
        device_user_agent: userAgent,
      });
    } catch (error) {
      console.error('Error logging visit:', error);
    }

    return <ProductDetail product={JSON.parse(JSON.stringify(product))} />;
  } catch (error) {
    console.error('Error loading product:', error);
    notFound();
  }
}
