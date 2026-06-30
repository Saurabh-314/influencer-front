import type { CampaignCheckoutState } from '@/types/campaign';

const STORAGE_KEY = 'campaign_checkout_draft';

export function saveCampaignCheckoutState(state: CampaignCheckoutState): void {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function loadCampaignCheckoutState(): CampaignCheckoutState | null {
    try {
        const raw = sessionStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        return JSON.parse(raw) as CampaignCheckoutState;
    } catch {
        return null;
    }
}

export function clearCampaignCheckoutState(): void {
    sessionStorage.removeItem(STORAGE_KEY);
}
