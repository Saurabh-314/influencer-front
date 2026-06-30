import { useQuery } from '@tanstack/react-query';
import api from '@/api/axios';
import type { CampaignSubmission } from '@/hooks/useCampaigns';

export type CreatorSubmissionStatusFilter = 'all' | 'applied' | 'pending' | 'approved' | 'rejected';
export type CreatorSubmissionSortField = 'createdAt' | 'applied_at' | 'submitted_at' | 'approved_at';
export type CreatorSubmissionSortOrder = 'asc' | 'desc';

export interface CreatorSubmissionListMeta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    counts: {
        applied: number;
        pending: number;
        approved: number;
        rejected: number;
        all: number;
    };
}

export interface CreatorCampaignListParams {
    page?: number;
    limit?: number;
    status?: CreatorSubmissionStatusFilter;
    sort?: CreatorSubmissionSortField;
    order?: CreatorSubmissionSortOrder;
    dateFrom?: string;
    dateTo?: string;
}

export function useCreatorCampaignList({
    page = 1,
    limit = 10,
    status = 'all',
    sort = 'createdAt',
    order = 'desc',
    dateFrom,
    dateTo,
}: CreatorCampaignListParams) {
    return useQuery({
        queryKey: ['creator-campaign-list', page, limit, status, sort, order, dateFrom, dateTo],
        queryFn: async () => {
            const params: Record<string, string | number> = { page, limit, sort, order };
            if (status !== 'all') params.status = status;
            if (dateFrom) params.date_from = dateFrom;
            if (dateTo) params.date_to = dateTo;
            if (status === 'applied') params.date_field = 'applied_at';
            else if (status === 'approved') params.date_field = 'approved_at';
            else if (status === 'pending' || status === 'rejected') params.date_field = 'submitted_at';
            else params.date_field = 'createdAt';

            const res = await api.get('/submissions/mine', { params });
            return {
                submissions: res.data.data as CampaignSubmission[],
                meta: res.data.meta as CreatorSubmissionListMeta,
            };
        },
    });
}
