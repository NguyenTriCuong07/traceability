const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI not found in .env.local');
    process.exit(1);
}

const LEGACY_PACKAGING_UNIT_MAP = {
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

const normalizePackagingUnit = (value) => {
    if (typeof value !== 'string') return '';
    const cleaned = value.replace(/\s+/g, ' ').trim();
    if (!cleaned) return '';
    return LEGACY_PACKAGING_UNIT_MAP[cleaned] || cleaned;
};

const productSchema = new mongoose.Schema(
    {
        origin: {
            region: { type: String, required: true },
        },
        updated_at: { type: Date, default: Date.now },
    },
    { strict: false, collection: 'products' }
);

const Product = mongoose.models.ProductMigration || mongoose.model('ProductMigration', productSchema);

async function normalizeLegacyPackagingUnits() {
    const dryRun = process.argv.includes('--dry-run');

    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✓ Kết nối MongoDB thành công');

        const products = await Product.find({}, { _id: 1, batch_code: 1, origin: 1 }).lean();

        let changedCount = 0;
        const updates = [];

        for (const product of products) {
            const original = product?.origin?.region;
            const normalized = normalizePackagingUnit(original);

            if (!original || !normalized || original === normalized) continue;

            changedCount += 1;
            updates.push({
                updateOne: {
                    filter: { _id: product._id },
                    update: {
                        $set: {
                            'origin.region': normalized,
                            updated_at: new Date(),
                        },
                    },
                },
            });

            console.log(`- ${product.batch_code || product._id}: "${original}" -> "${normalized}"`);
        }

        if (changedCount === 0) {
            console.log('ℹ️ Không có dữ liệu cũ cần chuẩn hóa.');
            await mongoose.disconnect();
            return;
        }

        if (dryRun) {
            console.log(`ℹ️ DRY RUN: phát hiện ${changedCount} bản ghi cần cập nhật, chưa ghi vào DB.`);
            await mongoose.disconnect();
            return;
        }

        const result = await Product.bulkWrite(updates, { ordered: false });

        console.log(`✓ Đã chuẩn hóa ${changedCount} bản ghi.`);
        console.log(`  matched: ${result.matchedCount || 0}`);
        console.log(`  modified: ${result.modifiedCount || 0}`);

        await mongoose.disconnect();
        console.log('✓ Đóng kết nối MongoDB');
    } catch (error) {
        console.error('❌ Lỗi chuẩn hóa dữ liệu:', error.message);
        process.exit(1);
    }
}

normalizeLegacyPackagingUnits();
