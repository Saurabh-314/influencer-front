import type { ReactNode } from 'react';
import {
    Building2,
    LayoutDashboard,
    Megaphone,
    Users,
    LineChart,
} from 'lucide-react';
import PortalShell from './shared/PortalShell';

const NAV_ITEMS = [
    { key: '/brand/dashboard', icon: LayoutDashboard, label: 'Overview' },
    { key: '/brand/campaigns', icon: Megaphone, label: 'Campaigns' },
    { key: '/brand/creators', icon: Users, label: 'Creators' },
    { key: '/brand/analytics', icon: LineChart, label: 'Analytics' },
];

export default function BrandLayout({ children }: { children: ReactNode }) {
    return (
        <PortalShell
            headerTitle="Campaign Manager"
            logoIcon={Building2}
            logoIconClassName="text-gray-900"
            title="Brand Portal"
            navItems={NAV_ITEMS}
            logoutLabel="Exit Portal"
        >
            {children}
        </PortalShell>
    );
}
