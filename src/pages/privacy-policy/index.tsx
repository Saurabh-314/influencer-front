import { Link } from 'react-router-dom';
import LegalDocument from '@/components/marketing/LegalDocument';
import { COMPANY } from '@/constants/company';

const PrivacyPolicy = () => {
    return (
        <LegalDocument title="Privacy Policy" lastUpdated="August 13, 2026">
            <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-foreground">1. Introduction</h2>
                <p className="text-muted-foreground leading-relaxed">
                    Welcome to {COMPANY.productName} ("{COMPANY.productName}", "we", "our", or "us").
                    {COMPANY.productName} is an influencer marketing platform operated by{' '}
                    <span className="font-medium text-foreground">{COMPANY.legalName}</span> that helps brands
                    discover, connect with, and collaborate with social media influencers and content creators.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                    This Privacy Policy explains how we collect, use, disclose, store, and protect your
                    information when you access or use the {COMPANY.productName} platform, website,
                    applications, and related services at {COMPANY.website}.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                    By accessing or using {COMPANY.productName}, you agree to the collection and use of
                    information in accordance with this Privacy Policy.
                </p>
            </section>

            <hr className="border-border" />

            <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-foreground">2. Who We Are</h2>
                <p className="text-muted-foreground leading-relaxed">
                    {COMPANY.productName} is operated by {COMPANY.legalName}, registered in {COMPANY.country}.
                    Our platform enables:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li>Brands and music labels to discover and engage influencers for marketing campaigns.</li>
                    <li>Creators to connect authorized social media accounts and receive collaboration opportunities.</li>
                    <li>Campaign management, communication, reporting, and analytics between brands and creators.</li>
                </ul>
            </section>

            <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-foreground">3. Information We Collect</h2>

                <div className="space-y-4">
                    <h3 className="text-xl font-medium text-foreground">A. Information You Provide</h3>
                    <p className="text-muted-foreground leading-relaxed">
                        We may collect information that you voluntarily provide, including:
                    </p>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 list-disc pl-6 text-muted-foreground">
                        <li>Full name</li>
                        <li>Email address</li>
                        <li>Phone number</li>
                        <li>Company or business information</li>
                        <li>Billing information</li>
                        <li>Social media profile links</li>
                        <li>Campaign details</li>
                        <li>Messages and communications</li>
                        <li>Customer support inquiries</li>
                    </ul>
                </div>

                <div className="space-y-4 pt-4">
                    <h3 className="text-xl font-medium text-foreground">B. Information from Authorized Platform Connections</h3>
                    <p className="text-muted-foreground leading-relaxed">
                        When creators connect their Instagram account through Instagram Login or optional Meta authorization,
                        {COMPANY.productName} may access information permitted by the applicable APIs and
                        granted permissions, including:
                    </p>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 list-disc pl-6 text-muted-foreground">
                        <li>Instagram Account ID</li>
                        <li>Username, name, biography & profile picture</li>
                        <li>Follower, following & media counts</li>
                        <li>Reels and media content metadata</li>
                        <li>Likes, comments & views on authorized content</li>
                        <li>Account reach metrics</li>
                        <li>Account type & professional account information</li>
                    </ul>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        We only access data that creators explicitly authorize. We do not scrape Instagram,
                        collect data without authorization, or request social media passwords.
                    </p>
                </div>

                <div className="space-y-4 pt-4">
                    <h3 className="text-xl font-medium text-foreground">C. Automatically Collected Information</h3>
                    <p className="text-muted-foreground leading-relaxed">
                        When you use {COMPANY.productName}, we may automatically collect: IP address, device
                        identifiers, browser type, operating system, usage data, log files, referring URLs,
                        and cookie identifiers.
                    </p>
                </div>
            </section>

            <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-foreground">4. Information We Do Not Collect</h2>
                <p className="text-muted-foreground leading-relaxed">
                    {COMPANY.productName} does not collect:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li>Instagram or Facebook passwords</li>
                    <li>Private direct messages or personal messages</li>
                    <li>Content not authorized through official platform APIs</li>
                    <li>Sensitive financial information beyond payment processing needs</li>
                </ul>
            </section>

            <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-foreground">5. How We Use Information</h2>
                <p className="text-muted-foreground leading-relaxed">
                    We use information to manage accounts, build creator profiles, match brands with
                    influencers, facilitate campaigns, verify authenticity, analyze authorized performance
                    data, generate reports, improve functionality, and comply with legal obligations.
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-foreground">6. Legal Basis for Processing</h2>
                <p className="text-muted-foreground leading-relaxed">
                    Where applicable under GDPR and similar laws, we process information based on user consent,
                    performance of a contract, legitimate business interests, and compliance with legal obligations.
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-foreground">7. Sharing of Information</h2>
                <p className="text-muted-foreground leading-relaxed">
                    We may share information with brands and creators to facilitate collaborations, with
                    service providers (hosting, analytics, payments), and with legal authorities if required
                    by law. We do not sell platform data to third parties.
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-foreground">8. No Sale of Personal Data</h2>
                <p className="text-muted-foreground leading-relaxed font-medium text-foreground">
                    {COMPANY.productName} does not sell, rent, trade, license, or otherwise monetize personal
                    information, Instagram data, Facebook data, influencer data, or user data to third parties.
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-foreground">9. Meta Platform Data</h2>
                <p className="text-muted-foreground leading-relaxed">
                    By connecting accounts, you authorize {COMPANY.productName} to access information via
                    Meta Platform APIs. This is used solely for platform functionality — creator profiles,
                    discovery, analytics, and campaign matching. We do not use Meta Data for independent
                    advertising networks or data brokerage.
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-foreground">10. Cookies and Similar Technologies</h2>
                <p className="text-muted-foreground leading-relaxed">
                    We use cookies to maintain sessions, remember preferences, and analyze usage patterns.
                    You can disable cookies in your browser settings.
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-foreground">11. Data Retention</h2>
                <p className="text-muted-foreground leading-relaxed">
                    We retain personal information only for as long as necessary to provide services and
                    comply with legal requirements.
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-foreground">12. Data Security</h2>
                <p className="text-muted-foreground leading-relaxed">
                    {COMPANY.productName} implements commercially reasonable security measures including
                    HTTPS/TLS encryption and secure cloud infrastructure.
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-foreground">13. International Data Transfers</h2>
                <p className="text-muted-foreground leading-relaxed">
                    Information may be transferred to and processed in countries outside your country of
                    residence with appropriate safeguards.
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-foreground">14. Your Privacy Rights</h2>
                <p className="text-muted-foreground leading-relaxed">
                    Subject to applicable laws, you may have the right to access, correct, delete, or object
                    to processing of your personal information.
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-foreground">15. Data Deletion Requests</h2>
                <p className="text-muted-foreground leading-relaxed">
                    Users may request deletion of data by emailing{' '}
                    <a href={`mailto:${COMPANY.privacyEmail}`} className="text-primary hover:underline">
                        {COMPANY.privacyEmail}
                    </a>{' '}
                    or by following the instructions on our{' '}
                    <Link to="/data-deletion" className="text-primary hover:underline">Data Deletion</Link> page.
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-foreground">16. Children's Privacy</h2>
                <p className="text-muted-foreground leading-relaxed">
                    {COMPANY.productName} is intended for individuals at least 18 years old. We do not
                    knowingly collect information from children under 18.
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-foreground">17. Compliance With Privacy Laws</h2>
                <p className="text-muted-foreground leading-relaxed">
                    We endeavor to comply with the Digital Personal Data Protection Act (India), GDPR,
                    UK GDPR, and CCPA where applicable.
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-foreground">18. Changes to This Privacy Policy</h2>
                <p className="text-muted-foreground leading-relaxed">
                    We may modify this policy. Continued use of {COMPANY.productName} constitutes acceptance
                    of the revised policy.
                </p>
            </section>

            <section className="space-y-6">
                <h2 className="text-2xl font-semibold text-foreground">19. Contact Information</h2>
                <div className="bg-muted/30 p-6 rounded-lg space-y-2 text-muted-foreground border">
                    <p className="font-semibold text-foreground">
                        Privacy Officer — {COMPANY.productName} ({COMPANY.legalName})
                    </p>
                    <p>
                        Website:{' '}
                        <a href={COMPANY.website} className="text-primary hover:underline">
                            {COMPANY.website}
                        </a>
                    </p>
                    <p>
                        Email:{' '}
                        <a href={`mailto:${COMPANY.privacyEmail}`} className="text-primary hover:underline">
                            {COMPANY.privacyEmail}
                        </a>
                    </p>
                    <p>
                        Support:{' '}
                        <a href={`mailto:${COMPANY.supportEmail}`} className="text-primary hover:underline">
                            {COMPANY.supportEmail}
                        </a>
                    </p>
                </div>
            </section>

            <div className="pt-8 border-t">
                <p className="text-center text-muted-foreground font-medium italic">
                    By using {COMPANY.productName}, you acknowledge that you have read, understood, and agreed
                    to this Privacy Policy.
                </p>
            </div>
        </LegalDocument>
    );
};

export default PrivacyPolicy;
