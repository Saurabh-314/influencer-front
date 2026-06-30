export interface RankAllocation {
    rank: number;
    range: string;
    payout: number;
    qty: number;
    color: string;
}

export interface CampaignFormData {
    title: string;
    spotify_link: string;
    genre: string;
    required_tags: string;
    hashtags: string;
    description: string;
    brand_name: string;
    brand_logo_url: string;
    track_artwork_url: string;
    bonus_target_views: string;
    bonus_reward: number;
    bonus_max_creators: number;
    audience_gender: string;
    audience_age: string;
    specific_creators: string;
    total_budget: number;
    rank_allocations: RankAllocation[];
}

export interface CampaignCheckoutSummary {
    totalLiability: number;
    baseAllocationsTotal: number;
    bonusPoolTotal: number;
    expectedReels: number;
}

export interface CampaignCheckoutState {
    formData: CampaignFormData;
    summary: CampaignCheckoutSummary;
}

export function buildCampaignPayload(formData: CampaignFormData, totalLiability: number) {
    return {
        ...formData,
        total_budget: Math.max(Number(formData.total_budget), totalLiability),
        campaign_type: 'reel' as const,
        start_date: new Date(),
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    };
}
