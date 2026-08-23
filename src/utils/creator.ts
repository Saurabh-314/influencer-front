export type VusicRank = {
    rank: number;
    label: string;
};

export type ReelsStats = {
    total: number;
    '>1k': number;
    '>10k': number;
    '>100k': number;
    '>1m': number;
    '>10m': number;
};

export type InstagramMedia = {
    id?: string;
    media_type?: string;
    media_product_type?: string;
    like_count?: number;
    comments_count?: number;
    insights?: { name: string; values: { value: number }[] }[];
};

export type SocialAccountRecord = {
    id: string;
    platform: string;
    username: string;
    display_name?: string;
    profile_image?: string;
    followers_count?: number;
    engagement_rate?: number;
    is_connected?: boolean;
    createdAt?: string;
};

export function formatCount(value: number): string {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
    if (value >= 1_000) return `${Math.round(value / 1_000)}K`;
    return value.toLocaleString();
}

export function formatCompactInr(amount: number | string): string {
    const n = Number(amount) || 0;
    if (n >= 10_000_000) {
        const cr = n / 10_000_000;
        return `₹${cr.toFixed(cr >= 10 ? 1 : 2).replace(/\.0$/, '')}Cr`;
    }
    if (n >= 100_000) {
        const lakhs = n / 100_000;
        const digits = lakhs >= 10 ? 1 : 2;
        return `₹${lakhs.toFixed(digits).replace(/\.0$/, '')}L`;
    }
    return `₹${Math.round(n).toLocaleString('en-IN')}`;
}

export function hasCreatorRates(rates?: { reel?: number; story?: number; post?: number } | null) {
    return Boolean(rates?.reel || rates?.story || rates?.post);
}

export function getVusicRank(followers: number): VusicRank {
    if (followers >= 1_000_000) return { rank: 1, label: 'Mega' };
    if (followers >= 100_000) return { rank: 2, label: 'Top' };
    if (followers >= 10_000) return { rank: 3, label: 'Micro' };
    return { rank: 4, label: 'Nano' };
}

export function estimateMonthlyEarnings(followers: number, goal?: string) {
    let low = 5;
    let high = 12;
    if (followers >= 1_000_000) {
        low = 150;
        high = 400;
    } else if (followers >= 100_000) {
        low = 45;
        high = 85;
    } else if (followers >= 10_000) {
        low = 18;
        high = 40;
    } else if (followers >= 1_000) {
        low = 8;
        high = 20;
    }
    if (goal === 'more_ops') high = Math.round(high * 0.85);
    return {
        low,
        high,
        label: `₹${low}–${high}K`,
        rangeLabel: `₹${low}K – ₹${high}K`,
        width: Math.min(92, 40 + Math.round(followers / 4000)),
    };
}

export function computeProfileStrength(input: {
    connected?: boolean;
    creatorType?: string;
    categories?: number;
    opportunities?: number;
    location?: string;
    languages?: number;
    earningGoal?: string;
    rates?: boolean;
}) {
    let score = 0;
    if (input.connected) score += 35;
    if (input.creatorType) score += 10;
    if ((input.categories || 0) > 0) score += 15;
    if ((input.opportunities || 0) > 0) score += 10;
    if (input.location) score += 10;
    if ((input.languages || 0) > 0) score += 10;
    if (input.earningGoal) score += 5;
    if (input.rates) score += 5;
    return Math.min(100, score);
}

export function getMediaViews(media: InstagramMedia): number {
    const viewsInsight = media.insights?.find(
        (i) => i.name === 'views' || i.name === 'video_views' || i.name === 'plays',
    );
    if (viewsInsight?.values?.[0]?.value != null) {
        return viewsInsight.values[0].value;
    }
    return (media.like_count || 0) * 10;
}

export function computeReelsStats(media: InstagramMedia[]): ReelsStats {
    const reels = media.filter(
        (m) => m.media_product_type === 'REELS' || m.media_type === 'REELS' || m.media_type === 'VIDEO',
    );
    const stats: ReelsStats = { total: reels.length, '>1k': 0, '>10k': 0, '>100k': 0, '>1m': 0, '>10m': 0 };

    reels.forEach((item) => {
        const views = getMediaViews(item);
        if (views >= 10_000_000) stats['>10m']++;
        else if (views >= 1_000_000) stats['>1m']++;
        else if (views >= 100_000) stats['>100k']++;
        else if (views >= 10_000) stats['>10k']++;
        else if (views >= 1_000) stats['>1k']++;
    });

    return stats;
}
