import { useQuery } from '@tanstack/react-query';
import api from '@/api/axios';

export interface RankAllocation {
    rank: number;
    range: string;
    payout: number;
    qty: number;
    color: string;
}

export interface Campaign {
    id: number;
    title: string;
    description: string;
    campaign_type: string;
    brand_name: string;
    genre: string;
    spotify_link?: string;
    hashtags?: string;
    track_artwork_url?: string;
    rank_allocations: RankAllocation[];
    status: string;
    start_date: string;
    end_date: string;
}

export interface CampaignSubmission {
    id: number;
    campaign_id: number;
    views: number;
    status: 'pending' | 'approved' | 'rejected';
    approved_at?: string;
    createdAt: string;
    campaign?: Campaign;
}

const RANK_BG_COLORS = ['bg-[#FF5A5F]', 'bg-[#FFA542]', 'bg-[#FBBF24]', 'bg-[#87D8FF]'];

export function getPayoutForRank(campaign: Campaign | undefined, userRank: number): number {
    const allocation = campaign?.rank_allocations?.find((r) => r.rank === userRank);
    return allocation?.payout ?? 0;
}

export function getCampaignColor(campaign: Campaign, userRank: number): string {
    const allocation = campaign.rank_allocations?.find((r) => r.rank === userRank);
    if (allocation?.color) {
        const bgMatch = allocation.color.match(/bg-\S+/);
        if (bgMatch) return bgMatch[0];
    }
    return RANK_BG_COLORS[userRank - 1] ?? RANK_BG_COLORS[3];
}

export function useCampaigns() {
    return useQuery({
        queryKey: ['campaigns'],
        queryFn: async () => {
            const res = await api.get('/campaigns');
            return res.data.data as Campaign[];
        },
    });
}

export function useMySubmissions() {
    return useQuery({
        queryKey: ['my-submissions'],
        queryFn: async () => {
            const res = await api.get('/submissions/mine');
            return res.data.data as CampaignSubmission[];
        },
    });
}

export interface CreatorEarnings {
    totalEarned: number;
    balance: number;
    userRank: number;
}

export function useCreatorEarnings(enabled = true) {
    return useQuery({
        queryKey: ['creator-earnings'],
        queryFn: async () => {
            const res = await api.get('/analytics/earnings');
            return res.data.data as CreatorEarnings;
        },
        enabled,
    });
}
