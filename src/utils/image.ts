export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
export const MAX_IMAGE_SIZE_MB = 5;
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
export const ACCEPTED_IMAGE_EXTENSIONS = '.jpg,.jpeg,.png,.webp';

export function resolveAssetUrl(path?: string | null): string {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('blob:')) {
        return path;
    }

    const normalizedPath = path.startsWith('/') ? path : `/${path}`;

    // In dev, serve uploads through Vite proxy (same origin, avoids CORP/CORS issues)
    if (import.meta.env.DEV && normalizedPath.startsWith('/uploads/')) {
        return normalizedPath;
    }

    const assetsBase =
        import.meta.env.VITE_ASSETS_BASE_URL ||
        import.meta.env.VITE_API_BASE_URL?.replace(/\/api\/?$/, '') ||
        'http://localhost:5000';

    return `${assetsBase.replace(/\/$/, '')}${normalizedPath}`;
}

export function validateImageFile(file: File): string | null {
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        return 'Invalid file type. Please upload JPG, PNG, or WEBP.';
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
        return `File is too large. Maximum size is ${MAX_IMAGE_SIZE_MB}MB.`;
    }
    return null;
}

export function formatFileSize(bytes: number): string {
    if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${bytes} B`;
}

type CompressOptions = {
    maxWidth: number;
    maxHeight: number;
    quality: number;
};

const UPLOAD_COMPRESS_PRESETS: Record<'brand_logo' | 'track_artwork', CompressOptions> = {
    brand_logo: { maxWidth: 1024, maxHeight: 1024, quality: 0.85 },
    track_artwork: { maxWidth: 1200, maxHeight: 1200, quality: 0.82 },
};

/** Compress in browser before upload — keeps payloads under typical nginx 1MB limits. */
export async function compressImageForUpload(
    file: Blob,
    type: 'brand_logo' | 'track_artwork',
): Promise<Blob> {
    const preset = UPLOAD_COMPRESS_PRESETS[type];

    if (file.size <= 700 * 1024 && file.type === 'image/webp') {
        return file;
    }

    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, preset.maxWidth / bitmap.width, preset.maxHeight / bitmap.height);
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        bitmap.close();
        throw new Error('Could not prepare image for upload');
    }

    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    return new Promise((resolve, reject) => {
        canvas.toBlob(
            (blob) => {
                if (!blob) {
                    reject(new Error('Could not compress image'));
                    return;
                }
                resolve(blob);
            },
            'image/webp',
            preset.quality,
        );
    });
}

export function getUploadErrorMessage(error: unknown): string {
    const err = error as { response?: { status?: number; data?: { message?: string } } };
    if (err.response?.status === 413) {
        return 'Upload rejected by server (file too large). Try a smaller image or ask admin to raise nginx client_max_body_size.';
    }
    return err.response?.data?.message || 'Upload failed';
}
