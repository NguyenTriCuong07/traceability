'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Leaf, Shield, User, Calendar, BarChart3, CheckCircle2, Circle } from 'lucide-react';
import { normalizeProductImageUrl } from '@/lib/product-image';

interface Product {
  _id: string;
  name: string;
  slug: string;
  batch_code: string;
  created_at?: string;
  description?: string;
  image_url?: string;
  expires_at?: string;
  origin: {
    region: string;
    province: string;
    district?: string;
    farm_name: string;
    producer_name: string;
    coordinates?: { lat: number; lng: number };
  };
  traceability: {
    status?: string;
    planting_date: string;
    harvest_date: string;
    pesticides_used?: string[];
    fertilizer_used?: string[];
    certification: {
      organic: boolean;
      certifier?: string;
      cert_number?: string;
      cert_expiry?: string;
    };
  };
  scan_count: number;
  last_scanned_at?: string;
}

export default function ProductDetail({ product }: { product: Product }) {
  const [verified, setVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const plantingDate = new Date(product.traceability.planting_date);
  const harvestDate = new Date(product.traceability.harvest_date);
  const createdDate = product.created_at ? new Date(product.created_at).toLocaleDateString('vi-VN') : 'Không có';
  const certExpiryDate = product.traceability.certification.cert_expiry
    ? new Date(product.traceability.certification.cert_expiry)
    : null;
  const normalizedDistrict = product.origin.district?.trim();
  const shouldShowDistrict =
    !!normalizedDistrict &&
    normalizedDistrict.toLocaleLowerCase('vi-VN') !== product.origin.province.trim().toLocaleLowerCase('vi-VN');

  const normalizeLotStatus = (value?: string): 'Đang sơ chế' | 'Đang lưu thông' | 'Đã bán hết' => {
    if (value === 'Đang sơ chế' || value === 'Đang lưu thông' || value === 'Đã bán hết') {
      return value;
    }
    if (value === 'Đã tiêu thụ') {
      return 'Đã bán hết';
    }
    if (value === 'Đã đóng gói' || value === 'Tạm ngừng') {
      return 'Đang sơ chế';
    }
    const now = new Date();
    if (product.expires_at && new Date(product.expires_at) < now) return 'Đã bán hết';
    if (harvestDate > now) return 'Đang sơ chế';
    return 'Đang lưu thông';
  };

  const lotStatus = normalizeLotStatus(product.traceability.status || product.traceability.certification.cert_number);
  const safeDate = (date: Date | null) => (date && !Number.isNaN(date.getTime()) ? date.toLocaleDateString('vi-VN') : '--/--/----');
  const normalizedImageUrl = normalizeProductImageUrl(product.image_url);

  const isLegacyStatusValue = (value?: string) =>
    value === 'Đang sơ chế' || value === 'Đang lưu thông' || value === 'Đã bán hết' || value === 'Đã tiêu thụ' || value === 'Đã đóng gói' || value === 'Tạm ngừng';

  const timelineSteps = [
    {
      id: 'production',
      title: 'Sản xuất tại vùng nguyên liệu',
      detail: `Thu hoạch tại: ${product.origin.province}`,
      date: safeDate(harvestDate),
      done: true,
    },
    {
      id: 'packaging',
      title: 'Sơ chế và đóng gói',
      detail: `Thực hiện bởi: ${product.origin.region}`,
      date: safeDate(plantingDate),
      done: true,
    },
    {
      id: 'distribution',
      title: 'Vận chuyển và phân phối',
      detail: lotStatus === 'Đang sơ chế' ? 'Đang chờ xuất kho lưu thông' : 'Đang trong quá trình lưu thông',
      date: lotStatus === 'Đang sơ chế' ? '--/--/----' : safeDate(new Date()),
      done: lotStatus !== 'Đang sơ chế',
    },
    {
      id: 'consumer',
      title: 'Tới tay người tiêu dùng',
      detail: lotStatus === 'Đã bán hết' ? 'Lô hàng đã hoàn tất tiêu thụ' : 'Khuyến nghị sử dụng trước hạn',
      date: certExpiryDate ? `HSD: ${safeDate(certExpiryDate)}` : 'HSD: --/--/----',
      done: lotStatus === 'Đã bán hết',
    },
  ];

  const handleVerify = async () => {
    setVerifying(true);
    try {
      const response = await fetch(`/api/products/slug/${product.slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        setVerified(true);
      }
    } catch (error) {
      console.error('Error verifying:', error);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/40 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">{product.name}</h1>
          <p className="text-muted-foreground">Mã Lô: {product.batch_code}</p>
        </div>

        {/* Image & Quick Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="md:col-span-2">
            {normalizedImageUrl ? (
              <div className="relative w-full h-96 bg-muted rounded-lg overflow-hidden">
                <Image
                  src={normalizedImageUrl}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-full h-96 bg-muted rounded-lg flex items-center justify-center">
                <Leaf className="w-20 h-20 text-muted-foreground/50" />
              </div>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Thông tin sản phẩm</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Lượt quét</p>
                <p className="text-2xl font-bold text-primary">{product.scan_count}</p>
              </div>
              {product.traceability.certification.organic && (
                <Badge className="bg-secondary text-secondary-foreground w-full justify-center">
                  ✓ Đã chứng nhận hữu cơ
                </Badge>
              )}
              {product.traceability.certification.certifier && (
                <Badge variant="outline" className="w-full justify-center">
                  {product.traceability.certification.certifier}
                </Badge>
              )}
              <Button onClick={handleVerify} disabled={verifying} className="w-full">
                {verifying ? 'Đang xác thực...' : verified ? '✓ Đã xác thực' : 'Xác thực sản phẩm'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="origin" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="origin">Nguồn Gốc</TabsTrigger>
            <TabsTrigger value="traceability">Truy Xuất</TabsTrigger>
            <TabsTrigger value="stats">Thống Kê</TabsTrigger>
          </TabsList>

          {/* Origin Tab */}
          <TabsContent value="origin">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  Nguồn gốc sản phẩm
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Đơn vị sơ chế / đóng gói</p>
                    <p className="text-lg font-semibold">{product.origin.region}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Vùng sản xuất</p>
                    <p className="text-lg font-semibold">{product.origin.province}</p>
                  </div>
                  {shouldShowDistrict && (
                    <div>
                      <p className="text-sm text-muted-foreground">Khu vực</p>
                      <p className="text-lg font-semibold">{product.origin.district}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground">Tên nông trại</p>
                    <p className="text-lg font-semibold">{product.origin.farm_name}</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold">Người phụ trách lô</h3>
                  </div>
                  <p className="text-foreground/90">{product.origin.producer_name}</p>
                </div>

                {product.origin.coordinates && (
                  <div className="border-t pt-4">
                    <p className="text-sm text-muted-foreground mb-2">Tọa độ</p>
                    <p className="text-foreground/90">
                      Vĩ độ: {product.origin.coordinates.lat.toFixed(4)}, Kinh độ: {product.origin.coordinates.lng.toFixed(4)}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Traceability Tab */}
          <TabsContent value="traceability">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Leaf className="w-5 h-5 text-primary" />
                  Thông tin truy xuất
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="rounded-xl border bg-secondary/20 p-4 md:p-5">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-xl font-semibold text-foreground">Nhật ký Chuỗi cung ứng</h3>
                    <Badge variant="outline" className="text-sm">
                      {lotStatus}
                    </Badge>
                  </div>

                  <div className="mt-5 space-y-4">
                    {timelineSteps.map((step, index) => (
                      <div key={step.id} className="relative pl-8">
                        {index < timelineSteps.length - 1 && (
                          <span className={`absolute left-[11px] top-6 h-[calc(100%+8px)] w-px ${step.done ? 'bg-primary/60' : 'bg-border'}`} />
                        )}

                        <span className="absolute left-0 top-0">
                          {step.done ? <CheckCircle2 className="h-6 w-6 text-primary" /> : <Circle className="h-6 w-6 text-muted-foreground" />}
                        </span>

                        <p className="text-lg font-semibold text-foreground">{step.title}</p>
                        <p className="text-muted-foreground">{step.detail}</p>
                        <p className="mt-1 inline-flex rounded-md border px-2 py-0.5 text-sm text-foreground/80">{step.date}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      <p className="text-sm text-muted-foreground">Ngày trồng</p>
                    </div>
                    <p className="text-lg font-semibold">{plantingDate.toLocaleDateString('vi-VN')}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      <p className="text-sm text-muted-foreground">Ngày thu hoạch</p>
                    </div>
                    <p className="text-lg font-semibold">{harvestDate.toLocaleDateString('vi-VN')}</p>
                  </div>
                </div>

                {product.traceability.pesticides_used && product.traceability.pesticides_used.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Thuốc bảo vệ thực vật đã dùng</p>
                    <div className="flex flex-wrap gap-2">
                      {product.traceability.pesticides_used.map((p, i) => (
                        <Badge key={i} variant="outline">
                          {p}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {product.traceability.fertilizer_used && product.traceability.fertilizer_used.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Phân bón đã dùng</p>
                    <div className="flex flex-wrap gap-2">
                      {product.traceability.fertilizer_used.map((f, i) => (
                        <Badge key={i} variant="outline">
                          {f}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="border-t pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold">Chứng nhận</h3>
                  </div>
                  <div className="space-y-2">
                    <p className="text-foreground/90">
                      <span className="font-semibold">Hữu cơ:</span> {product.traceability.certification.organic ? 'Có' : 'Không'}
                    </p>
                    {product.traceability.certification.certifier && (
                      <p className="text-foreground/90">
                        <span className="font-semibold">Đơn vị cấp:</span> {product.traceability.certification.certifier}
                      </p>
                    )}
                    {product.traceability.certification.cert_number && !isLegacyStatusValue(product.traceability.certification.cert_number) && (
                      <p className="text-foreground/90">
                        <span className="font-semibold">Số chứng nhận:</span> {product.traceability.certification.cert_number}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Statistics Tab */}
          <TabsContent value="stats">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Thống kê sản phẩm
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-secondary rounded-lg">
                    <p className="text-sm text-muted-foreground">Tổng lượt quét</p>
                    <p className="text-3xl font-bold text-primary">{product.scan_count}</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Ngày tạo</p>
                    <p className="text-lg font-semibold">{createdDate}</p>
                  </div>
                </div>
                {product.last_scanned_at && (
                  <div className="p-4 bg-muted/60 rounded-lg">
                    <p className="text-sm text-muted-foreground">Lần quét gần nhất</p>
                    <p className="text-lg font-semibold">{new Date(product.last_scanned_at).toLocaleString('vi-VN')}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="mt-12 text-center text-muted-foreground text-sm">
          <p>Slug sản phẩm: {product.slug}</p>
        </div>
      </div>
    </div>
  );
}
