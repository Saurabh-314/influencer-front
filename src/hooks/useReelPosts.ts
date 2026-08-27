import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/api/axios';

export type ReelPostTarget = {
    id: number;
    reel_post_id: number;
    social_account_id: number;
    caption?: string | null;
    first_comment?: string | null;
    scheduled_at?: string | null;
    enabled: boolean;
    status: 'draft' | 'scheduled' | 'processing' | 'published' | 'failed' | 'cancelled';
    instagram_media_id?: string | null;
    permalink?: string | null;
    error_message?: string | null;
    published_at?: string | null;
    social_account?: {
        id: number | string;
        username: string;
        display_name?: string;
        profile_image?: string;
        followers_count?: number;
        account_type?: string;
        is_connected?: boolean;
    };
};

export type ReelPost = {
    id: number;
    user_id: number;
    video_url: string;
    video_filename?: string | null;
    original_filename?: string | null;
    video_mime?: string | null;
    video_size?: number | null;
    duration_seconds?: number | null;
    width?: number | null;
    height?: number | null;
    thumbnail_url?: string | null;
    caption?: string | null;
    hashtags?: string[] | null;
    use_same_caption: boolean;
    suggest_hashtags: boolean;
    add_first_comment: boolean;
    first_comment?: string | null;
    status: 'draft' | 'scheduled' | 'publishing' | 'published' | 'failed' | 'cancelled';
    createdAt?: string;
    updatedAt?: string;
    targets?: ReelPostTarget[];
};

export type ReelUploadResult = {
    video_url: string;
    video_filename: string;
    original_filename?: string | null;
    video_mime?: string | null;
    video_size?: number | null;
    thumbnail_url?: string | null;
    duration_seconds?: number | null;
    width?: number | null;
    height?: number | null;
};

export type ReelPostPayload = {
    video_url: string;
    video_filename?: string | null;
    original_filename?: string | null;
    video_mime?: string | null;
    video_size?: number | null;
    duration_seconds?: number | null;
    width?: number | null;
    height?: number | null;
    thumbnail_url?: string | null;
    caption?: string;
    hashtags?: string[];
    use_same_caption?: boolean;
    suggest_hashtags?: boolean;
    add_first_comment?: boolean;
    first_comment?: string;
    status: 'draft' | 'scheduled';
    targets: {
        social_account_id: number;
        caption?: string;
        first_comment?: string;
        scheduled_at?: string | null;
        enabled?: boolean;
    }[];
};

export function useReelPosts() {
    return useQuery({
        queryKey: ['reel-posts'],
        queryFn: async () => {
            const res = await api.get('/reels');
            return res.data.data as ReelPost[];
        },
        refetchInterval: 20_000,
    });
}

export function useUploadReelMedia() {
    return useMutation({
        mutationFn: async ({
            file,
            thumbnail,
            meta,
        }: {
            file: File;
            thumbnail?: Blob | null;
            meta?: { duration_seconds?: number; width?: number; height?: number };
        }) => {
            const formData = new FormData();
            formData.append('video', file, file.name);
            formData.append('original_filename', file.name);
            if (thumbnail) {
                formData.append('thumbnail', thumbnail, 'thumb.jpg');
            }
            if (meta?.duration_seconds) {
                formData.append('duration_seconds', String(meta.duration_seconds));
            }
            if (meta?.width) formData.append('width', String(meta.width));
            if (meta?.height) formData.append('height', String(meta.height));

            const res = await api.post('/reels/media', formData);
            return res.data.data as ReelUploadResult;
        },
    });
}

export function useSaveBulkReelPosts() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            status,
            stopOnFail,
            posts,
        }: {
            status: 'draft' | 'scheduled';
            stopOnFail?: boolean;
            posts: ReelPostPayload[];
        }) => {
            const res = await api.post('/reels/bulk', {
                status,
                stop_on_fail: Boolean(stopOnFail),
                posts,
            });
            const data = res.data.data || {};
            return {
                posts: (Array.isArray(data) ? data : data.posts || []) as ReelPost[],
                errors: (Array.isArray(data) ? [] : data.errors || []) as { index: number; message: string }[],
                message: res.data.message as string | undefined,
            };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reel-posts'] });
        },
    });
}

export function useSaveReelPost() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, payload }: { id?: number; payload: ReelPostPayload }) => {
            const res = id
                ? await api.put(`/reels/${id}`, payload)
                : await api.post('/reels', payload);
            return res.data.data as ReelPost;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reel-posts'] });
        },
    });
}

export function useCancelReelPost() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => {
            await api.delete(`/reels/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reel-posts'] });
        },
    });
}

export function useRetryReelTarget() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (targetId: number) => {
            const res = await api.post(`/reels/targets/${targetId}/retry`);
            return res.data.data as ReelPost;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reel-posts'] });
        },
    });
}
