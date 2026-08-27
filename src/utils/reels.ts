import type { ReelPost } from '@/hooks/useReelPosts';

export const HASHTAG_SUGGESTIONS = ['#creator', '#reels', '#music', '#lifestyle', '#india', '#viral'];
export const DEFAULT_TIMES = ['18:30', '12:15', '20:00'];
export const MAX_REEL_BYTES = 100 * 1024 * 1024;
export const MAX_BULK_REELS = 50;
export const ALLOWED_REEL_TYPES = ['video/mp4', 'video/quicktime', 'video/x-m4v'];

export type AccountSchedule = {
    date: string;
    time: string;
    caption: string;
};

export function pad(value: number) {
    return String(value).padStart(2, '0');
}

export function istDateParts(date = new Date()) {
    const parts = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    }).formatToParts(date);
    const get = (type: string) => parts.find((part) => part.type === type)?.value || '';
    return {
        date: `${get('year')}-${get('month')}-${get('day')}`,
        time: `${get('hour')}:${get('minute')}`,
    };
}

export function addIstDays(days: number) {
    const now = new Date();
    now.setDate(now.getDate() + days);
    return istDateParts(now).date;
}

export function addCalendarDays(dateStr: string, days: number) {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(Date.UTC(year, (month || 1) - 1, (day || 1) + days));
    return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

export function toIstIso(date: string, time: string) {
    return `${date}T${time}:00+05:30`;
}

export function isScheduleBeforeNow(date: string, time: string) {
    if (!date || !time) return true;
    const now = istDateParts();
    return toIstIso(date, time) < toIstIso(now.date, now.time);
}

export function clampSchedule(date: string, time: string, caption = ''): AccountSchedule {
    if (!isScheduleBeforeNow(date, time)) return { date, time, caption };
    const now = istDateParts();
    return { date: now.date, time: now.time, caption };
}

export function defaultSchedule(index: number, caption = ''): AccountSchedule {
    return clampSchedule(addIstDays(index), DEFAULT_TIMES[index % DEFAULT_TIMES.length], caption);
}

export function staggerSchedule(index: number, baseDate: string, baseTime: string, caption = ''): AccountSchedule {
    const [hours, minutes] = (baseTime || '18:00').split(':').map(Number);
    const total = (hours || 0) * 60 + (minutes || 0) + index * 15;
    const extraDays = Math.floor(total / (24 * 60));
    const mins = ((total % (24 * 60)) + 24 * 60) % (24 * 60);
    return clampSchedule(
        addCalendarDays(baseDate || addIstDays(0), extraDays),
        `${pad(Math.floor(mins / 60))}:${pad(mins % 60)}`,
        caption,
    );
}

export function formatIstLabel(iso?: string | null) {
    if (!iso) return '—';
    const value = new Date(iso);
    return new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Kolkata',
        day: 'numeric',
        month: 'short',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    })
        .format(value)
        .replace(',', ' ·');
}

export function formatDuration(seconds?: number | null) {
    if (!seconds || !Number.isFinite(seconds)) return '0:00';
    const total = Math.max(0, Math.round(seconds));
    return `${Math.floor(total / 60)}:${pad(total % 60)}`;
}

export function isAllowedReelFile(file: File) {
    return ALLOWED_REEL_TYPES.includes(file.type) || /\.(mp4|mov|m4v)$/i.test(file.name);
}

export async function readVideoMeta(file: File) {
    const previewUrl = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    video.src = previewUrl;

    await new Promise<void>((resolve, reject) => {
        video.onloadedmetadata = () => resolve();
        video.onerror = () => reject(new Error('Could not read this video file'));
    });

    const duration = video.duration;
    const width = video.videoWidth;
    const height = video.videoHeight;
    video.currentTime = Math.min(0.5, Number.isFinite(duration) ? duration * 0.08 : 0.1);

    await new Promise<void>((resolve) => {
        video.onseeked = () => resolve();
        setTimeout(resolve, 900);
    });

    const canvas = document.createElement('canvas');
    canvas.width = width || 1080;
    canvas.height = height || 1920;
    canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height);
    const thumbnail = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.82);
    });

    return { previewUrl, duration, width, height, thumbnail };
}

export function shuffle<T>(items: T[]): T[] {
    const next = [...items];
    for (let i = next.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [next[i], next[j]] = [next[j], next[i]];
    }
    return next;
}

export function queueStatus(post: ReelPost) {
    const statuses = (post.targets || []).filter((item) => item.enabled).map((item) => item.status);
    if (statuses.includes('processing') || post.status === 'publishing') return 'Publishing';
    if (statuses.includes('failed') || post.status === 'failed') return 'Failed';
    if (statuses.includes('scheduled') || post.status === 'scheduled') return 'Scheduled';
    if (statuses.every((status) => status === 'published') || post.status === 'published') return 'Published';
    if (post.status === 'cancelled') return 'Cancelled';
    return 'Draft';
}

export function statusClass(status: string) {
    const value = status.toLowerCase();
    if (value === 'scheduled' || value === 'publishing' || value === 'processing' || value === 'queued') {
        return 'bg-[#eef5ff] text-[#47658e]';
    }
    if (value === 'published' || value === 'ready') return 'bg-[#eaf9f1] text-[#15945a]';
    if (value === 'failed' || value === 'error') return 'bg-[#fff0f0] text-[#c23b3b]';
    if (value === 'warning' || value === 'needs attention') return 'bg-[#fff4df] text-[#9b711d]';
    return 'bg-[#f4f4f6] text-[#777a83]';
}
