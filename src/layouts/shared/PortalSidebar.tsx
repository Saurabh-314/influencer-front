import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { LogOut } from 'lucide-react';

export type PortalNavItem = {
    key: string;
    icon: LucideIcon;
    label: string;
    section?: string;
    aliases?: string[];
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
    accent?: 'cyan' | 'pink';
    alwaysShow?: boolean;
};

function NavItem({
    icon: Icon,
    label,
    active,
    onClick,
    accent = 'cyan',
}: {
    icon: LucideIcon;
    label: string;
    active: boolean;
    onClick: () => void;
    accent?: 'cyan' | 'pink';
}) {
    const activeClass =
        accent === 'pink'
            ? 'bg-[#fff0f7] text-[#bd2868] font-bold'
            : 'bg-[#87D8FF]/10 text-[#87D8FF] shadow-sm';
    const iconClass = active
        ? accent === 'pink'
            ? 'text-[#bd2868]'
            : 'text-[#87D8FF]'
        : 'text-gray-400';

    return (
        <button
            type="button"
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-3 py-[11px] rounded-xl text-[13px] font-medium transition-all duration-200 ${
                active ? activeClass : 'text-[#757881] hover:bg-gray-50 hover:text-gray-900'
            }`}
        >
            <span className={iconClass}>
                <Icon size={18} />
            </span>
            {label}
        </button>
    );
}

function isNavActive(item: PortalNavItem, activePath: string) {
    if (activePath === item.key) return true;
    if (item.key !== '/' && activePath.startsWith(`${item.key}/`)) return true;
    return Boolean(item.aliases?.some((alias) => activePath === alias || activePath.startsWith(`${alias}/`)));
}

function groupNavItems(navItems: PortalNavItem[]) {
    if (!navItems.some((item) => item.section)) {
        return [{ title: null as string | null, items: navItems }];
    }

    return navItems.reduce<{ title: string | null; items: PortalNavItem[] }[]>((groups, item) => {
        const title = item.section ?? null;
        const last = groups[groups.length - 1];
        if (last && last.title === title) {
            last.items.push(item);
            return groups;
        }
        groups.push({ title, items: [item] });
        return groups;
    }, []);
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
    accent = 'cyan',
    alwaysShow = false,
}: PortalSidebarProps) {
    const groups = groupNavItems(navItems);

    return (
        <nav
            className={`w-[238px] flex-shrink-0 border-r bg-white flex-col h-full max-h-full min-h-0 overflow-hidden ${
                alwaysShow ? 'flex' : 'hidden md:flex'
            } ${accent === 'pink' ? 'border-[#e9e9ef]' : 'border-gray-100'}`}
        >
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
                <div className="px-4 pt-6 pb-7">
                    {accent === 'pink' ? (
                        <div className="px-3 text-[23px] font-extrabold tracking-[-1px]">
                            {title}
                            <span className="text-[#e9408a]">.</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 px-2">
                            <LogoIcon size={20} className={logoIconClassName} />
                            <span className="font-semibold tracking-tight text-sm text-gray-900">{title}</span>
                        </div>
                    )}
                </div>
                <div className="px-3 pb-4">
                    {groups.map((group, index) => (
                        <div key={group.title || `nav-${index}`} className={index === 0 ? '' : 'mt-3'}>
                            {group.title && (
                                <p className="px-3 mb-2 text-[10px] uppercase tracking-[1.2px] text-[#a0a2aa]">
                                    {group.title}
                                </p>
                            )}
                            <div className="space-y-0.5">
                                {group.items.map((item) => (
                                    <NavItem
                                        key={item.key}
                                        icon={item.icon}
                                        label={item.label}
                                        active={isNavActive(item, activePath)}
                                        accent={accent}
                                        onClick={() => onNavigate(item.key)}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="flex-shrink-0 p-4">
                {footer}
                <button
                    type="button"
                    onClick={onLogout}
                    className="mt-3 w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-gray-500 hover:text-[#FF5A5F] hover:bg-[#FF5A5F]/10 rounded-lg transition-colors"
                >
                    <LogOut size={14} /> {logoutLabel}
                </button>
            </div>
        </nav>
    );
}
