import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { COMPANY } from '@/constants/company';

export default function AuthPageFooter() {
    return (
        <div className="mt-6 text-center space-y-2">
            <p className="text-xs text-muted-foreground">
                {COMPANY.productName} is operated by {COMPANY.legalName}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <Link to="/privacy-policy" className="hover:text-foreground transition-colors">
                    Privacy Policy
                </Link>
                <span>·</span>
                <Link to="/terms-of-service" className="hover:text-foreground transition-colors">
                    Terms of Service
                </Link>
                <span>·</span>
                <Link to="/data-deletion" className="hover:text-foreground transition-colors">
                    Data Deletion
                </Link>
            </div>
        </div>
    );
}

export function AuthPageShell({ children }: { children: ReactNode }) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-muted/20 p-4">
            <Link to="/" className="mb-6 flex items-center gap-2 hover:opacity-80 transition-opacity">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
                    M
                </div>
                <span className="text-lg font-bold tracking-tight">{COMPANY.productName}</span>
            </Link>
            {children}
            <AuthPageFooter />
        </div>
    );
}
