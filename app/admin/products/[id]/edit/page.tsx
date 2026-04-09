'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProductForm } from '@/components/ProductForm';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

const toDateInput = (value?: string | Date | null): string => {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10);
};

export default function EditProductPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const handleDeleteProduct = async () => {
    if (!params?.id || deleting) return;

    const confirmed = window.confirm('Bạn có chắc chắn muốn xóa lô hàng này? Hành động này không thể hoàn tác.');
    if (!confirmed) return;

    setDeleting(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại');
        router.push('/login');
        return;
      }

      const response = await fetch(`/api/products/${params.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          toast.error('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại');
          router.push('/login');
          return;
        }

        toast.error(data?.error || 'Không thể xóa sản phẩm');
        return;
      }

      toast.success('Đã xóa sản phẩm thành công');
      router.push('/admin/products');
      router.refresh();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Có lỗi xảy ra khi xóa sản phẩm');
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    if (!params?.id) {
      toast.error('Không tìm thấy sản phẩm cần chỉnh sửa');
      setLoading(false);
      return;
    }

    const loadProduct = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại');
          router.push('/login');
          return;
        }

        const response = await fetch(`/api/products/${params.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json();

        if (!response.ok) {
          toast.error(data.error || 'Không thể tải thông tin sản phẩm');
          return;
        }

        const productData = {
          ...data.data,
          qr_code: data?.meta?.qr_code || null,
          traceability: {
            ...data.data?.traceability,
            planting_date: toDateInput(data.data?.traceability?.planting_date),
            harvest_date: toDateInput(data.data?.traceability?.harvest_date),
            certification: {
              ...data.data?.traceability?.certification,
              cert_expiry: toDateInput(data.data?.traceability?.certification?.cert_expiry),
            },
          },
        };

        setProduct(productData);
      } catch (error) {
        console.error('Error loading product:', error);
        toast.error('Có lỗi xảy ra khi tải sản phẩm');
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [params?.id, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/40 p-8">
        <p className="text-muted-foreground">Đang tải dữ liệu sản phẩm...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/40 p-8">
        <p className="text-destructive">Không tìm thấy sản phẩm</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/40 p-4 md:p-8">
      <div className="mb-6 flex flex-col gap-4 md:mb-8 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="mb-2 text-4xl font-semibold tracking-tight text-foreground md:text-6xl">Chỉnh sửa Lô hàng</h1>
          <p className="text-lg text-muted-foreground">Cập nhật thông tin truy xuất cho lô hàng hiện có.</p>
        </div>
        <Button
          type="button"
          variant="destructive"
          onClick={handleDeleteProduct}
          disabled={deleting}
          className="w-full md:w-auto"
        >
          {deleting ? 'Đang xóa...' : 'Xóa lô hàng'}
        </Button>
      </div>
      <ProductForm initialData={product} isEditing={true} />
    </div>
  );
}
