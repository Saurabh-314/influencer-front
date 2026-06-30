import { useQuery } from '@tanstack/react-query';
import api from '@/api/axios';
import type { BrandCampaign, CampaignSubmissionStats } from '@/hooks/useBrandCampaigns';
import type { BrandSubmission } from '@/hooks/useCampaignSubmissions';

export interface BrandOverviewData {
    wallet: {
        balance: number;
        locked_balance: number;
    };
    campaignCounts: {
        active: number;
        draft: number;
        completed: number;
        paused: number;
        all: number;
    };
    pendingSubmissionsCount: number;
    totalSpent: number;
    recentPending: BrandSubmission[];
    activeCampaigns: (Pick<BrandCampaign, 'id' | 'title' | 'end_date' | 'total_budget' | 'track_artwork_url' | 'brand_name' | 'campaign_type' | 'status'> & {
        submission_stats?: CampaignSubmissionStats;
    })[];
}

export function useBrandOverview() {
    return useQuery({
        queryKey: ['brand-overview'],
        queryFn: async () => {
            const res = await api.get('/analytics/brand-overview');
            return res.data.data as BrandOverviewData;
        },
    });
}
