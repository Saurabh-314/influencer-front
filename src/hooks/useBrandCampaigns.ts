import { useQuery } from '@tanstack/react-query';
import api from '@/api/axios';

export interface RankAllocation {
    qty: number;
    rank: number;
    range: string;
    payout: number;
    color: string;
}

export interface CampaignSubmissionStats {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
}

export interface BrandCampaign {
    id: number;
    title: string;
    description: string;
    campaign_type: string;
    brand_name: string;
    brand_logo_url?: string;
    track_artwork_url?: string;
    total_budget: string | number;
    bonus_target_views?: string;
    bonus_reward?: string;
    audience_gender?: string;
    audience_age?: string;
    status: 'active' | 'draft' | 'completed' | 'paused';
    start_date: string;
    end_date: string;
    rank_allocations: RankAllocation[];
    submission_stats?: CampaignSubmissionStats;
}

export interface BrandCampaignListMeta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    counts: {
        active: number;
        draft: number;
        completed: number;
        paused: number;
        all: number;
    };
}

export type CampaignStatusFilter = 'all' | 'active' | 'draft' | 'completed' | 'paused';
export type CampaignSortField = 'createdAt' | 'end_date' | 'start_date' | 'total_budget' | 'title';
export type CampaignSortOrder = 'asc' | 'desc';
export type CampaignDateField = 'end_date' | 'start_date' | 'createdAt';

export interface BrandCampaignListParams {
    page?: number;
    limit?: number;
    status?: CampaignStatusFilter;
    sort?: CampaignSortField;
    order?: CampaignSortOrder;
    dateFrom?: string;
    dateTo?: string;
    dateField?: CampaignDateField;
}

export function getCreatorSlots(campaign: BrandCampaign): number {
    return campaign.rank_allocations?.reduce((sum, r) => sum + (r.qty || 0), 0) ?? 0;
}

export function useBrandCampaigns({
    page = 1,
    limit = 10,
    status = 'all',
    sort = 'createdAt',
    order = 'desc',
    dateFrom,
    dateTo,
    dateField = 'end_date',
}: BrandCampaignListParams) {
    return useQuery({
        queryKey: ['brand-campaigns', page, limit, status, sort, order, dateFrom, dateTo, dateField],
        queryFn: async () => {
            const params: Record<string, string | number> = { page, limit, sort, order, date_field: dateField };
            if (status !== 'all') params.status = status;
            if (dateFrom) params.date_from = dateFrom;
            if (dateTo) params.date_to = dateTo;

            const res = await api.get('/campaigns', { params });
            return {
                campaigns: res.data.data as BrandCampaign[],
                meta: res.data.meta as BrandCampaignListMeta,
            };
        },
    });
}
