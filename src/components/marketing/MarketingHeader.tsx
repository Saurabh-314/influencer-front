import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { COMPANY } from '@/constants/company';
import { isAuthenticated, getStoredUser, getRoleDashboardPath } from '@/utils/auth';

export default function MarketingHeader() {
    const authenticated = isAuthenticated();
    const dashboardPath = getRoleDashboardPath(getStoredUser()?.role);

    return (
        <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
            <div className="container flex h-16 items-center justify-between">
                <Link to="/" className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
                        M
                    </div>
                    <span className="text-lg font-bold tracking-tight">{COMPANY.productName}</span>
                </Link>

                <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
                    <a href="/#how-it-works" className="hover:text-foreground transition-colors">
                        How It Works
                    </a>
                    <a href="/#for-brands" className="hover:text-foreground transition-colors">
                        For Brands
                    </a>
                    <a href="/#for-creators" className="hover:text-foreground transition-colors">
                        For Creators
                    </a>
                    <Link to="/about" className="hover:text-foreground transition-colors">
                        About
                    </Link>
                </nav>

                <div className="flex items-center gap-2">
                    {authenticated ? (
                        <Button asChild size="sm">
                            <Link to={dashboardPath}>Go to Dashboard</Link>
                        </Button>
                    ) : (
                        <>
                            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                                <Link to="/login">Log in</Link>
                            </Button>
                            <Button asChild size="sm">
                                <Link to="/register">Join as Creator</Link>
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
