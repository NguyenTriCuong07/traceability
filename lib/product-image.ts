const HTTP_URL_REGEX = /^https?:\/\//i;

export const normalizeProductImageUrl = (value?: string | null): string => {
    const cleaned = value?.trim() || '';
    if (!cleaned) return '';

    if (cleaned.startsWith('/') || HTTP_URL_REGEX.test(cleaned)) {
        return cleaned;
    }

    return '';
};

export const toAbsoluteProductImageUrl = (imageUrl: string, baseUrl: string): string => {
    if (HTTP_URL_REGEX.test(imageUrl)) {
        return imageUrl;
    }

    const normalizedBase = baseUrl.replace(/\/$/, '');
    const normalizedPath = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
    return `${normalizedBase}${normalizedPath}`;
};
