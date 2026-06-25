import type { ReactNode } from 'react';
import {
    Activity,
    LayoutDashboard,
    Megaphone,
    Trophy,
    LineChart,
    Users,
    Settings,
    Shield,
} from 'lucide-react';
import PortalShell from './shared/PortalShell';

const NAV_ITEMS = [
    { key: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { key: '/campaigns', icon: Megaphone, label: 'Campaigns' },
    { key: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
    { key: '/analytics', icon: LineChart, label: 'Analytics' },
    { key: '/accounts', icon: Users, label: 'Accounts' },
    { key: '/settings', icon: Settings, label: 'Settings' },
    { key: '/privacy-policy', icon: Shield, label: 'Privacy Policy' },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
    return (
        <PortalShell
            headerTitle="Admin Workspace"
            logoIcon={Activity}
            logoIconClassName="text-[#87D8FF]"
            title="Vusic One"
            navItems={NAV_ITEMS}
        >
            {children}
        </PortalShell>
    );
}
