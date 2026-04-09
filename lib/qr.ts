import QRCode from 'qrcode';

export function getAppBaseUrl(): string {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  return baseUrl.replace(/\/+$/, '');
}

export function buildProductTraceUrl(slug: string): string {
  return `${getAppBaseUrl()}/product/${slug.toLowerCase()}`;
}

export async function generateQRCode(url: string): Promise<string> {
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(url, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 0.95,
      margin: 1,
      width: 300,
    });
    return qrCodeDataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
}

export function generateSlug(name: string, batchCode: string): string {
  const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const nameSlug = name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 50);

  const batchSlug = batchCode
    .toLowerCase()
    .replace(/[^\w-]/g, '')
    .slice(0, 30);

  return `${nameSlug}-${batchSlug}-${timestamp}`.slice(0, 100);
}
