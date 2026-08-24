import { useState, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
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
    headerLeft?: ReactNode;
    accent?: 'cyan' | 'pink';
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
    headerLeft,
    accent = 'cyan',
}: PortalShellProps) {
    const location = useLocation();
    const navigate = useNavigate();
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleLogout = () => logout(navigate);
    const handleNavigate = (path: string) => {
        setMobileOpen(false);
        navigate(path);
    };

    return (
        <div className={`flex h-screen min-h-0 w-full font-sans overflow-hidden ${accent === 'pink' ? 'bg-[#f7f7fa] text-[#121318] font-manrope' : 'bg-[#fcfcfc] text-gray-900 selection:bg-[#87D8FF]/30'}`}>
            <PortalSidebar
                logoIcon={logoIcon}
                logoIconClassName={logoIconClassName}
                title={title}
                navItems={navItems}
                activePath={location.pathname}
                onNavigate={handleNavigate}
                onLogout={handleLogout}
                logoutLabel={logoutLabel}
                footer={sidebarFooter}
                accent={accent}
            />

            {mobileOpen && (
                <div className="fixed inset-0 z-50 md:hidden">
                    <button
                        type="button"
                        aria-label="Close menu"
                        className="absolute inset-0 bg-black/30"
                        onClick={() => setMobileOpen(false)}
                    />
                    <div className="relative h-full min-h-0 w-[238px] overflow-hidden shadow-xl">
                        <PortalSidebar
                            logoIcon={logoIcon}
                            logoIconClassName={logoIconClassName}
                            title={title}
                            navItems={navItems}
                            activePath={location.pathname}
                            onNavigate={handleNavigate}
                            onLogout={handleLogout}
                            logoutLabel={logoutLabel}
                            footer={sidebarFooter}
                            accent={accent}
                            alwaysShow
                        />
                    </div>
                </div>
            )}

            <main className="flex-1 flex flex-col h-full overflow-hidden relative min-w-0">
                <header className={`h-[72px] flex-shrink-0 flex items-center justify-between gap-3 px-4 md:px-8 bg-white border-b ${accent === 'pink' ? 'border-[#e9e9ef]' : 'border-gray-50'}`}>
                    <button
                        type="button"
                        className="grid h-[37px] w-[37px] flex-none place-items-center rounded-[10px] border border-[#e9e9ef] bg-white text-[#6f727b] md:hidden"
                        onClick={() => setMobileOpen((open) => !open)}
                        aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                    >
                        {mobileOpen ? <X size={16} /> : <Menu size={16} />}
                    </button>
                    {headerLeft || (
                        <h1 className="text-sm font-semibold text-gray-800 tracking-tight">{headerTitle}</h1>
                    )}
                    {headerActions}
                </header>
                <div className={`flex-1 overflow-y-auto ${accent === 'pink' ? 'p-4 md:px-8 md:py-7' : 'p-6 md:p-8'}`}>{children}</div>
            </main>
        </div>
    );
}
