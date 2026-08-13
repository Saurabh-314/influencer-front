import type { ReactNode } from 'react';
import MarketingHeader from '@/components/marketing/MarketingHeader';
import MarketingFooter from '@/components/marketing/MarketingFooter';

export default function MarketingLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen flex flex-col">
            <MarketingHeader />
            <main className="flex-1">{children}</main>
            <MarketingFooter />
        </div>
    );
}
