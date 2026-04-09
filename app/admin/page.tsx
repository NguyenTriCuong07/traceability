'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Plus, Eye, BarChart3 } from 'lucide-react';
import { ProductThumbnail } from '@/components/ProductThumbnail';

interface RecentProduct {
  _id: string;
  name: string;
  batch_code: string;
  image_url?: string;
  scan_count: number;
}

interface DashboardStats {
  total_products: number;
  total_scans: number;
  recent_products: RecentProduct[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/products', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          const products = data.data.products;

          setStats({
            total_products: data.data.pagination.total,
            total_scans: products.reduce((sum: number, p: any) => sum + p.scan_count, 0),
            recent_products: products.slice(0, 5),
          });
        }
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Bảng Điều Khiển</h1>
        <p className="text-muted-foreground">Chào mừng trở lại! Với đây là tổng quan về sản phẩm của bạn.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardDescription>Tổng Sản Phẩm</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {loading ? '-' : stats?.total_products || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Tổng Lần Quết</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {loading ? '-' : stats?.total_scans || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Hành Động</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/products/new">
              <Button className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Thêm Sản Phẩm
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Products */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Sản Phẩm Gần Đây
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Đang tải...</p>
          ) : stats?.recent_products && stats.recent_products.length > 0 ? (
            <div className="space-y-4">
              {stats.recent_products.map((product) => (
                <div key={product._id} className="flex items-center justify-between p-4 bg-muted/40 rounded-lg">
                  <div className="flex flex-1 items-center gap-3">
                    <ProductThumbnail imageUrl={product.image_url} alt={product.name} className="h-11 w-11" />
                    <div>
                      <p className="font-semibold text-foreground">{product.name}</p>
                      <p className="text-sm text-muted-foreground">{product.batch_code}</p>
                    </div>
                  </div>
                  <div className="text-right mr-4">
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <BarChart3 className="w-4 h-4" />
                      {product.scan_count} lần quét
                    </p>
                  </div>
                  <Link href={`/admin/products/${product._id}/edit`}>
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4 mr-1" />
                      Chỉnh Sửa
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">Chưa có sản phẩm nào</p>
              <Link href="/admin/products/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Tạo Sản Phẩm Đầu Tiên
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
