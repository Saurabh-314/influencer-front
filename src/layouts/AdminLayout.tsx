import type { ReactNode } from 'react';
import {
    Activity,
    LayoutDashboard,
    Users,
    Settings,
} from 'lucide-react';
import PortalShell from './shared/PortalShell';

const NAV_ITEMS = [
    { key: '/admin/dashboard', icon: LayoutDashboard, label: 'Overview' },
    { key: '/admin/users', icon: Users, label: 'Users' },
    { key: '/admin/settings', icon: Settings, label: 'Settings' },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
    return (
        <PortalShell
            headerTitle="Admin Console"
            logoIcon={Activity}
            logoIconClassName="text-[#87D8FF]"
            title="Vusic One"
            navItems={NAV_ITEMS}
        >
            {children}
        </PortalShell>
    );
}
