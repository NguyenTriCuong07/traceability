'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
} from 'recharts';
import { BarChart3, ScanLine, Users } from 'lucide-react';

interface ProductAnalytics {
  product_id: string;
  product_name: string;
  total_scans: number;
  total_visits: number;
  range_scans: number;
  range_visits: number;
  unique_ips: number;
  unique_visitors: number;
  verification_rate: number;
  average_scans_per_visitor: number;
  peak_scan_hour: string;
  last_viewed_at?: string;
  last_scanned_at: string;
  trend: Array<{ date: string; label: string; scans: number; visits: number }>;
  hourly_distribution: Array<{ hour: number; label: string; scans: number; visits: number }>;
  top_countries: Array<{ country: string; count: number }>;
  recent_events: Array<{ scanned_at: string; ip_address: string; country?: string; city?: string; event_type: 'visit' | 'scan' }>;
  filters: {
    timeframe: '7d' | '30d' | '90d';
    granularity: 'day' | 'hour';
    from: string;
    to: string;
  };
}

interface SystemAnalytics {
  total_products: number;
  active_products: number;
  total_scans: number;
  total_visits: number;
  range_scans: number;
  range_visits: number;
  unique_visitors: number;
  verification_rate: number;
  average_scans_per_visitor: number;
  peak_scan_hour: string;
  trend: Array<{ date: string; label: string; scans: number; visits: number }>;
  hourly_distribution: Array<{ hour: number; label: string; scans: number; visits: number }>;
  top_countries: Array<{ country: string; count: number }>;
  top_products: Array<{ product_id: string; product_name: string; batch_code: string; scans: number; visits: number }>;
  recent_events: Array<{
    product_id: string;
    product_name: string;
    batch_code: string;
    scanned_at: string;
    ip_address?: string;
    country?: string;
    city?: string;
    event_type: 'visit' | 'scan';
  }>;
  filters: {
    timeframe: '7d' | '30d' | '90d';
    granularity: 'day' | 'hour';
    from: string;
    to: string;
  };
}

const numberFormatter = new Intl.NumberFormat('vi-VN');

const formatDateTime = (value?: string) => {
  if (!value) return '--';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '--';
  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
};

export default function AnalyticsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d'>('30d');
  const [granularity, setGranularity] = useState<'day' | 'hour'>('day');
  const [systemAnalytics, setSystemAnalytics] = useState<SystemAnalytics | null>(null);
  const [analytics, setAnalytics] = useState<ProductAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [systemLoading, setSystemLoading] = useState(false);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [refreshTick, setRefreshTick] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Load products list
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setError(null);
        const token = localStorage.getItem('token');
        const response = await fetch('/api/products?limit=100', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setProducts(data.data.products);
          if (data.data.products.length > 0) {
            setSelectedProductId(data.data.products[0]._id);
          }
        } else {
          setError('Không thể tải danh sách sản phẩm.');
        }
      } catch (error) {
        console.error('Error loading products:', error);
        setError('Lỗi tải danh sách sản phẩm.');
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  // Load analytics for selected product
  useEffect(() => {
    if (!selectedProductId) return;

    const loadAnalytics = async () => {
      try {
        setAnalyticsLoading(true);
        setError(null);
        const token = localStorage.getItem('token');
        const response = await fetch(
          `/api/products/${selectedProductId}/analytics?timeframe=${timeframe}&granularity=${granularity}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setAnalytics(data.data);
        } else {
          setAnalytics(null);
          setError('Không thể tải dữ liệu phân tích cho sản phẩm đã chọn.');
        }
      } catch (error) {
        console.error('Error loading analytics:', error);
        setAnalytics(null);
        setError('Lỗi tải dữ liệu phân tích.');
      } finally {
        setAnalyticsLoading(false);
      }
    };

    loadAnalytics();
  }, [selectedProductId, timeframe, granularity, refreshTick]);

  useEffect(() => {
    const loadSystemAnalytics = async () => {
      try {
        setSystemLoading(true);
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/analytics/system?timeframe=${timeframe}&granularity=${granularity}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setSystemAnalytics(data.data);
        } else {
          setSystemAnalytics(null);
        }
      } catch (err) {
        console.error('Error loading system analytics:', err);
        setSystemAnalytics(null);
      } finally {
        setSystemLoading(false);
      }
    };

    loadSystemAnalytics();
  }, [timeframe, granularity, refreshTick]);

  const handleSyncNow = async () => {
    try {
      setSyncLoading(true);
      setSyncMessage(null);
      const token = localStorage.getItem('token');

      const response = await fetch('/api/admin/analytics/sync', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const payload = await response.json();

      if (!response.ok || !payload?.success) {
        setSyncMessage(payload?.error || 'Đồng bộ thất bại.');
        return;
      }

      const { updated_products, total_scans, total_visits } = payload.data;
      setSyncMessage(
        `Đồng bộ thành công: ${numberFormatter.format(updated_products)} sản phẩm, ${numberFormatter.format(total_scans)} lượt quét, ${numberFormatter.format(total_visits)} lượt truy cập.`
      );
      setRefreshTick((prev) => prev + 1);
    } catch (syncError) {
      console.error('Sync analytics error:', syncError);
      setSyncMessage('Lỗi khi gọi API đồng bộ.');
    } finally {
      setSyncLoading(false);
    }
  };

  const selectedProduct = products.find((p) => p._id === selectedProductId);
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Phân Tích</h1>
        <p className="text-muted-foreground">Theo dõi lượt truy cập, lượt quét, khung giờ quét và hành vi người dùng theo thời gian thực</p>
        <div className="mt-4 flex flex-col gap-2 md:flex-row md:items-center">
          <Button onClick={handleSyncNow} disabled={syncLoading || loading}>
            {syncLoading ? 'Đang đồng bộ...' : 'Đồng bộ ngay'}
          </Button>
          {syncMessage && <p className="text-sm text-muted-foreground">{syncMessage}</p>}
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Bộ lọc phân tích</CardTitle>
          <CardDescription>Áp dụng đồng thời cho cả tab Toàn hệ thống và tab Theo sản phẩm</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select value={timeframe} onValueChange={(value: '7d' | '30d' | '90d') => setTimeframe(value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Khoảng thời gian" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 ngày gần nhất</SelectItem>
              <SelectItem value="30d">30 ngày gần nhất</SelectItem>
              <SelectItem value="90d">90 ngày gần nhất</SelectItem>
            </SelectContent>
          </Select>

          <Select value={granularity} onValueChange={(value: 'day' | 'hour') => setGranularity(value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Độ chi tiết" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Theo ngày</SelectItem>
              <SelectItem value="hour">Theo giờ</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Tabs defaultValue="system" className="w-full">
        <TabsList className="mb-6 grid h-11 w-full grid-cols-2 md:w-[420px]">
          <TabsTrigger value="system" className="text-sm md:text-base">Toàn hệ thống</TabsTrigger>
          <TabsTrigger value="product" className="text-sm md:text-base">Theo sản phẩm</TabsTrigger>
        </TabsList>

        <TabsContent value="system" className="space-y-6">
          {systemLoading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Đang tải dữ liệu toàn hệ thống...</p>
            </div>
          ) : systemAnalytics ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Tổng hợp toàn hệ thống</CardTitle>
                  <CardDescription>
                    Toàn bộ sản phẩm từ {formatDateTime(systemAnalytics.filters.from)} đến {formatDateTime(systemAnalytics.filters.to)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    <div className="rounded-lg border p-4 bg-muted/30">
                      <p className="text-sm text-muted-foreground">Tổng sản phẩm</p>
                      <p className="text-3xl font-bold text-primary">{numberFormatter.format(systemAnalytics.total_products)}</p>
                      <p className="text-xs text-muted-foreground mt-1">Đang có hoạt động: {numberFormatter.format(systemAnalytics.active_products)}</p>
                    </div>
                    <div className="rounded-lg border p-4 bg-muted/30">
                      <p className="text-sm text-muted-foreground">Truy cập ({timeframe})</p>
                      <p className="text-3xl font-bold text-primary">{numberFormatter.format(systemAnalytics.range_visits)}</p>
                      <p className="text-xs text-muted-foreground mt-1">Tổng tích lũy: {numberFormatter.format(systemAnalytics.total_visits)}</p>
                    </div>
                    <div className="rounded-lg border p-4 bg-muted/30">
                      <p className="text-sm text-muted-foreground">Quét ({timeframe})</p>
                      <p className="text-3xl font-bold text-primary">{numberFormatter.format(systemAnalytics.range_scans)}</p>
                      <p className="text-xs text-muted-foreground mt-1">Tổng tích lũy: {numberFormatter.format(systemAnalytics.total_scans)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Xu hướng toàn hệ thống</CardTitle>
                  <CardDescription>So sánh truy cập và quét theo thời gian</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={systemAnalytics.trend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="label" minTickGap={24} />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Area type="monotone" dataKey="visits" stroke="#0f766e" fill="#99f6e4" fillOpacity={0.4} name="Lượt truy cập" />
                      <Line type="monotone" dataKey="scans" stroke="#16a34a" strokeWidth={2.2} dot={false} name="Lượt quét" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
                <Card className="xl:col-span-3">
                  <CardHeader>
                    <CardTitle>Top sản phẩm theo hoạt động</CardTitle>
                    <CardDescription>Xếp hạng theo lượt quét + truy cập trong kỳ đã chọn</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2 px-3">Sản phẩm</th>
                            <th className="text-left py-2 px-3">Mã lô</th>
                            <th className="text-right py-2 px-3">Truy cập</th>
                            <th className="text-right py-2 px-3">Quét</th>
                            <th className="text-right py-2 px-3">Tổng hoạt động</th>
                          </tr>
                        </thead>
                        <tbody>
                          {systemAnalytics.top_products.map((item) => (
                            <tr key={item.product_id} className="border-b hover:bg-muted/40">
                              <td className="py-2 px-3 font-medium">{item.product_name}</td>
                              <td className="py-2 px-3 text-muted-foreground">{item.batch_code}</td>
                              <td className="py-2 px-3 text-right">{numberFormatter.format(item.visits)}</td>
                              <td className="py-2 px-3 text-right">{numberFormatter.format(item.scans)}</td>
                              <td className="py-2 px-3 text-right font-semibold">{numberFormatter.format(item.scans + item.visits)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                <Card className="xl:col-span-2">
                  <CardHeader>
                    <CardTitle>Phân bố quét/truy cập theo giờ</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={systemAnalytics.hourly_distribution}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="label" minTickGap={16} />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="visits" fill="#0f766e" name="Truy cập" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="scans" fill="#16a34a" name="Quét" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Không tải được dữ liệu toàn hệ thống.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="product" className="space-y-6">
          <Card>
            <CardHeader className="gap-4">
              <CardTitle>Chọn Sản Phẩm</CardTitle>
              <CardDescription>Phân tích chi tiết theo từng sản phẩm</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                <SelectTrigger className="w-full md:max-w-2xl">
                  <SelectValue placeholder="Chọn một sản phẩm" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product._id} value={product._id}>
                      {product.name} ({product.batch_code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {selectedProduct && analytics && !analyticsLoading ? (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <Card>
                  <CardHeader>
                    <CardDescription className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Lượt Truy Cập ({timeframe})
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-primary">{numberFormatter.format(analytics.range_visits)}</div>
                    <p className="text-xs text-muted-foreground mt-1">Tổng tích lũy: {numberFormatter.format(analytics.total_visits)}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardDescription className="flex items-center gap-2">
                      <ScanLine className="w-4 h-4" />
                      Lượt Quét ({timeframe})
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-primary">{numberFormatter.format(analytics.range_scans)}</div>
                    <p className="text-xs text-muted-foreground mt-1">Tổng tích lũy: {numberFormatter.format(analytics.total_scans)}</p>
                  </CardContent>
                </Card>
              </div>

              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Xu hướng truy cập và quét
                  </CardTitle>
                  <CardDescription>
                    Từ {formatDateTime(analytics.filters.from)} đến {formatDateTime(analytics.filters.to)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={320}>
                    <AreaChart data={analytics.trend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="label" minTickGap={24} />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Area type="monotone" dataKey="visits" stroke="#0f766e" fill="#99f6e4" fillOpacity={0.4} name="Lượt truy cập" />
                      <Line type="monotone" dataKey="scans" stroke="#16a34a" strokeWidth={2.2} dot={false} name="Lượt quét" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Phân bố theo khung giờ</CardTitle>
                  <CardDescription>Lựa chọn khung giờ vận hành/khuyến mãi dựa trên giờ quét cao điểm</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analytics.hourly_distribution}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="label" minTickGap={18} />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="visits" fill="#0f766e" name="Truy cập" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="scans" fill="#16a34a" name="Quét" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Recent Events */}
              <Card>
                <CardHeader>
                  <CardTitle>Lịch sử hoạt động gần nhất</CardTitle>
                  <CardDescription>Log truy cập và quét mới nhất của sản phẩm</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-4">Thời gian</th>
                          <th className="text-left py-2 px-4">Sự kiện</th>
                          <th className="text-left py-2 px-4">IP</th>
                          <th className="text-left py-2 px-4">Vị trí</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analytics.recent_events.map((scan, idx) => (
                          <tr key={idx} className="border-b hover:bg-muted/50">
                            <td className="py-2 px-4">{formatDateTime(scan.scanned_at)}</td>
                            <td className="py-2 px-4">
                              <Badge variant={scan.event_type === 'scan' ? 'default' : 'outline'}>
                                {scan.event_type === 'scan' ? 'Quét xác thực' : 'Truy cập'}
                              </Badge>
                            </td>
                            <td className="py-2 px-4 text-muted-foreground">{scan.ip_address || 'unknown'}</td>
                            <td className="py-2 px-4 text-muted-foreground">{scan.city || scan.country || 'Không xác định'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : loading || analyticsLoading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Đang tải dữ liệu phân tích...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Chưa có sản phẩm để phân tích.</p>
            </div>
          ) : (
            <div className="text-center py-8 space-y-2">
              <p className="text-muted-foreground">{error || 'Không thể hiển thị dữ liệu phân tích cho sản phẩm này.'}</p>
              <p className="text-xs text-muted-foreground">Kiểm tra token đăng nhập admin và thử đổi khoảng thời gian.</p>
            </div>
          )}

          {analytics && (
            <div className="mt-2 text-xs text-muted-foreground space-y-1">
              <p>Lần truy cập gần nhất: {formatDateTime(analytics.last_viewed_at)}</p>
              <p>Lần quét gần nhất: {formatDateTime(analytics.last_scanned_at)}</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
