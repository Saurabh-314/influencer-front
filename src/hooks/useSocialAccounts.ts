import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api/axios';
import type { SocialAccountRecord } from '@/utils/creator';

export function useSocialAccounts() {
    return useQuery({
        queryKey: ['social-accounts'],
        queryFn: async () => {
            const res = await api.get('/social-accounts');
            return res.data.data as SocialAccountRecord[];
        },
    });
}

export function useInstagramAccounts() {
    const query = useSocialAccounts();
    const accounts = (query.data ?? []).filter(
        (account) => account.platform === 'instagram' && account.is_connected,
    );
    return { ...query, accounts };
}

export function useInstagramAccount() {
    const query = useInstagramAccounts();
    return { ...query, instagram: query.accounts[0] };
}

export function useConnectInstagram(
    returnTo: 'accounts' | 'creator' | 'onboarding' | 'reel-studio' | 'bulk-reels' | 'settings' = 'accounts',
) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            const res = await api.get(`/social-accounts/connect/instagram?returnTo=${returnTo}`);
            if (res.data.url) {
                window.location.href = res.data.url;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['social-accounts'] });
        },
    });
}

export type MetaStatus = {
    connected: boolean;
    instagram_professional_account: boolean;
    page_connected: boolean;
    can_use_reels_studio: boolean;
    accounts: SocialAccountRecord[];
};

export function useMetaStatus() {
    return useQuery({
        queryKey: ['social-accounts', 'meta-status'],
        queryFn: async () => {
            const res = await api.get('/social-accounts/meta/status');
            return res.data.data as MetaStatus;
        },
    });
}

export function useConnectMeta(
    returnTo: 'accounts' | 'creator' | 'onboarding' | 'reel-studio' | 'bulk-reels' | 'settings' = 'reel-studio',
) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            const res = await api.get(`/social-accounts/connect/meta?returnTo=${returnTo}`);
            if (res.data.url) {
                window.location.href = res.data.url;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['social-accounts'] });
        },
    });
}

export type InstagramAudioTrack = {
    audio_id: string;
    title: string;
    artist?: string | null;
    thumbnail_url?: string | null;
    duration_ms?: number | null;
    audio_type?: string | null;
    preview_url?: string | null;
    download_url?: string | null;
};

export function useSearchInstagramAudio(accountId?: string | number) {
    return useMutation({
        mutationFn: async ({
            q,
            audioType = 'music',
        }: {
            q?: string;
            audioType?: 'music' | 'original_sound';
        }) => {
            if (!accountId) {
                throw new Error('Connect an Instagram account to search music');
            }
            const res = await api.get(`/social-accounts/${accountId}/audio`, {
                params: { q: q || undefined, audio_type: audioType },
            });
            return res.data.data as InstagramAudioTrack[];
        },
    });
}

export function useDisconnectAccount() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (accountId: string | number) => {
            await api.delete(`/social-accounts/${accountId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['social-accounts'] });
        },
    });
}

export interface ReelItem {
    id: string;
    media_url?: string;
    thumbnail_url?: string;
    permalink?: string;
    caption?: string;
    timestamp?: string;
    like_count?: number;
    comments_count?: number;
    views?: number;
    bucket?: string;
}

export function useAccountReels(accountId?: string | number, bucket: string = 'total') {
    return useQuery({
        queryKey: ['account-reels', accountId, bucket],
        queryFn: async () => {
            const res = await api.get(`/social-accounts/${accountId}/reels`, {
                params: { bucket },
            });
            return res.data.data.reels as ReelItem[];
        },
        enabled: !!accountId && bucket !== 'total',
        staleTime: 5 * 60 * 1000,
    });
}

export function useSyncAccount(accountId?: string) {
    return useQuery({
        queryKey: ['social-account-sync', accountId],
        queryFn: async () => {
            const res = await api.post(`/social-accounts/${accountId}/sync`);
            return res.data.data;
        },
        enabled: !!accountId,
    });
}
