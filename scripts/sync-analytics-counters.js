const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI not found in .env.local');
    process.exit(1);
}

const productSchema = new mongoose.Schema(
    {
        scan_count: { type: Number, default: 0 },
        view_count: { type: Number, default: 0 },
        last_scanned_at: { type: Date, default: null },
        last_viewed_at: { type: Date, default: null },
        updated_at: { type: Date, default: Date.now },
    },
    { strict: false, collection: 'products' }
);

const scanLogSchema = new mongoose.Schema(
    {
        product_id: { type: mongoose.Schema.Types.ObjectId, required: true },
        event_type: { type: String, enum: ['visit', 'scan'], default: 'scan' },
        scanned_at: { type: Date, default: Date.now },
    },
    { strict: false, collection: 'scanlogs' }
);

const Product = mongoose.models.ProductCounterSync || mongoose.model('ProductCounterSync', productSchema);
const ScanLog = mongoose.models.ScanLogCounterSync || mongoose.model('ScanLogCounterSync', scanLogSchema);

function toObjectIdMap(docs) {
    const map = new Map();
    for (const doc of docs) {
        map.set(String(doc._id), doc);
    }
    return map;
}

async function syncAnalyticsCounters() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✓ Kết nối MongoDB thành công');

        const [products, scanAgg, visitAgg, lastScanAgg, lastVisitAgg] = await Promise.all([
            Product.find({}, { _id: 1 }).lean(),
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

        const scanMap = toObjectIdMap(scanAgg);
        const visitMap = toObjectIdMap(visitAgg);
        const lastScanMap = toObjectIdMap(lastScanAgg);
        const lastVisitMap = toObjectIdMap(lastVisitAgg);

        const updates = products.map((product) => {
            const key = String(product._id);
            const scanInfo = scanMap.get(key);
            const visitInfo = visitMap.get(key);
            const lastScanInfo = lastScanMap.get(key);
            const lastVisitInfo = lastVisitMap.get(key);

            return {
                updateOne: {
                    filter: { _id: product._id },
                    update: {
                        $set: {
                            scan_count: scanInfo?.count || 0,
                            view_count: visitInfo?.count || 0,
                            last_scanned_at: lastScanInfo?.last_scanned_at || null,
                            last_viewed_at: lastVisitInfo?.last_viewed_at || null,
                            updated_at: new Date(),
                        },
                    },
                },
            };
        });

        if (updates.length === 0) {
            console.log('ℹ️ Không có sản phẩm nào để đồng bộ.');
            await mongoose.disconnect();
            return;
        }

        const result = await Product.bulkWrite(updates, { ordered: false });

        const totalScans = scanAgg.reduce((sum, item) => sum + (item.count || 0), 0);
        const totalVisits = visitAgg.reduce((sum, item) => sum + (item.count || 0), 0);

        console.log(`✓ Đã đồng bộ ${updates.length} sản phẩm.`);
        console.log(`  matched: ${result.matchedCount || 0}`);
        console.log(`  modified: ${result.modifiedCount || 0}`);
        console.log(`  tổng lượt quét: ${totalScans}`);
        console.log(`  tổng lượt truy cập: ${totalVisits}`);

        await mongoose.disconnect();
        console.log('✓ Đóng kết nối MongoDB');
    } catch (error) {
        console.error('❌ Lỗi đồng bộ analytics:', error.message);
        process.exit(1);
    }
}

syncAnalyticsCounters();