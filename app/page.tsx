'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { QrCode, BarChart3, Shield, Leaf } from 'lucide-react';

export default function Home() {
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
            <Button size="lg">
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

      {/* Footer */}
      <footer className="border-t border-border py-8 mt-20">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2024 TraceAgri. Hệ Thống Truy Xuất Nguồn Gốc Nông Sản.</p>
        </div>
      </footer>
    </main>
  );
}
