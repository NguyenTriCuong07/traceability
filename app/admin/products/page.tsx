'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, LayoutGrid, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { ProductThumbnail } from '@/components/ProductThumbnail';

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
  scan_count: number;
}

export default function AdminProductsPage() {
  const PAGE_SIZE = 10;
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const loadProducts = async (searchTerm = '', pageNum = 1) => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: PAGE_SIZE.toString(),
        ...(searchTerm && { search: searchTerm }),
      });

      const response = await fetch(`/api/products?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setProducts(data.data.products);
        setTotal(data.data.pagination.total);
      }
    } catch (error) {
      toast.error('Không thể tải danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts(search, page);
  }, [page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadProducts(search, 1);
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

  const formatHarvestDate = (dateString: string) => {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return '--/--/----';
    return date.toLocaleDateString('vi-VN');
  };

  const stats = {
    total: total,
    circulating: products.filter((product) => getProductStatus(product) === 'Đang lưu thông').length,
    processing: products.filter((product) => getProductStatus(product) === 'Đang sơ chế').length,
    soldOut: products.filter((product) => getProductStatus(product) === 'Đã bán hết').length,
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

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const pageStart = Math.max(1, page - 1);
  const pageEnd = Math.min(totalPages, pageStart + 2);
  const visiblePages = Array.from({ length: pageEnd - pageStart + 1 }, (_, index) => pageStart + index);

  const goToPage = (nextPage: number) => {
    if (nextPage < 1 || nextPage > totalPages || nextPage === page) return;
    setPage(nextPage);
  };

  return (
    <div className="p-4 md:p-6 xl:p-7">
      <div className="mb-6 md:mb-8">
        <h1 className="text-3xl md:text-4xl xl:text-5xl font-semibold tracking-tight text-foreground">Tổng quan Lô hàng</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
        <Card>
          <CardContent className="pt-5 pb-5 md:pt-6 md:pb-6">
            <p className="text-muted-foreground text-base md:text-lg">Tổng lô hàng</p>
            <p className="mt-3 md:mt-4 text-3xl md:text-4xl xl:text-5xl font-light text-foreground">{stats.total}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5 pb-5 md:pt-6 md:pb-6">
            <p className="text-muted-foreground text-base md:text-lg">Đang lưu thông</p>
            <p className="mt-3 md:mt-4 text-3xl md:text-4xl xl:text-5xl font-light text-foreground">{stats.circulating}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5 pb-5 md:pt-6 md:pb-6">
            <p className="text-muted-foreground text-base md:text-lg">Đang sơ chế</p>
            <p className="mt-3 md:mt-4 text-3xl md:text-4xl xl:text-5xl font-light text-foreground">{stats.processing}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5 pb-5 md:pt-6 md:pb-6">
            <p className="text-muted-foreground text-base md:text-lg">Đã bán hết</p>
            <p className="mt-3 md:mt-4 text-3xl md:text-4xl xl:text-5xl font-light text-foreground">{stats.soldOut}</p>
          </CardContent>
        </Card>
      </div>

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
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">Chưa có sản phẩm nào</p>
              <Link href="/admin/products/new">
                <Button>
                  Tạo Sản Phẩm Đầu Tiên
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto rounded-xl border">
                <table className="w-full min-w-[1080px]">
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
                            <Link href={`/admin/products/${product._id}/edit`}>
                              <Button size="sm" className="h-10 w-10 xl:h-12 xl:w-12 p-0" aria-label="Chỉnh sửa sản phẩm" title="Chỉnh sửa sản phẩm">
                                <LayoutGrid className="w-4 h-4" />
                              </Button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 md:mt-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border rounded-xl px-3 md:px-4 py-3">
                <p className="text-sm md:text-base text-muted-foreground">
                  Trang {page} / {totalPages} • {total} lô hàng
                </p>

                <div className="flex items-center gap-1.5 md:gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-9 md:h-10 px-3 md:px-4"
                    onClick={() => goToPage(page - 1)}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Trước
                  </Button>

                  {visiblePages.map((pageNumber) => (
                    <Button
                      key={pageNumber}
                      type="button"
                      size="sm"
                      variant={page === pageNumber ? 'default' : 'outline'}
                      className="h-9 w-9 md:h-10 md:w-10 p-0"
                      onClick={() => goToPage(pageNumber)}
                    >
                      {pageNumber}
                    </Button>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-9 md:h-10 px-3 md:px-4"
                    onClick={() => goToPage(page + 1)}
                    disabled={page === totalPages}
                  >
                    Sau
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
