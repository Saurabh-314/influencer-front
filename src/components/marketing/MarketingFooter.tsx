import { Link } from 'react-router-dom';
import { COMPANY } from '@/constants/company';

const FOOTER_LINKS = {
    product: [
        { label: 'About', to: '/about' },
        { label: 'For Brands', to: '/#for-brands' },
        { label: 'For Creators', to: '/#for-creators' },
        { label: 'How It Works', to: '/#how-it-works' },
    ],
    legal: [
        { label: 'Privacy Policy', to: '/privacy-policy' },
        { label: 'Terms of Service', to: '/terms-of-service' },
        { label: 'Data Deletion', to: '/data-deletion' },
        { label: 'Contact', to: '/about#contact' },
    ],
};

export default function MarketingFooter() {
    return (
        <footer className="border-t bg-muted/30">
            <div className="container py-12">
                <div className="grid gap-8 md:grid-cols-4">
                    <div className="md:col-span-2 space-y-3">
                        <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
                                M
                            </div>
                            <span className="text-lg font-bold">{COMPANY.productName}</span>
                        </div>
                        <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
                            {COMPANY.tagline}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            {COMPANY.productName} is operated by{' '}
                            <span className="font-medium text-foreground">{COMPANY.legalName}</span>
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold text-sm mb-3">Product</h3>
                        <ul className="space-y-2">
                            {FOOTER_LINKS.product.map((link) => (
                                <li key={link.to}>
                                    {link.to.startsWith('/#') ? (
                                        <a
                                            href={link.to}
                                            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            {link.label}
                                        </a>
                                    ) : (
                                        <Link
                                            to={link.to}
                                            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            {link.label}
                                        </Link>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold text-sm mb-3">Legal</h3>
                        <ul className="space-y-2">
                            {FOOTER_LINKS.legal.map((link) => (
                                <li key={link.to}>
                                    <Link
                                        to={link.to}
                                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="mt-10 pt-6 border-t flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-sm text-muted-foreground">
                    <p>
                        &copy; {new Date().getFullYear()} {COMPANY.legalName}. All rights reserved.
                    </p>
                    <a
                        href={`mailto:${COMPANY.supportEmail}`}
                        className="hover:text-foreground transition-colors"
                    >
                        {COMPANY.supportEmail}
                    </a>
                </div>
            </div>
        </footer>
    );
}
