import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { LogOut } from 'lucide-react';

export type PortalNavItem = {
    key: string;
    icon: LucideIcon;
    label: string;
};

type PortalSidebarProps = {
    logoIcon: LucideIcon;
    logoIconClassName?: string;
    title: string;
    navItems: PortalNavItem[];
    activePath: string;
    onNavigate: (path: string) => void;
    onLogout: () => void;
    logoutLabel?: string;
    footer?: ReactNode;
};

function NavItem({
    icon: Icon,
    label,
    active,
    onClick,
}: {
    icon: LucideIcon;
    label: string;
    active: boolean;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                active
                    ? 'bg-[#87D8FF]/10 text-[#87D8FF] shadow-sm'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
            }`}
        >
            <span className={active ? 'text-[#87D8FF]' : 'text-gray-400'}>
                <Icon size={18} />
            </span>
            {label}
        </button>
    );
}

export default function PortalSidebar({
    logoIcon: LogoIcon,
    logoIconClassName = 'text-[#87D8FF]',
    title,
    navItems,
    activePath,
    onNavigate,
    onLogout,
    logoutLabel = 'Log out',
    footer,
}: PortalSidebarProps) {
    return (
        <nav className="w-64 flex-shrink-0 border-r border-gray-100 bg-white hidden md:flex flex-col justify-between h-full">
            <div>
                <div className="h-16 flex items-center px-6 border-b border-gray-50">
                    <div className="flex items-center gap-2">
                        <LogoIcon size={20} className={logoIconClassName} />
                        <span className="font-semibold tracking-tight text-sm text-gray-900">{title}</span>
                    </div>
                </div>
                <div className="p-4 space-y-1">
                    {navItems.map((item) => {
                        const isActive =
                            activePath === item.key ||
                            (item.key !== '/' && activePath.startsWith(`${item.key}/`));

                        return (
                            <NavItem
                                key={item.key}
                                icon={item.icon}
                                label={item.label}
                                active={isActive}
                                onClick={() => onNavigate(item.key)}
                            />
                        );
                    })}
                </div>
            </div>
            <div className="p-4 border-t border-gray-50">
                {footer}
                <button
                    type="button"
                    onClick={onLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-gray-500 hover:text-[#FF5A5F] hover:bg-[#FF5A5F]/10 rounded-lg transition-colors"
                >
                    <LogOut size={14} /> {logoutLabel}
                </button>
            </div>
        </nav>
    );
}
