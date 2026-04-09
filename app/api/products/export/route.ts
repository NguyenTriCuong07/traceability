import { connectDB } from '@/lib/db/mongoose';
import { Product } from '@/lib/db/models/Product';
import { z } from 'zod';

const exportSchema = z.object({
    format: z.enum(['csv', 'json']),
});

function convertToCSV(products: any[]): string {
    if (products.length === 0) return '';

    // CSV headers
    const headers = [
        'ID',
        'Name',
        'Slug',
        'Batch Code',
        'Region',
        'Province',
        'District',
        'Farm Name',
        'Producer Name',
        'Planting Date',
        'Harvest Date',
        'Organic Certified',
        'Scan Count',
        'Created At',
    ];

    // CSV rows
    const rows = products.map(p => [
        p._id?.toString() || '',
        p.name || '',
        p.slug || '',
        p.batch_code || '',
        p.origin?.region || '',
        p.origin?.province || '',
        p.origin?.district || '',
        p.origin?.farm_name || '',
        p.origin?.producer_name || '',
        p.traceability?.planting_date?.toISOString().split('T')[0] || '',
        p.traceability?.harvest_date?.toISOString().split('T')[0] || '',
        p.traceability?.certification?.organic ? 'Yes' : 'No',
        p.scan_count || 0,
        p.created_at?.toISOString() || '',
    ]);

    // Escape CSV values and create CSV string
    const csvContent = [
        headers.map(h => `"${h}"`).join(','),
        ...rows.map(row => row.map(cell => {
            const stringCell = String(cell || '');
            return `"${stringCell.replace(/"/g, '""')}"`;
        }).join(',')),
    ].join('\n');

    return csvContent;
}

async function sendExportResponse(
    request: Request,
    products: any[],
    format: string
) {
    if (format === 'csv') {
        const csv = convertToCSV(products);
        return new Response(csv, {
            headers: {
                'Content-Type': 'text/csv; charset=utf-8',
                'Content-Disposition': `attachment; filename="products-export-${Date.now()}.csv"`,
            },
        });
    } else {
        const json = JSON.stringify(products, null, 2);
        return new Response(json, {
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Content-Disposition': `attachment; filename="products-export-${Date.now()}.json"`,
            },
        });
    }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const format = searchParams.get('format') || 'json';

        const validated = exportSchema.parse({ format });

        await connectDB();

        // Fetch all products
        const products = await Product.find().lean();

        return sendExportResponse(request, products, validated.format);
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return Response.json(
                { success: false, error: error.errors[0].message },
                { status: 400 }
            );
        }

        console.error('Export error:', error);
        return Response.json(
            { success: false, error: 'Lỗi máy chủ nội bộ' },
            { status: 500 }
        );
    }
}
