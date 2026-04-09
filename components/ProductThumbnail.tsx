'use client';

import Image from 'next/image';
import { normalizeProductImageUrl } from '@/lib/product-image';

interface ProductThumbnailProps {
    imageUrl?: string;
    alt: string;
    className?: string;
    emptyText?: string;
}

export function ProductThumbnail({
    imageUrl,
    alt,
    className = 'h-12 w-12',
    emptyText = 'N/A',
}: ProductThumbnailProps) {
    const normalizedImageUrl = normalizeProductImageUrl(imageUrl);

    return (
        <div className={`relative shrink-0 overflow-hidden rounded-lg border bg-muted ${className}`}>
            {normalizedImageUrl ? (
                <Image
                    src={normalizedImageUrl}
                    alt={alt}
                    fill
                    className="object-cover"
                />
            ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">{emptyText}</div>
            )}
        </div>
    );
}
