import type { ReactNode } from 'react';

type LegalDocumentProps = {
    title: string;
    lastUpdated: string;
    children: ReactNode;
};

export default function LegalDocument({ title, lastUpdated, children }: LegalDocumentProps) {
    return (
        <div className="container max-w-4xl py-12 px-4 sm:px-6 lg:px-8">
            <div className="bg-card rounded-lg shadow-sm border p-8 space-y-8">
                <div className="space-y-2 border-b pb-6">
                    <h1 className="text-4xl font-bold tracking-tight text-foreground">{title}</h1>
                    <p className="text-muted-foreground font-medium">Last Updated: {lastUpdated}</p>
                </div>
                {children}
            </div>
        </div>
    );
}
