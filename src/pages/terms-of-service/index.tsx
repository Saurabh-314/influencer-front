import { Link } from 'react-router-dom';
import LegalDocument from '@/components/marketing/LegalDocument';
import { COMPANY } from '@/constants/company';

export default function TermsOfService() {
    return (
        <LegalDocument title="Terms of Service" lastUpdated="August 13, 2026">
            <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-foreground">1. Agreement</h2>
                <p className="text-muted-foreground leading-relaxed">
                    These Terms of Service ("Terms") govern your access to and use of {COMPANY.productName},
                    operated by {COMPANY.legalName} ("we", "us", "our"). By accessing or using the platform
                    at {COMPANY.website}, you agree to these Terms.
                </p>
            </section>

            <hr className="border-border" />

            <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-foreground">2. The Platform</h2>
                <p className="text-muted-foreground leading-relaxed">
                    {COMPANY.productName} is an influencer marketing technology platform that enables:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li>Creators to create profiles and connect authorized social media accounts.</li>
                    <li>Brands and music labels to discover, evaluate, and collaborate with creators.</li>
                    <li>Campaign management, reporting, and analytics between brands and creators.</li>
                </ul>
            </section>

            <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-foreground">3. Account Registration</h2>
                <p className="text-muted-foreground leading-relaxed">
                    You must provide accurate information when creating an account. You are responsible for
                    maintaining the confidentiality of your credentials and for all activity under your account.
                    You must be at least 18 years old to use the platform.
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-foreground">4. Social Media Authorization</h2>
                <p className="text-muted-foreground leading-relaxed">
                    When you connect a social media account, you authorize {COMPANY.productName} to access
                    information permitted by the applicable platform APIs and the permissions you grant.
                    You may disconnect your account at any time. We do not request or store your social
                    media passwords.
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-foreground">5. Acceptable Use</h2>
                <p className="text-muted-foreground leading-relaxed">You agree not to:</p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li>Use the platform for unlawful purposes or in violation of third-party platform policies.</li>
                    <li>Attempt to scrape, harvest, or access data outside authorized API permissions.</li>
                    <li>Misrepresent your identity, account ownership, or creator metrics.</li>
                    <li>Interfere with or disrupt the platform or other users' access.</li>
                </ul>
            </section>

            <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-foreground">6. Campaigns & Payments</h2>
                <p className="text-muted-foreground leading-relaxed">
                    Campaign terms, deliverables, and payment arrangements between brands and creators are
                    governed by the specific campaign details agreed upon within the platform. {COMPANY.legalName}{' '}
                    facilitates the platform but is not a party to individual creator-brand agreements unless
                    explicitly stated.
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-foreground">7. Intellectual Property</h2>
                <p className="text-muted-foreground leading-relaxed">
                    The platform, its design, and underlying technology are owned by {COMPANY.legalName}.
                    Creators retain ownership of their content. By using the platform, you grant us a limited
                    license to display authorized profile and content data for platform functionality.
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-foreground">8. Privacy</h2>
                <p className="text-muted-foreground leading-relaxed">
                    Your use of the platform is also governed by our{' '}
                    <Link to="/privacy-policy" className="text-primary hover:underline">Privacy Policy</Link>.
                    We do not sell Instagram Platform Data or personal information to third parties.
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-foreground">9. Disclaimers</h2>
                <p className="text-muted-foreground leading-relaxed">
                    The platform is provided "as is" without warranties of any kind. We do not guarantee
                    campaign results, viral content, or specific engagement outcomes. Creator metrics are
                    based on authorized platform data and our analytical models.
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-foreground">10. Limitation of Liability</h2>
                <p className="text-muted-foreground leading-relaxed">
                    To the maximum extent permitted by law, {COMPANY.legalName} shall not be liable for
                    indirect, incidental, or consequential damages arising from your use of the platform.
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-foreground">11. Termination</h2>
                <p className="text-muted-foreground leading-relaxed">
                    We may suspend or terminate access for violations of these Terms. You may delete your
                    account at any time. See our{' '}
                    <Link to="/data-deletion" className="text-primary hover:underline">Data Deletion</Link>{' '}
                    page for instructions on removing your data.
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-foreground">12. Changes</h2>
                <p className="text-muted-foreground leading-relaxed">
                    We may update these Terms from time to time. Continued use of the platform after changes
                    constitutes acceptance of the revised Terms.
                </p>
            </section>

            <section className="space-y-6">
                <h2 className="text-2xl font-semibold text-foreground">13. Contact</h2>
                <div className="bg-muted/30 p-6 rounded-lg space-y-2 text-muted-foreground border">
                    <p className="font-semibold text-foreground">{COMPANY.legalName}</p>
                    <p>
                        Email:{' '}
                        <a href={`mailto:${COMPANY.supportEmail}`} className="text-primary hover:underline">
                            {COMPANY.supportEmail}
                        </a>
                    </p>
                    <p>
                        Website:{' '}
                        <a href={COMPANY.website} className="text-primary hover:underline">
                            {COMPANY.website}
                        </a>
                    </p>
                </div>
            </section>
        </LegalDocument>
    );
}
