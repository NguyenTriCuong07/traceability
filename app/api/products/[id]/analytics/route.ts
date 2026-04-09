import { connectDB } from '@/lib/db/mongoose';
import { Product } from '@/lib/db/models/Product';
import { ScanLog } from '@/lib/db/models/ScanLog';
import { verifyToken, extractToken } from '@/lib/auth';
import { Types } from 'mongoose';

type AnalyticsRouteContext = {
  params: Promise<{ id: string }>;
};

type Timeframe = '7d' | '30d' | '90d';
type Granularity = 'day' | 'hour';

const DAY_IN_MS = 24 * 60 * 60 * 1000;

function getRangeStart(now: Date, timeframe: Timeframe): Date {
  const days = timeframe === '7d' ? 7 : timeframe === '90d' ? 90 : 30;
  return new Date(now.getTime() - days * DAY_IN_MS);
}

function getBucketKey(date: Date, granularity: Granularity): string {
  if (granularity === 'hour') {
    return `${date.toISOString().slice(0, 13)}:00`;
  }
  return date.toISOString().slice(0, 10);
}

function getBucketLabel(date: Date, granularity: Granularity): string {
  return granularity === 'hour'
    ? new Intl.DateTimeFormat('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
    }).format(date)
    : new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit' }).format(date);
}

function buildBuckets(startDate: Date, endDate: Date, granularity: Granularity) {
  const buckets: Array<{ key: string; label: string; date: Date }> = [];
  const cursor = new Date(startDate);

  if (granularity === 'hour') {
    cursor.setMinutes(0, 0, 0);
    while (cursor <= endDate) {
      buckets.push({
        key: getBucketKey(cursor, granularity),
        label: getBucketLabel(cursor, granularity),
        date: new Date(cursor),
      });
      cursor.setHours(cursor.getHours() + 1);
    }
  } else {
    cursor.setHours(0, 0, 0, 0);
    while (cursor <= endDate) {
      buckets.push({
        key: getBucketKey(cursor, granularity),
        label: getBucketLabel(cursor, granularity),
        date: new Date(cursor),
      });
      cursor.setDate(cursor.getDate() + 1);
    }
  }

  return buckets;
}

function verifyAdmin(request: Request): boolean {
  const authHeader = request.headers.get('authorization');
  const token = extractToken(authHeader);
  if (!token) return false;

  const decoded = verifyToken(token);
  return decoded?.role === 'admin' || false;
}

export async function GET(request: Request, { params }: AnalyticsRouteContext) {
  try {
    if (!verifyAdmin(request)) {
      return Response.json(
        { success: false, error: 'Không có quyền truy cập' },
        { status: 401 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const timeframe = (searchParams.get('timeframe') || '30d') as Timeframe;
    const granularity = (searchParams.get('granularity') || 'day') as Granularity;

    const safeTimeframe: Timeframe = ['7d', '30d', '90d'].includes(timeframe) ? timeframe : '30d';
    const safeGranularity: Granularity = ['day', 'hour'].includes(granularity) ? granularity : 'day';

    const { id } = await params;

    if (!Types.ObjectId.isValid(id)) {
      return Response.json(
        { success: false, error: 'ID sản phẩm không hợp lệ' },
        { status: 400 }
      );
    }

    const product = await Product.findById(id);
    if (!product) {
      return Response.json(
        { success: false, error: 'Sản phẩm không tìm thấy' },
        { status: 404 }
      );
    }

    const now = new Date();
    const startDate = getRangeStart(now, safeTimeframe);

    const [scanEvents, visitEvents] = await Promise.all([
      ScanLog.find({
        product_id: product._id,
        scanned_at: { $gte: startDate },
        $or: [{ event_type: 'scan' }, { event_type: { $exists: false } }],
      }).sort({ scanned_at: -1 }),
      ScanLog.find({
        product_id: product._id,
        scanned_at: { $gte: startDate },
        event_type: 'visit',
      }).sort({ scanned_at: -1 }),
    ]);

    const totalScans = product.scan_count || 0;
    const totalVisits = product.view_count || 0;
    const rangeScans = scanEvents.length;
    const rangeVisits = visitEvents.length;

    const uniqueVisitorIPs = new Set(
      [...scanEvents, ...visitEvents]
        .map((log) => log.ip_address)
        .filter((ip): ip is string => Boolean(ip && ip !== 'unknown'))
    );

    const buckets = buildBuckets(startDate, now, safeGranularity);
    const scanMap = new Map<string, number>();
    const visitMap = new Map<string, number>();

    for (const log of scanEvents) {
      const key = getBucketKey(new Date(log.scanned_at), safeGranularity);
      scanMap.set(key, (scanMap.get(key) || 0) + 1);
    }

    for (const log of visitEvents) {
      const key = getBucketKey(new Date(log.scanned_at), safeGranularity);
      visitMap.set(key, (visitMap.get(key) || 0) + 1);
    }

    const trend = buckets.map((bucket) => ({
      date: bucket.key,
      label: bucket.label,
      scans: scanMap.get(bucket.key) || 0,
      visits: visitMap.get(bucket.key) || 0,
    }));

    const hourlyScanDistribution = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      label: `${hour.toString().padStart(2, '0')}:00`,
      scans: 0,
      visits: 0,
    }));

    for (const log of scanEvents) {
      const hour = new Date(log.scanned_at).getHours();
      hourlyScanDistribution[hour].scans += 1;
    }

    for (const log of visitEvents) {
      const hour = new Date(log.scanned_at).getHours();
      hourlyScanDistribution[hour].visits += 1;
    }

    const peakScanHour = hourlyScanDistribution.reduce((peak, current) =>
      current.scans > peak.scans ? current : peak
    );

    const countryMap = new Map<string, number>();
    for (const log of [...scanEvents, ...visitEvents]) {
      const key = log.country || 'Không xác định';
      countryMap.set(key, (countryMap.get(key) || 0) + 1);
    }

    const topCountries = Array.from(countryMap.entries())
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    const recentEvents = [...scanEvents, ...visitEvents]
      .sort((a, b) => new Date(b.scanned_at).getTime() - new Date(a.scanned_at).getTime())
      .slice(0, 20)
      .map((log) => ({
        event_type: (log.event_type || 'scan') as 'visit' | 'scan',
        scanned_at: log.scanned_at,
        ip_address: log.ip_address,
        country: log.country,
        city: log.city,
      }));

    const verificationRate = rangeVisits > 0 ? Number(((rangeScans / rangeVisits) * 100).toFixed(2)) : 0;

    return Response.json(
      {
        success: true,
        data: {
          product_id: product._id,
          product_name: product.name,
          total_scans: totalScans,
          total_visits: totalVisits,
          range_scans: rangeScans,
          range_visits: rangeVisits,
          unique_ips: uniqueVisitorIPs.size,
          unique_visitors: uniqueVisitorIPs.size,
          verification_rate: verificationRate,
          average_scans_per_visitor: uniqueVisitorIPs.size > 0 ? Number((rangeScans / uniqueVisitorIPs.size).toFixed(2)) : 0,
          peak_scan_hour: peakScanHour.label,
          last_viewed_at: product.last_viewed_at,
          last_scanned_at: product.last_scanned_at,
          created_at: product.created_at,
          scan_trend: trend.map((item) => ({ date: item.label, scans: item.scans })),
          trend,
          hourly_distribution: hourlyScanDistribution,
          top_countries: topCountries,
          scans_by_country: Object.fromEntries(countryMap),
          recent_scans: recentEvents,
          recent_events: recentEvents,
          filters: {
            timeframe: safeTimeframe,
            granularity: safeGranularity,
            from: startDate,
            to: now,
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get analytics error:', error);
    return Response.json(
      { success: false, error: 'Lỗi server nội bộ' },
      { status: 500 }
    );
  }
}
