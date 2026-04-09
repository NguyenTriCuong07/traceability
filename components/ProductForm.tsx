'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Image from 'next/image';
import { toast } from 'sonner';
import { normalizeProductImageUrl } from '@/lib/product-image';

interface ProvinceRecord {
  code: string;
  name: string;
  unit: string;
}

interface DistrictRecord {
  code: string;
  name: string;
  unit: string;
  province_code: string;
  province_name: string;
  full_name: string;
}

const vietnamAdministrativeData = require('vietnam-provinces') as {
  provinces: ProvinceRecord[];
  districts: DistrictRecord[];
};

interface ProductFormProps {
  initialData?: any;
  isEditing?: boolean;
}

interface SuggestionData {
  regions: string[];
  provinces: string[];
  districts: string[];
  batchCodes: string[];
  farmNames: string[];
  producerNames: string[];
  certifiers: string[];
  pesticides: string[];
  fertilizers: string[];
  provincesByRegion: Record<string, string[]>;
  districtsByProvince: Record<string, string[]>;
}

const normalizeProvinceName = (name: string) => name.replace(/^Tỉnh\s+/, '').replace(/^Thành phố\s+/, '').trim();

const normalizeDistrictName = (name: string) => name.replace(/^(Quận|Huyện|Thị xã|Thành phố)\s+/, '').trim();

const sortVietnamese = (items: string[]) => items.sort((a, b) => a.localeCompare(b, 'vi'));

const REGION_PROVINCES: Record<string, string[]> = {
  'Đông Bắc Bộ': ['Bắc Giang', 'Bắc Kạn', 'Cao Bằng', 'Hà Giang', 'Lạng Sơn', 'Phú Thọ', 'Quảng Ninh', 'Thái Nguyên', 'Tuyên Quang', 'Yên Bái', 'Lào Cai'],
  'Tây Bắc Bộ': ['Điện Biên', 'Hòa Bình', 'Lai Châu', 'Sơn La'],
  'Đồng Bằng Sông Hồng': ['Bắc Ninh', 'Hà Nam', 'Hà Nội', 'Hải Dương', 'Hải Phòng', 'Hưng Yên', 'Nam Định', 'Ninh Bình', 'Thái Bình', 'Vĩnh Phúc'],
  'Bắc Trung Bộ': ['Hà Tĩnh', 'Nghệ An', 'Quảng Bình', 'Quảng Trị', 'Thanh Hóa', 'Thừa Thiên Huế'],
  'Duyên Hải Nam Trung Bộ': ['Bình Định', 'Bình Thuận', 'Đà Nẵng', 'Khánh Hòa', 'Ninh Thuận', 'Phú Yên', 'Quảng Nam', 'Quảng Ngãi'],
  'Tây Nguyên': ['Đắk Lắk', 'Đắk Nông', 'Gia Lai', 'Kon Tum', 'Lâm Đồng'],
  'Đông Nam Bộ': ['Bà Rịa - Vũng Tàu', 'Bình Dương', 'Bình Phước', 'Đồng Nai', 'Hồ Chí Minh', 'Tây Ninh'],
  'Đồng Bằng Sông Cửu Long': ['An Giang', 'Bạc Liêu', 'Bến Tre', 'Cà Mau', 'Cần Thơ', 'Đồng Tháp', 'Hậu Giang', 'Kiên Giang', 'Long An', 'Sóc Trăng', 'Tiền Giang', 'Trà Vinh', 'Vĩnh Long'],
};

const provincesFromAdministrativeData = sortVietnamese(
  Array.from(new Set(vietnamAdministrativeData.provinces.map((province) => normalizeProvinceName(province.name))))
);

const districtsByProvinceFromAdministrativeData = vietnamAdministrativeData.districts.reduce<Record<string, string[]>>((acc, district) => {
  const provinceName = normalizeProvinceName(district.province_name);
  const districtName = normalizeDistrictName(district.name);

  if (!acc[provinceName]) {
    acc[provinceName] = [];
  }

  acc[provinceName].push(districtName);
  return acc;
}, {});

for (const province of Object.keys(districtsByProvinceFromAdministrativeData)) {
  districtsByProvinceFromAdministrativeData[province] = sortVietnamese(
    Array.from(new Set(districtsByProvinceFromAdministrativeData[province]))
  );
}

const districtsFromAdministrativeData = sortVietnamese(
  Array.from(new Set(Object.values(districtsByProvinceFromAdministrativeData).flat()))
);

const DEFAULT_SUGGESTIONS: SuggestionData = {
  regions: [
    'Công ty TNHH Đóng gói Mekong Green',
    'Công ty CP Bao Bì Nông Sản Bến Tre',
    'Công ty TNHH Sơ chế Nông sản Trà Vinh',
    'Công ty CP Chế biến và Đóng gói VinaFarm',
    'Công ty TNHH Đóng gói Nông sản Nam Bộ',
    'Công ty CP Dịch vụ Hậu cần Nông nghiệp An Phú',
    'HTX Sơ chế và Đóng gói Cầu Kè',
    'Trung tâm Đóng gói Nông sản Đồng Khởi',
  ],
  provinces: provincesFromAdministrativeData,
  districts: districtsFromAdministrativeData,
  batchCodes: [],
  farmNames: ['Nông Trại Hữu Cơ Trà Vinh', 'Nông Trại Xanh Mekong', 'Nông Trại Cầu Kè', 'Nông Trại Cao Nguyên'],
  producerNames: ['Nguyễn Văn A', 'Trần Thị B', 'Phạm Văn C', 'Lê Thị D'],
  certifiers: ['VietGAP', 'GlobalGAP', 'ECOCERT'],
  pesticides: ['Abamectin', 'Neem Oil', 'Copper Hydroxide'],
  fertilizers: ['NPK 16-16-8', 'Phân Hữu Cơ Vi Sinh', 'Phân Trùn Quế'],
  provincesByRegion: Object.fromEntries(
    Object.entries(REGION_PROVINCES).map(([region, provinces]) => [region, sortVietnamese([...provinces])])
  ),
  districtsByProvince: districtsByProvinceFromAdministrativeData,
};

const LEGACY_REGION_VALUES = new Set([
  ...Object.keys(REGION_PROVINCES),
  'Bắc Trung Bộ',
  'Nam Trung Bộ',
  'Duyên Hải Nam Trung Bộ',
  'Tây Bắc Bộ',
  'Đông Bắc Bộ',
  'Đồng Bằng Sông Cửu Long',
  'Đồng Bằng Sông Hồng',
  'Tây Nguyên',
  'Đông Nam Bộ',
]);

const LEGACY_PACKAGING_UNIT_MAP: Record<string, string> = {
  'Đông Bắc Bộ': 'Công ty CP Bao Bì Nông Sản Bến Tre',
  'Tây Bắc Bộ': 'Công ty TNHH Đóng gói Nông sản Nam Bộ',
  'Đồng Bằng Sông Hồng': 'Công ty CP Chế biến và Đóng gói VinaFarm',
  'Bắc Trung Bộ': 'Công ty TNHH Sơ chế Nông sản Trà Vinh',
  'Duyên Hải Nam Trung Bộ': 'Trung tâm Đóng gói Nông sản Đồng Khởi',
  'Tây Nguyên': 'HTX Sơ chế và Đóng gói Cầu Kè',
  'Đông Nam Bộ': 'Công ty TNHH Đóng gói Mekong Green',
  'Đồng Bằng Sông Cửu Long': 'Công ty CP Bao Bì Nông Sản Bến Tre',
  'Nam Trung Bộ': 'Công ty CP Dịch vụ Hậu cần Nông nghiệp An Phú',
};

const normalizePackagingUnit = (value: string): string => {
  const cleaned = value.replace(/\s+/g, ' ').trim();
  if (!cleaned) return '';
  return LEGACY_PACKAGING_UNIT_MAP[cleaned] || cleaned;
};

const normalizeLotStatus = (value?: string): 'Đang lưu thông' | 'Đang sơ chế' | 'Đã bán hết' => {
  if (value === 'Đang lưu thông' || value === 'Đang sơ chế' || value === 'Đã bán hết') {
    return value;
  }

  // Backward compatibility for previously misused values stored in cert_number.
  if (value === 'Đã tiêu thụ') return 'Đã bán hết';
  if (value === 'Đã đóng gói' || value === 'Tạm ngừng') return 'Đang sơ chế';
  return 'Đang sơ chế';
};

const mergeSuggestionArrays = (...arrays: string[][]) =>
  Array.from(
    new Set(
      arrays
        .flat()
        .map((item) => item?.trim())
        .filter(Boolean) as string[]
    )
  ).sort((a, b) => a.localeCompare(b, 'vi'));

const mergeSuggestionMaps = (
  base: Record<string, string[]>,
  extra: Record<string, string[]>
): Record<string, string[]> => {
  const keys = new Set([...Object.keys(base), ...Object.keys(extra)]);
  const result: Record<string, string[]> = {};

  for (const key of keys) {
    result[key] = mergeSuggestionArrays(base[key] || [], extra[key] || []);
  }

  return result;
};

export function ProductForm({ initialData, isEditing }: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(initialData?.qr_code || null);
  const [qrTargetUrl, setQrTargetUrl] = useState<string | null>(initialData?.qr_code_url || null);
  const [suggestions, setSuggestions] = useState<SuggestionData>(DEFAULT_SUGGESTIONS);
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    batch_code: initialData?.batch_code || '',
    description: initialData?.description || '',
    image_url: normalizeProductImageUrl(initialData?.image_url),
    origin: {
      region: initialData?.origin?.region || '',
      province: normalizeProvinceName(initialData?.origin?.province || ''),
      district: normalizeDistrictName(initialData?.origin?.district || ''),
      farm_name: initialData?.origin?.farm_name || '',
      producer_name: initialData?.origin?.producer_name || '',
      coordinates: initialData?.origin?.coordinates || { lat: 0, lng: 0 },
    },
    traceability: {
      status: normalizeLotStatus(initialData?.traceability?.status || initialData?.traceability?.certification?.cert_number),
      planting_date: initialData?.traceability?.planting_date || '',
      harvest_date: initialData?.traceability?.harvest_date || '',
      pesticides_used: initialData?.traceability?.pesticides_used?.join(', ') || '',
      fertilizer_used: initialData?.traceability?.fertilizer_used?.join(', ') || '',
      certification: {
        organic: initialData?.traceability?.certification?.organic || false,
        certifier: initialData?.traceability?.certification?.certifier || '',
        cert_number: initialData?.traceability?.certification?.cert_number || '',
        cert_expiry: initialData?.traceability?.certification?.cert_expiry || '',
      },
    },
  });

  const NUMERIC_FIELDS = new Set(['origin.coordinates.lat', 'origin.coordinates.lng']);

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const response = await fetch('/api/products?limit=1000');
        if (!response.ok) return;

        const json = await response.json();
        const products = json?.data?.products || [];

        const regions = new Set<string>();
        const provinces = new Set<string>();
        const districts = new Set<string>();
        const batchCodes = new Set<string>();
        const farmNames = new Set<string>();
        const producerNames = new Set<string>();
        const certifiers = new Set<string>();
        const pesticides = new Set<string>();
        const fertilizers = new Set<string>();
        const provincesByRegion = new Map<string, Set<string>>();
        const districtsByProvince = new Map<string, Set<string>>();

        for (const product of products) {
          const region = product?.origin?.region?.trim();
          const province = normalizeProvinceName(product?.origin?.province?.trim() || '');
          const district = normalizeDistrictName(product?.origin?.district?.trim() || '');
          const batchCode = product?.batch_code?.trim();
          const farmName = product?.origin?.farm_name?.trim();
          const producerName = product?.origin?.producer_name?.trim();
          const certifier = product?.traceability?.certification?.certifier?.trim();

          if (region && !LEGACY_REGION_VALUES.has(region)) regions.add(region);
          if (province) provinces.add(province);
          if (district) districts.add(district);
          if (batchCode) batchCodes.add(batchCode);
          if (farmName) farmNames.add(farmName);
          if (producerName) producerNames.add(producerName);
          if (certifier) certifiers.add(certifier);

          if (region && province) {
            if (!provincesByRegion.has(region)) provincesByRegion.set(region, new Set());
            provincesByRegion.get(region)?.add(province);
          }

          if (province && district) {
            if (!districtsByProvince.has(province)) districtsByProvince.set(province, new Set());
            districtsByProvince.get(province)?.add(district);
          }

          for (const pesticide of product?.traceability?.pesticides_used || []) {
            const normalized = pesticide?.trim();
            if (normalized) pesticides.add(normalized);
          }

          for (const fertilizer of product?.traceability?.fertilizer_used || []) {
            const normalized = fertilizer?.trim();
            if (normalized) fertilizers.add(normalized);
          }
        }

        const sortValues = (items: Set<string>) => Array.from(items).sort((a, b) => a.localeCompare(b, 'vi'));
        const mapToObject = (source: Map<string, Set<string>>) =>
          Array.from(source.entries()).reduce<Record<string, string[]>>((acc, [key, value]) => {
            acc[key] = Array.from(value).sort((a, b) => a.localeCompare(b, 'vi'));
            return acc;
          }, {});

        setSuggestions({
          regions: mergeSuggestionArrays(DEFAULT_SUGGESTIONS.regions, sortValues(regions)),
          provinces: mergeSuggestionArrays(DEFAULT_SUGGESTIONS.provinces, sortValues(provinces)),
          districts: mergeSuggestionArrays(DEFAULT_SUGGESTIONS.districts, sortValues(districts)),
          batchCodes: mergeSuggestionArrays(DEFAULT_SUGGESTIONS.batchCodes, sortValues(batchCodes)),
          farmNames: mergeSuggestionArrays(DEFAULT_SUGGESTIONS.farmNames, sortValues(farmNames)),
          producerNames: mergeSuggestionArrays(DEFAULT_SUGGESTIONS.producerNames, sortValues(producerNames)),
          certifiers: mergeSuggestionArrays(DEFAULT_SUGGESTIONS.certifiers, sortValues(certifiers)),
          pesticides: mergeSuggestionArrays(DEFAULT_SUGGESTIONS.pesticides, sortValues(pesticides)),
          fertilizers: mergeSuggestionArrays(DEFAULT_SUGGESTIONS.fertilizers, sortValues(fertilizers)),
          provincesByRegion: mergeSuggestionMaps(DEFAULT_SUGGESTIONS.provincesByRegion, mapToObject(provincesByRegion)),
          districtsByProvince: mergeSuggestionMaps(DEFAULT_SUGGESTIONS.districtsByProvince, mapToObject(districtsByProvince)),
        });
      } catch (error) {
        console.error('Load suggestion data error:', error);
      }
    };

    fetchSuggestions();
  }, []);

  const setNestedValue = (target: any, keys: string[], value: string | number): any => {
    if (keys.length === 1) {
      return {
        ...target,
        [keys[0]]: value,
      };
    }

    const [firstKey, ...restKeys] = keys;
    return {
      ...target,
      [firstKey]: setNestedValue(target?.[firstKey] ?? {}, restKeys, value),
    };
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const keys = name.split('.');
    const parsedValue = NUMERIC_FIELDS.has(name)
      ? (value === '' ? 0 : Number(value))
      : value;

    setFormData((prev) => setNestedValue(prev, keys, parsedValue));
  };

  const handleSelectChange = (name: string, value: string) => {
    const keys = name.split('.');
    setFormData((prev) => setNestedValue(prev, keys, value));
  };

  const provinceSuggestions = formData.origin.region
    ? suggestions.provincesByRegion[formData.origin.region] || suggestions.provinces
    : suggestions.provinces;

  const previewImageUrl = normalizeProductImageUrl(formData.image_url);

  const districtSuggestions = formData.origin.province
    ? suggestions.districtsByProvince[formData.origin.province] || suggestions.districts
    : suggestions.districts;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file ảnh hợp lệ');
      e.target.value = '';
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Bạn chưa đăng nhập');
      e.target.value = '';
      return;
    }

    setUploadingImage(true);
    try {
      const form = new FormData();
      form.append('image', file);

      const response = await fetch('/api/upload/product-image', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: form,
      });

      const data = await response.json();
      if (!response.ok) {
        toast.error(data.error || 'Tải ảnh lên thất bại');
        return;
      }

      setFormData((prev) => ({ ...prev, image_url: data.data.image_url }));
      toast.success('Tải ảnh lên thành công');
    } catch (error) {
      toast.error('Không thể tải ảnh lên');
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, image_url: '' }));
    toast.success('Đã xóa ảnh khỏi biểu mẫu');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại');
        router.push('/login');
        return;
      }

      if (!formData.origin.region || !formData.origin.province || !formData.origin.farm_name) {
        toast.error('Vui lòng điền đầy đủ thông tin vùng, tỉnh và tên nông trại');
        return;
      }

      if (!formData.name.trim() || !formData.batch_code.trim()) {
        toast.error('Vui lòng nhập đầy đủ tên sản phẩm và mã lô');
        return;
      }

      const plantingDate = new Date(formData.traceability.planting_date);
      const harvestDate = new Date(formData.traceability.harvest_date);

      if (Number.isNaN(plantingDate.getTime()) || Number.isNaN(harvestDate.getTime())) {
        toast.error('Ngày trồng hoặc ngày thu hoạch không hợp lệ');
        return;
      }

      const plantingDateIso = plantingDate.toISOString();
      const harvestDateIso = harvestDate.toISOString();

      if (harvestDate < plantingDate) {
        toast.error('Ngày thu hoạch không thể trước ngày đóng gói');
        return;
      }

      let certExpiryIso = '';
      if (formData.traceability.certification.cert_expiry) {
        const certExpiryDate = new Date(formData.traceability.certification.cert_expiry);
        if (Number.isNaN(certExpiryDate.getTime())) {
          toast.error('Ngày hết hạn chứng nhận không hợp lệ');
          return;
        }
        certExpiryIso = certExpiryDate.toISOString();
      }

      const trimmedImageUrl = formData.image_url.trim();
      const shouldClearExistingImage = Boolean(
        isEditing && normalizeProductImageUrl(initialData?.image_url) && !trimmedImageUrl
      );
      const normalizedImageUrl = normalizeProductImageUrl(trimmedImageUrl);

      const payload = {
        ...formData,
        name: formData.name.trim(),
        batch_code: formData.batch_code.trim(),
        description: formData.description.trim(),
        image_url: shouldClearExistingImage ? null : normalizedImageUrl || trimmedImageUrl || undefined,
        origin: {
          ...formData.origin,
          province: formData.origin.province.trim(),
          district: formData.origin.district.trim() || undefined,
          farm_name: formData.origin.farm_name.trim(),
          region: normalizePackagingUnit(formData.origin.region),
          producer_name: formData.origin.producer_name.trim() || formData.origin.farm_name.trim(),
          coordinates: {
            lat: Number(formData.origin.coordinates.lat) || 0,
            lng: Number(formData.origin.coordinates.lng) || 0,
          },
        },
        traceability: {
          ...formData.traceability,
          status: normalizeLotStatus(formData.traceability.status),
          planting_date: plantingDateIso,
          harvest_date: harvestDateIso,
          pesticides_used: formData.traceability.pesticides_used
            .split(',')
            .map((p: string) => p.trim())
            .filter(Boolean),
          fertilizer_used: formData.traceability.fertilizer_used
            .split(',')
            .map((f: string) => f.trim())
            .filter(Boolean),
          certification: {
            ...formData.traceability.certification,
            cert_expiry: certExpiryIso || undefined,
          },
        },
      };

      const method = isEditing ? 'PUT' : 'POST';
      const url = isEditing ? `/api/products/${initialData._id}` : '/api/products';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const responseBody = await response.text();
      let data: any = {};
      try {
        data = responseBody ? JSON.parse(responseBody) : {};
      } catch {
        data = {};
      }

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          toast.error('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại');
          router.push('/login');
          return;
        }

        const errorMessage = data?.error || 'Không thể lưu sản phẩm';
        const detailMessage = Array.isArray(data?.details) ? data.details.filter(Boolean).join(' | ') : '';

        // Fallback retry for legacy/malformed status values from old client state.
        if (/Invalid enum value/i.test(errorMessage) && payload.traceability?.status) {
          const retryPayload = {
            ...payload,
            traceability: {
              ...payload.traceability,
              status: 'Đang sơ chế',
            },
          };

          const retryResponse = await fetch(url, {
            method,
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(retryPayload),
          });

          if (retryResponse.ok) {
            const retryData = await retryResponse.json();
            const nextQrCode = retryData?.data?.qr_code || retryData?.meta?.qr_code;
            const nextQrTargetUrl = retryData?.data?.product?.qr_code_url || retryData?.data?.qr_code_url;
            if (nextQrCode) setQrCode(nextQrCode);
            if (nextQrTargetUrl) setQrTargetUrl(nextQrTargetUrl);
            toast.success(isEditing ? 'Sản phẩm đã cập nhật!' : 'Sản phẩm đã tạo!');
            setTimeout(() => router.push('/admin/products'), 1000);
            return;
          }
        }

        toast.error(detailMessage ? `${errorMessage}: ${detailMessage}` : errorMessage);
        return;
      }

      const nextQrCode = data?.data?.qr_code || data?.meta?.qr_code;
      const nextQrTargetUrl = data?.data?.product?.qr_code_url || data?.data?.qr_code_url;

      if (nextQrCode) setQrCode(nextQrCode);
      if (nextQrTargetUrl) setQrTargetUrl(nextQrTargetUrl);

      toast.success(isEditing ? 'Sản phẩm đã cập nhật!' : 'Sản phẩm đã tạo!');
      setTimeout(() => router.push('/admin/products'), 1000);
    } catch (error) {
      toast.error('Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit}>
        <div className="rounded-2xl border border-border bg-card p-5 md:p-7">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xl font-semibold text-foreground">Tên sản phẩm *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="VD: Thanh long ruột đỏ"
                  className="h-14 rounded-xl border-input bg-background text-lg text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/20"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="province" className="text-xl font-semibold text-foreground">Vùng sản xuất *</Label>
                <Input
                  id="province"
                  name="origin.province"
                  value={formData.origin.province}
                  onChange={handleChange}
                  list="provinces-suggestion"
                  placeholder="VD: Bình Thuận"
                  className="h-14 rounded-xl border-input bg-background text-lg text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/20"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="district" className="text-xl font-semibold text-foreground">Khu vực / Quận Huyện</Label>
                <Input
                  id="district"
                  name="origin.district"
                  value={formData.origin.district}
                  onChange={handleChange}
                  list="district-suggestion"
                  placeholder="VD: Cầu Kè"
                  className="h-14 rounded-xl border-input bg-background text-lg text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="origin_lat" className="text-xl font-semibold text-foreground">Diện tích canh tác (ha)</Label>
                <Input
                  id="origin_lat"
                  name="origin.coordinates.lat"
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.origin.coordinates.lat}
                  onChange={handleChange}
                  className="h-14 rounded-xl border-input bg-background text-lg text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="origin_lng" className="text-xl font-semibold text-foreground">Khối lượng lô (kg)</Label>
                <Input
                  id="origin_lng"
                  name="origin.coordinates.lng"
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.origin.coordinates.lng}
                  onChange={handleChange}
                  className="h-14 rounded-xl border-input bg-background text-lg text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="planting_date" className="text-xl font-semibold text-foreground">Ngày đóng gói</Label>
                <Input
                  id="planting_date"
                  name="traceability.planting_date"
                  type="date"
                  value={formData.traceability.planting_date}
                  onChange={handleChange}
                  className="h-14 rounded-xl border-input bg-background text-lg text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/20"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="certifier" className="text-xl font-semibold text-foreground">Chứng nhận</Label>
                <Input
                  id="certifier"
                  name="traceability.certification.certifier"
                  value={formData.traceability.certification.certifier}
                  onChange={handleChange}
                  list="certifiers-suggestion"
                  placeholder="VietGAP, GlobalGAP, Organic... (cách bằng dấu phẩy)"
                  className="h-14 rounded-xl border-input bg-background text-lg text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pesticides_used" className="text-xl font-semibold text-foreground">Thuốc BVTV đã dùng</Label>
                <Input
                  id="pesticides_used"
                  name="traceability.pesticides_used"
                  value={formData.traceability.pesticides_used}
                  onChange={handleChange}
                  list="pesticides-suggestion"
                  placeholder="VD: Abamectin, Neem Oil"
                  className="h-14 rounded-xl border-input bg-background text-lg text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/20"
                />
              </div>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="batch_code" className="text-xl font-semibold text-foreground">Mã lô *</Label>
                <Input
                  id="batch_code"
                  name="batch_code"
                  value={formData.batch_code}
                  onChange={handleChange}
                  list="batch-code-suggestion"
                  placeholder="VD: LO-2026-001"
                  className="h-14 rounded-xl border-input bg-background text-lg text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/20"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="farm_name" className="text-xl font-semibold text-foreground">Tên hộ / Trang trại</Label>
                <Input
                  id="farm_name"
                  name="origin.farm_name"
                  value={formData.origin.farm_name}
                  onChange={handleChange}
                  list="farm-suggestion"
                  placeholder="VD: HTX Bình Thạnh"
                  className="h-14 rounded-xl border-input bg-background text-lg text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/20"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="producer_name" className="text-xl font-semibold text-foreground">Người phụ trách lô</Label>
                <Input
                  id="producer_name"
                  name="origin.producer_name"
                  value={formData.origin.producer_name}
                  onChange={handleChange}
                  list="producers-suggestion"
                  placeholder="VD: Nguyễn Văn A"
                  className="h-14 rounded-xl border-input bg-background text-lg text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="harvest_date" className="text-xl font-semibold text-foreground">Ngày thu hoạch *</Label>
                <Input
                  id="harvest_date"
                  name="traceability.harvest_date"
                  type="date"
                  value={formData.traceability.harvest_date}
                  onChange={handleChange}
                  className="h-14 rounded-xl border-input bg-background text-lg text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/20"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="region" className="text-xl font-semibold text-foreground">Đơn vị sơ chế / đóng gói *</Label>
                <Input
                  id="region"
                  name="origin.region"
                  value={formData.origin.region}
                  onChange={handleChange}
                  list="regions-suggestion"
                  placeholder="Tên đơn vị đóng gói"
                  className="h-14 rounded-xl border-input bg-background text-lg text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/20"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cert_expiry" className="text-xl font-semibold text-foreground">Hạn sử dụng</Label>
                <Input
                  id="cert_expiry"
                  name="traceability.certification.cert_expiry"
                  type="date"
                  value={formData.traceability.certification.cert_expiry}
                  onChange={handleChange}
                  className="h-14 rounded-xl border-input bg-background text-lg text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cert_number" className="text-xl font-semibold text-foreground">Số chứng nhận</Label>
                <Input
                  id="cert_number"
                  name="traceability.certification.cert_number"
                  value={formData.traceability.certification.cert_number}
                  onChange={handleChange}
                  placeholder="VD: VG-2026-001"
                  className="h-14 rounded-xl border-input bg-background text-lg text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status" className="text-xl font-semibold text-foreground">Trạng thái hiện tại</Label>
                <Select
                  value={formData.traceability.status || 'Đang sơ chế'}
                  onValueChange={(value) => handleSelectChange('traceability.status', value)}
                >
                  <SelectTrigger
                    id="status"
                    className="h-14 w-full rounded-xl border-input bg-background text-lg text-foreground focus-visible:border-ring focus-visible:ring-ring/20"
                  >
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Đang lưu thông">Đang lưu thông</SelectItem>
                    <SelectItem value="Đang sơ chế">Đang sơ chế</SelectItem>
                    <SelectItem value="Đã bán hết">Đã bán hết</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fertilizer_used" className="text-xl font-semibold text-foreground">Phân bón đã dùng</Label>
                <Input
                  id="fertilizer_used"
                  name="traceability.fertilizer_used"
                  value={formData.traceability.fertilizer_used}
                  onChange={handleChange}
                  list="fertilizers-suggestion"
                  placeholder="VD: NPK 16-16-8, Phân hữu cơ"
                  className="h-14 rounded-xl border-input bg-background text-lg text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/20"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-2">
            <Label htmlFor="description" className="text-xl font-semibold text-foreground">Ghi chú thêm</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder="Điều kiện bảo quản, phương pháp canh tác..."
              className="rounded-xl border-input bg-background text-lg text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/20"
            />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="image_url" className="text-sm font-medium text-muted-foreground">URL ảnh sản phẩm</Label>
              <Input
                id="image_url"
                name="image_url"
                type="text"
                value={formData.image_url}
                onChange={handleChange}
                placeholder="Đường dẫn ảnh sẽ tự điền sau khi tải từ máy"
                className="h-12 rounded-xl border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image_upload" className="text-sm font-medium text-muted-foreground">Tải ảnh từ máy</Label>
              <Input
                id="image_upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploadingImage}
                className="h-12 rounded-xl border-input bg-background text-foreground file:text-foreground"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRemoveImage}
                disabled={uploadingImage || !formData.image_url.trim()}
                className="mt-2"
              >
                Xóa ảnh
              </Button>
            </div>
          </div>

          {previewImageUrl && (
            <div className="mt-4 rounded-xl border border-border/70 bg-muted/20 p-3">
              <p className="mb-2 text-sm font-medium text-muted-foreground">Xem trước ảnh sản phẩm</p>
              <div className="relative h-48 w-full overflow-hidden rounded-lg bg-muted md:h-56">
                <Image
                  src={previewImageUrl}
                  alt="Xem trước ảnh sản phẩm"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          )}

          <div className="mt-8 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="h-11 border-input bg-transparent px-6 text-xl text-foreground hover:bg-muted"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="h-11 px-6 text-xl font-semibold"
            >
              {loading ? 'Đang lưu...' : isEditing ? 'Cập nhật lô hàng' : 'Tạo lô hàng'}
            </Button>
          </div>
        </div>
      </form>

      {qrCode && (
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="mb-4 text-xl font-semibold text-foreground">Mã QR Code Được Tạo</h3>
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-64 h-64">
              <Image
                src={qrCode}
                alt="Mã QR Code"
                fill
                className="object-contain"
              />
            </div>
            <a href={qrCode} download="qr-code.png">
              <Button variant="outline" className="border-input text-foreground hover:bg-muted">Tải Mã QR Code</Button>
            </a>
            {qrTargetUrl && (
              <a href={qrTargetUrl} target="_blank" rel="noreferrer" className="text-sm text-primary underline underline-offset-4">
                Xem trang truy xuất khi quét mã
              </a>
            )}
          </div>
        </div>
      )}

      <datalist id="regions-suggestion">
        {suggestions.regions.map((item) => (
          <option key={item} value={item} />
        ))}
      </datalist>

      <datalist id="provinces-suggestion">
        {provinceSuggestions.map((item) => (
          <option key={item} value={item} />
        ))}
      </datalist>

      <datalist id="district-suggestion">
        {districtSuggestions.map((item) => (
          <option key={item} value={item} />
        ))}
      </datalist>

      <datalist id="batch-code-suggestion">
        {suggestions.batchCodes.map((item) => (
          <option key={item} value={item} />
        ))}
      </datalist>

      <datalist id="farm-suggestion">
        {suggestions.farmNames.map((item) => (
          <option key={item} value={item} />
        ))}
      </datalist>

      <datalist id="producers-suggestion">
        {suggestions.producerNames.map((item) => (
          <option key={item} value={item} />
        ))}
      </datalist>

      <datalist id="certifiers-suggestion">
        {suggestions.certifiers.map((item) => (
          <option key={item} value={item} />
        ))}
      </datalist>

      <datalist id="pesticides-suggestion">
        {suggestions.pesticides.map((item) => (
          <option key={item} value={item} />
        ))}
      </datalist>

      <datalist id="fertilizers-suggestion">
        {suggestions.fertilizers.map((item) => (
          <option key={item} value={item} />
        ))}
      </datalist>
    </div>
  );
}
