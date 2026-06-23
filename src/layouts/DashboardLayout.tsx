import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    Target,
    Trophy,
    BarChart3,
    Users,
    Settings,
    LogOut,
    ShieldCheck
} from 'lucide-react';

interface SidebarProps {
    className?: string;
}

const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    { icon: Target, label: 'Campaigns', href: '/campaigns' },
    { icon: Trophy, label: 'Leaderboard', href: '/leaderboard' },
    { icon: BarChart3, label: 'Analytics', href: '/analytics' },
    { icon: Users, label: 'Accounts', href: '/accounts' },
    { icon: Settings, label: 'Settings', href: '/settings' },
    { icon: ShieldCheck, label: 'Privacy Policy', href: '/privacy-policy' },
];

export function Sidebar({ className }: SidebarProps) {
    return (
        <div className={cn("pb-12 border-r h-screen w-64 bg-card", className)}>
            <div className="space-y-4 py-4">
                <div className="px-3 py-2">
                    <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                        Influencer
                    </h2>
                    <div className="space-y-1">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.href}
                                to={item.href}
                                className={({ isActive }) => cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors",
                                    isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                                )}
                            >
                                <item.icon className="h-4 w-4" />
                                {item.label}
                            </NavLink>
                        ))}
                    </div>
                </div>
                <div className="px-3 py-2 absolute bottom-4 w-full">
                    <button className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 w-full transition-colors">
                        <LogOut className="h-4 w-4" />
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function Layout({ children }: { children: ReactNode }) {
    return (
        <div className="flex">
            <Sidebar />
            <main className="flex-1 p-8 h-screen overflow-y-auto bg-muted/20">
                {children}
            </main>
        </div>
    );
}
