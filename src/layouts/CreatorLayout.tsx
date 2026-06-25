import type { ReactNode } from 'react';
import {
    Activity,
    LayoutDashboard,
    Megaphone,
    Wallet,
    MessageCircle,
} from 'lucide-react';
import PortalShell from './shared/PortalShell';
import CreatorSidebarProfile from '@/components/creator/CreatorSidebarProfile';

const NAV_ITEMS = [
    { key: '/creator/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { key: '/creator/campaigns', icon: Megaphone, label: 'Campaigns' },
    { key: '/creator/payments', icon: Wallet, label: 'Payments' },
    { key: '/creator/messages', icon: MessageCircle, label: 'Messages' },
];

export default function CreatorLayout({ children }: { children: ReactNode }) {
    return (
        <PortalShell
            headerTitle="Creator Workspace"
            logoIcon={Activity}
            logoIconClassName="text-[#87D8FF]"
            title="Vusic One"
            navItems={NAV_ITEMS}
            sidebarFooter={<CreatorSidebarProfile />}
        >
            {children}
        </PortalShell>
    );
}
