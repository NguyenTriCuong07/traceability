import { ProductForm } from '@/components/ProductForm';

export default function NewProductPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/40 p-4 md:p-8">
      <div className="mb-6 md:mb-8">
        <h1 className="mb-2 text-4xl font-semibold tracking-tight text-foreground md:text-6xl">Đăng ký Lô hàng mới</h1>
        <p className="text-lg text-muted-foreground">Khởi tạo mã truy xuất nguồn gốc cho sản phẩm nông nghiệp.</p>
      </div>
      <ProductForm />
    </div>
  );
}
