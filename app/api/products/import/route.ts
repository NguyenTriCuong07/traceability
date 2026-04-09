import { connectDB } from '@/lib/db/mongoose';
import { Product } from '@/lib/db/models/Product';
import { generateSlug, buildProductTraceUrl } from '@/lib/qr';
import { generateProductToken } from '@/lib/auth';

async function parseCSV(text: string): Promise<any[]> {
    const lines = text.trim().split('\n');
    if (lines.length < 2) throw new Error('CSV phải chứa ít nhất một dòng dữ liệu');

    const headers = lines[0]
        .split(',')
        .map(h => h.trim().toLowerCase().replace(/"/g, ''));

    const products = [];

    for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split(',').map(cell => cell.trim().replace(/"/g, ''));
        const product: any = {};

        headers.forEach((header, index) => {
            const value = row[index];
            if (header === 'name') product.name = value;
            else if (header === 'batch_code' || header === 'batch code')
                product.batch_code = value;
            else if (header === 'region') {
                if (!product.origin) product.origin = {};
                product.origin.region = value;
            } else if (header === 'province') {
                if (!product.origin) product.origin = {};
                product.origin.province = value;
            } else if (header === 'district') {
                if (!product.origin) product.origin = {};
                product.origin.district = value;
            } else if (header === 'farm_name' || header === 'farm name') {
                if (!product.origin) product.origin = {};
                product.origin.farm_name = value;
            } else if (header === 'producer_name' || header === 'producer name') {
                if (!product.origin) product.origin = {};
                product.origin.producer_name = value;
            } else if (header === 'planting_date' || header === 'planting date') {
                if (!product.traceability) product.traceability = {};
                product.traceability.planting_date = new Date(value);
            } else if (header === 'harvest_date' || header === 'harvest date') {
                if (!product.traceability) product.traceability = {};
                product.traceability.harvest_date = new Date(value);
            }
        });

        if (product.name && product.batch_code) {
            products.push(product);
        }
    }

    return products;
}

export async function POST(request: Request) {
    try {
        await connectDB();

        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return Response.json(
                { success: false, error: 'Không có file được cung cấp' },
                { status: 400 }
            );
        }

        if (!file.name.endsWith('.csv')) {
            return Response.json(
                { success: false, error: 'Chỉ chấp nhận file CSV' },
                { status: 400 }
            );
        }

        const csvText = await file.text();
        const products = await parseCSV(csvText);

        if (products.length === 0) {
            return Response.json(
                { success: false, error: 'CSV không chứa dữ liệu hợp lệ' },
                { status: 400 }
            );
        }

        // Import products
        const importedProducts = [];
        let successCount = 0;
        let errorCount = 0;

        for (const productData of products) {
            try {
                // Generate slug
                const slug = generateSlug(productData.name, productData.batch_code);
                const qrUrl = buildProductTraceUrl(slug);

                const uniqueToken = generateProductToken(slug, Date.now());

                // Create product
                const product = new Product({
                    ...productData,
                    slug,
                    qr_code_url: qrUrl,
                    unique_token: uniqueToken,
                    view_count: 0,
                    scan_count: 0,
                });

                await product.save();
                importedProducts.push(product);
                successCount++;
            } catch (error: any) {
                console.error('Error importing product:', error);
                errorCount++;
            }
        }

        return Response.json(
            {
                success: true,
                message: `Import hoàn thành: ${successCount} thành công, ${errorCount} lỗi`,
                data: {
                    successCount,
                    errorCount,
                    importedProducts: importedProducts.map(p => ({
                        id: p._id,
                        name: p.name,
                        slug: p.slug,
                    })),
                },
            },
            { status: 200 }
        );
    } catch (error: any) {
        console.error('Import error:', error);
        return Response.json(
            { success: false, error: 'Lỗi máy chủ nội bộ: ' + error.message },
            { status: 500 }
        );
    }
}
