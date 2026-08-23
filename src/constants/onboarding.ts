import type { LucideIcon } from 'lucide-react';
import {
    Camera,
    Clapperboard,
    Gamepad2,
    GraduationCap,
    Handshake,
    Link2,
    Music,
    Package,
    Sparkles,
    Star,
    TrendingUp,
    Wallet,
} from 'lucide-react';

export const ONBOARDING_STEPS = [
    'Welcome',
    'Creator type',
    'Content',
    'Instagram',
    'Secure connection',
    'Preferences',
    'Audience',
    'Earning potential',
    'Your profile',
] as const;

export const CREATOR_TYPES: { id: string; title: string; desc: string; icon: LucideIcon }[] = [
    { id: 'content_creator', title: 'Content Creator', desc: 'Social-first creator', icon: Clapperboard },
    { id: 'influencer', title: 'Influencer', desc: 'Lifestyle & audience-led', icon: Star },
    { id: 'artist', title: 'Artist / Musician', desc: 'Music & entertainment', icon: Music },
    { id: 'model', title: 'Model / Actor', desc: 'Visual creator', icon: Camera },
    { id: 'gamer', title: 'Gamer', desc: 'Gaming & streaming', icon: Gamepad2 },
    { id: 'educator', title: 'Educator', desc: 'Knowledge & expertise', icon: GraduationCap },
];

export const CONTENT_CATEGORIES = [
    'Fashion',
    'Beauty',
    'Music',
    'Lifestyle',
    'Travel',
    'Fitness',
    'Food',
    'Comedy',
    'Gaming',
    'Tech',
    'Finance',
    'Education',
    'Entertainment',
    'Sports',
    'Devotional',
];

export const OPPORTUNITIES: { id: string; title: string; desc: string; icon: LucideIcon }[] = [
    { id: 'paid', title: 'Paid collaborations', desc: 'Work with brands for fees', icon: Wallet },
    { id: 'product', title: 'Product campaigns', desc: 'Products & experiences', icon: Package },
    { id: 'affiliate', title: 'Affiliate campaigns', desc: 'Earn from conversions', icon: Link2 },
    { id: 'partnerships', title: 'Long-term partnerships', desc: 'Become a brand partner', icon: Handshake },
];

export const BRAND_INTERESTS = [
    'Fashion',
    'Beauty',
    'Technology',
    'Food',
    'Automotive',
    'Travel',
    'Music',
    'Finance',
];

export const LOCATIONS = ['Delhi NCR', 'Mumbai', 'Bangalore', 'Hyderabad', 'Other'];

export const LANGUAGES = ['English', 'Hindi', 'Punjabi', 'Haryanvi', 'Tamil', 'Telugu'];

export const EARNING_GOALS: { id: string; title: string; desc: string; icon: LucideIcon }[] = [
    { id: 'max_earn', title: 'Maximum earning potential', desc: 'Prioritize higher-value campaigns', icon: TrendingUp },
    { id: 'more_ops', title: 'More opportunities', desc: 'Prioritize campaign volume', icon: Sparkles },
];

export function creatorTypeLabel(id?: string) {
    return CREATOR_TYPES.find((item) => item.id === id)?.title || 'Creator';
}
