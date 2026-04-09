import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/40 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-foreground mb-4">404</h1>
        <p className="text-2xl text-muted-foreground mb-8">Không tìm thấy sản phẩm</p>
        <p className="text-muted-foreground mb-8">Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã hết hạn.</p>
        <Link href="/">
          <Button>
            Quay về trang chủ
          </Button>
        </Link>
      </div>
    </div>
  );
}
