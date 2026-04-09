import { connectDB } from '@/lib/db/mongoose';
import { Product } from '@/lib/db/models/Product';
import { ScanLog } from '@/lib/db/models/ScanLog';
import { extractToken, verifyToken } from '@/lib/auth';

function verifyAdmin(request: Request): boolean {
    const authHeader = request.headers.get('authorization');
    const token = extractToken(authHeader);
    if (!token) return false;

    const decoded = verifyToken(token);
    return decoded?.role === 'admin' || false;
}

export async function POST(request: Request) {
    try {
        if (!verifyAdmin(request)) {
            return Response.json(
                { success: false, error: 'Không có quyền truy cập' },
                { status: 401 }
            );
        }

        await connectDB();

        const [products, scanAgg, visitAgg, lastScanAgg, lastVisitAgg] = await Promise.all([
            Product.find({}).select('_id').lean(),
            ScanLog.aggregate([
                {
                    $match: {
                        $or: [{ event_type: 'scan' }, { event_type: { $exists: false } }],
                    },
                },
                { $group: { _id: '$product_id', count: { $sum: 1 } } },
            ]),
            ScanLog.aggregate([
                { $match: { event_type: 'visit' } },
                { $group: { _id: '$product_id', count: { $sum: 1 } } },
            ]),
            ScanLog.aggregate([
                {
                    $match: {
                        $or: [{ event_type: 'scan' }, { event_type: { $exists: false } }],
                    },
                },
                { $group: { _id: '$product_id', last_scanned_at: { $max: '$scanned_at' } } },
            ]),
            ScanLog.aggregate([
                { $match: { event_type: 'visit' } },
                { $group: { _id: '$product_id', last_viewed_at: { $max: '$scanned_at' } } },
            ]),
        ]);

        const scanMap = new Map<string, { count: number }>(
            scanAgg.map((item) => [String(item._id), { count: item.count || 0 }])
        );
        const visitMap = new Map<string, { count: number }>(
            visitAgg.map((item) => [String(item._id), { count: item.count || 0 }])
        );
        const lastScanMap = new Map<string, { last_scanned_at: Date }>(
            lastScanAgg.map((item) => [String(item._id), { last_scanned_at: item.last_scanned_at }])
        );
        const lastVisitMap = new Map<string, { last_viewed_at: Date }>(
            lastVisitAgg.map((item) => [String(item._id), { last_viewed_at: item.last_viewed_at }])
        );

        const updates = products.map((product) => {
            const key = String(product._id);
            return {
                updateOne: {
                    filter: { _id: product._id },
                    update: {
                        $set: {
                            scan_count: scanMap.get(key)?.count || 0,
                            view_count: visitMap.get(key)?.count || 0,
                            last_scanned_at: lastScanMap.get(key)?.last_scanned_at || null,
                            last_viewed_at: lastVisitMap.get(key)?.last_viewed_at || null,
                            updated_at: new Date(),
                        },
                    },
                },
            };
        });

        if (updates.length === 0) {
            return Response.json(
                {
                    success: true,
                    data: {
                        updated_products: 0,
                        matched: 0,
                        modified: 0,
                        total_scans: 0,
                        total_visits: 0,
                        synced_at: new Date().toISOString(),
                    },
                },
                { status: 200 }
            );
        }

        const result = await Product.bulkWrite(updates, { ordered: false });

        const totalScans = scanAgg.reduce((sum, item) => sum + (item.count || 0), 0);
        const totalVisits = visitAgg.reduce((sum, item) => sum + (item.count || 0), 0);

        return Response.json(
            {
                success: true,
                data: {
                    updated_products: updates.length,
                    matched: result.matchedCount || 0,
                    modified: result.modifiedCount || 0,
                    total_scans: totalScans,
                    total_visits: totalVisits,
                    synced_at: new Date().toISOString(),
                },
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Sync analytics counters error:', error);
        return Response.json(
            { success: false, error: 'Lỗi server nội bộ' },
            { status: 500 }
        );
    }
}
