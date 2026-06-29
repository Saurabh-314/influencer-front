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
