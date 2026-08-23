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

export function useInstagramAccount() {
    const query = useSocialAccounts();
    const instagram = query.data?.find(
        (account) => account.platform === 'instagram' && account.is_connected
    );
    return { ...query, instagram };
}

export function useConnectInstagram(returnTo: 'accounts' | 'creator' | 'onboarding' = 'accounts') {
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
