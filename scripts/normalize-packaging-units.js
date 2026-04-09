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

const PACKAGING_UNIT_COORDINATES = {
    'Công ty TNHH Đóng gói Mekong Green': { lat: 10.045161, lng: 105.746857 },
    'Công ty CP Bao Bì Nông Sản Bến Tre': { lat: 10.243355, lng: 106.375551 },
    'Công ty TNHH Sơ chế Nông sản Trà Vinh': { lat: 9.951331, lng: 106.33461 },
    'Công ty CP Chế biến và Đóng gói VinaFarm': { lat: 20.852571, lng: 106.016997 },
    'Công ty TNHH Đóng gói Nông sản Nam Bộ': { lat: 10.695572, lng: 106.243122 },
    'Công ty CP Dịch vụ Hậu cần Nông nghiệp An Phú': { lat: 10.53592, lng: 107.242998 },
    'HTX Sơ chế và Đóng gói Cầu Kè': { lat: 9.867622, lng: 106.086487 },
    'Trung tâm Đóng gói Nông sản Đồng Khởi': { lat: 10.241987, lng: 106.376754 },
};

const isValidCoordinatePair = (coordinates) => {
    const lat = Number(coordinates?.lat);
    const lng = Number(coordinates?.lng);

    return Number.isFinite(lat) && Number.isFinite(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
};

const areCoordinatesEqual = (left, right) => {
    if (!left || !right) return false;
    return Number(left.lat) === Number(right.lat) && Number(left.lng) === Number(right.lng);
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
    const coordinatesOnly = process.argv.includes('--coordinates-only');

    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✓ Kết nối MongoDB thành công');

        const products = await Product.find({}, { _id: 1, batch_code: 1, origin: 1 }).lean();

        let changedCount = 0;
        let regionChangedCount = 0;
        let coordinateChangedCount = 0;
        const updates = [];

        for (const product of products) {
            const original = product?.origin?.region;
            const normalizedRegion = normalizePackagingUnit(original);
            const mappedCoordinates = PACKAGING_UNIT_COORDINATES[normalizedRegion];
            const existingCoordinates = product?.origin?.coordinates;
            const nextSet = {};

            if (!coordinatesOnly && original && normalizedRegion && original !== normalizedRegion) {
                nextSet['origin.region'] = normalizedRegion;
            }

            if (mappedCoordinates && !areCoordinatesEqual(existingCoordinates, mappedCoordinates)) {
                const hasInvalidCoordinates = !!existingCoordinates && !isValidCoordinatePair(existingCoordinates);
                const hasMissingCoordinates = !existingCoordinates;
                const shouldUpdateCoordinates = hasMissingCoordinates || hasInvalidCoordinates || !areCoordinatesEqual(existingCoordinates, mappedCoordinates);

                if (shouldUpdateCoordinates) {
                    nextSet['origin.coordinates'] = mappedCoordinates;
                }
            }

            if (Object.keys(nextSet).length === 0) continue;

            const nextRegion = nextSet['origin.region'];
            const nextCoordinates = nextSet['origin.coordinates'];

            if (nextRegion) regionChangedCount += 1;
            if (nextCoordinates) coordinateChangedCount += 1;
            changedCount += 1;

            updates.push({
                updateOne: {
                    filter: { _id: product._id },
                    update: {
                        $set: {
                            ...nextSet,
                            updated_at: new Date(),
                        },
                    },
                },
            });

            const logParts = [];
            if (nextRegion) {
                logParts.push(`vùng: "${original}" -> "${normalizedRegion}"`);
            }
            if (nextCoordinates) {
                logParts.push(`tọa độ -> (${nextCoordinates.lat}, ${nextCoordinates.lng})`);
            }

            console.log(`- ${product.batch_code || product._id}: ${logParts.join(' | ')}`);
        }

        if (changedCount === 0) {
            console.log('ℹ️ Không có dữ liệu cũ cần chuẩn hóa.');
            await mongoose.disconnect();
            return;
        }

        if (dryRun) {
            console.log(`ℹ️ DRY RUN: phát hiện ${changedCount} bản ghi cần cập nhật, chưa ghi vào DB.`);
            console.log(`  thay đổi đơn vị đóng gói: ${regionChangedCount}`);
            console.log(`  thay đổi tọa độ: ${coordinateChangedCount}`);
            await mongoose.disconnect();
            return;
        }

        const result = await Product.bulkWrite(updates, { ordered: false });

        console.log(`✓ Đã chuẩn hóa ${changedCount} bản ghi.`);
        console.log(`  thay đổi đơn vị đóng gói: ${regionChangedCount}`);
        console.log(`  thay đổi tọa độ: ${coordinateChangedCount}`);
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
