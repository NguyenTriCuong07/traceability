'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ProductThumbnail } from '@/components/ProductThumbnail';
import { QrCode, BarChart3, Shield, Leaf, Search } from 'lucide-react';
import { buildProductTraceUrl } from '@/lib/qr';

interface Product {
  _id: string;
  name: string;
  slug: string;
  batch_code: string;
  image_url?: string;
  origin: {
    region: string;
    province: string;
    farm_name: string;
    producer_name: string;
  };
  traceability: {
    status?: string;
    harvest_date: string;
    certification?: {
      cert_number?: string;
    };
  };
  expires_at?: string;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const loadProducts = async (searchTerm = '') => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        limit: '20',
        ...(searchTerm.trim() && { search: searchTerm.trim() }),
      });
      const response = await fetch(`/api/products?${params}`);
      const data = await response.json();

      if (response.ok && data?.success) {
        setProducts(data.data.products || []);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error('Không thể tải danh sách sản phẩm:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    loadProducts(search);
  };

  const scrollToProductsSection = () => {
    const section = document.getElementById('san-pham-hien-co');
    section?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const getProductStatus = (product: Product) => {
    const explicitStatus = product.traceability.status || product.traceability.certification?.cert_number;
    if (explicitStatus === 'Đang lưu thông' || explicitStatus === 'Đang sơ chế' || explicitStatus === 'Đã bán hết') {
      return explicitStatus;
    }
    if (explicitStatus === 'Đã tiêu thụ') {
      return 'Đã bán hết';
    }
    if (explicitStatus === 'Đã đóng gói' || explicitStatus === 'Tạm ngừng') {
      return 'Đang sơ chế';
    }

    const now = new Date();
    const harvestDate = new Date(product.traceability.harvest_date);

    if (product.expires_at && new Date(product.expires_at) < now) {
      return 'Đã bán hết';
    }

    if (harvestDate > now) {
      return 'Đang sơ chế';
    }

    return 'Đang lưu thông';
  };

  const statusClassName = (status: string) => {
    if (status === 'Đang lưu thông') {
      return 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30';
    }
    if (status === 'Đang sơ chế') {
      return 'bg-amber-500/15 text-amber-400 border border-amber-500/30';
    }
    return 'bg-rose-500/15 text-rose-400 border border-rose-500/30';
  };

  const formatHarvestDate = (dateString: string) => {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return '--/--/----';
    return date.toLocaleDateString('vi-VN');
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/40">
      {/* Header */}
      <header className="border-b border-border">
        <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-primary">TraceAgri</div>
          <div className="space-x-4">
            <Link href="/login">
              <Button variant="outline">Đăng Nhập Admin</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-foreground mb-6">
            Hệ Thống Truy Xuất Nguồn Gốc Nông Sản
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Quét mã QR để xác minh nguồn gốc và tính xác thực của sản phẩm nông sản.
            Biết chính xác sản phẩm của bạn đến từ đâu.
          </p>
          <div className="space-x-4">
            <Button size="lg" onClick={scrollToProductsSection}>
              <QrCode className="w-5 h-5 mr-2" />
              Cách Hoạt Động
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <QrCode className="w-8 h-8 text-primary mb-2" />
            <CardTitle>Quét Mã QR</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Chỉ cần quét mã QR trên bao bì sản phẩm để nhận thông tin chi tiết.
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Leaf className="w-8 h-8 text-primary mb-2" />
            <CardTitle>Chi Tiết Nguồn Gốc</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Xem vị trí nông trại, ngày trồng, ngày thu hoạch và thông tin người sản xuất.
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Shield className="w-8 h-8 text-primary mb-2" />
            <CardTitle>Xác Minh Chính Hãng</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Kiểm tra chứng chỉ (VietGAP, Organic) và xác minh sản phẩm là chính hãng.
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <BarChart3 className="w-8 h-8 text-primary mb-2" />
            <CardTitle>Minh Bạch</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Xem có bao nhiêu người đã quét và xác minh sản phẩm này.
            </CardDescription>
          </CardContent>
        </Card>
      </section>

      {/* Public Products Section */}
      <section id="san-pham-hien-co" className="container mx-auto px-4 pb-20 scroll-mt-20">
        <Card>
          <CardContent className="pt-4 md:pt-6">
            <form onSubmit={handleSearch} className="relative mb-4 md:mb-5">
              <Search className="pointer-events-none absolute left-3 md:left-4 top-1/2 -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
              <Input
                placeholder="Tìm theo mã lô, sản phẩm, vùng..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-11 md:h-12 pl-10 md:pl-12 text-base md:text-lg"
              />
            </form>

            {loading ? (
              <p className="text-muted-foreground">Đang tải...</p>
            ) : products.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">Chưa có sản phẩm nào để hiển thị</p>
            ) : (
              <div className="overflow-x-auto rounded-xl border">
                <table className="w-full min-w-[980px]">
                  <thead>
                    <tr className="border-b bg-muted/20">
                      <th className="text-left py-3.5 xl:py-4 px-4 xl:px-5 text-sm md:text-base font-semibold">Mã lô</th>
                      <th className="text-left py-3.5 xl:py-4 px-4 xl:px-5 text-sm md:text-base font-semibold">Sản phẩm</th>
                      <th className="text-left py-3.5 xl:py-4 px-4 xl:px-5 text-sm md:text-base font-semibold">Vùng sản xuất</th>
                      <th className="text-left py-3.5 xl:py-4 px-4 xl:px-5 text-sm md:text-base font-semibold">Ngày thu hoạch</th>
                      <th className="text-left py-3.5 xl:py-4 px-4 xl:px-5 text-sm md:text-base font-semibold">Đơn vị đóng gói</th>
                      <th className="text-left py-3.5 xl:py-4 px-4 xl:px-5 text-sm md:text-base font-semibold">Trạng thái</th>
                      <th className="text-left py-3.5 xl:py-4 px-4 xl:px-5 text-sm md:text-base font-semibold">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product._id} className="border-b hover:bg-muted/20 align-top">
                        <td className="py-4 xl:py-5 px-4 xl:px-5 text-sm md:text-base font-medium">{product.batch_code}</td>
                        <td className="py-4 xl:py-5 px-4 xl:px-5">
                          <div className="flex items-start gap-3">
                            <ProductThumbnail imageUrl={product.image_url} alt={product.name} />
                            <div>
                              <p className="text-base md:text-lg font-semibold leading-tight">{product.name}</p>
                              <p className="mt-1.5 xl:mt-2 text-sm md:text-base text-muted-foreground">{product.origin.farm_name}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 xl:py-5 px-4 xl:px-5 text-sm md:text-base font-medium">{product.origin.province}</td>
                        <td className="py-4 xl:py-5 px-4 xl:px-5 text-sm md:text-base font-medium">{formatHarvestDate(product.traceability.harvest_date)}</td>
                        <td className="py-4 xl:py-5 px-4 xl:px-5 max-w-[260px] xl:max-w-[300px]">
                          <p className="text-sm md:text-base font-medium leading-snug">{product.origin.region || product.origin.producer_name || '--'}</p>
                        </td>
                        <td className="py-4 xl:py-5 px-4 xl:px-5">
                          <span className={`inline-flex items-center rounded-full px-3 xl:px-3.5 py-1.5 xl:py-1.5 text-xs md:text-sm font-semibold ${statusClassName(getProductStatus(product))}`}>
                            {getProductStatus(product)}
                          </span>
                        </td>
                        <td className="py-4 xl:py-5 px-4 xl:px-5">
                          <div className="flex items-center gap-2">
                            <Link href={`/product/${product.slug}`}>
                              <Button size="sm" variant="outline" className="h-10 xl:h-12 px-3 xl:px-4 text-sm font-medium">
                                Chi tiết
                              </Button>
                            </Link>
                            <Button asChild size="sm" className="h-10 w-10 xl:h-12 xl:w-12 p-0" aria-label="Mở trang quét QR" title="Mở trang quét QR">
                              <a href={buildProductTraceUrl(product.slug)} target="_blank" rel="noopener noreferrer">
                                <QrCode className="w-4 h-4" />
                              </a>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 mt-20">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2024 TraceAgri. Hệ Thống Truy Xuất Nguồn Gốc Nông Sản.</p>
        </div>
      </footer>
    </main>
  );
}
