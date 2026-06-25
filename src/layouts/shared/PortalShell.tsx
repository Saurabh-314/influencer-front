import type { ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { logout } from '@/utils/auth';
import PortalSidebar, { type PortalNavItem } from './PortalSidebar';
import type { LucideIcon } from 'lucide-react';

type PortalShellProps = {
    children: ReactNode;
    headerTitle: string;
    logoIcon: LucideIcon;
    logoIconClassName?: string;
    title: string;
    navItems: PortalNavItem[];
    logoutLabel?: string;
    sidebarFooter?: ReactNode;
    headerActions?: ReactNode;
};

export default function PortalShell({
    children,
    headerTitle,
    logoIcon,
    logoIconClassName,
    title,
    navItems,
    logoutLabel,
    sidebarFooter,
    headerActions,
}: PortalShellProps) {
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => logout(navigate);

    return (
        <div className="flex h-screen w-full bg-[#fcfcfc] text-gray-900 font-sans overflow-hidden selection:bg-[#87D8FF]/30">
            <PortalSidebar
                logoIcon={logoIcon}
                logoIconClassName={logoIconClassName}
                title={title}
                navItems={navItems}
                activePath={location.pathname}
                onNavigate={navigate}
                onLogout={handleLogout}
                logoutLabel={logoutLabel}
                footer={sidebarFooter}
            />

            <main className="flex-1 flex flex-col h-full overflow-hidden relative min-w-0">
                <header className="h-16 flex-shrink-0 flex items-center justify-between px-8 bg-white border-b border-gray-50">
                    <h1 className="text-sm font-semibold text-gray-800 tracking-tight">{headerTitle}</h1>
                    {headerActions}
                </header>
                <div className="flex-1 overflow-y-auto p-6 md:p-8">{children}</div>
            </main>
        </div>
    );
}
