import { type ReactNode } from 'react';
import {
    ArrowRight,
    Check,
    Instagram,
    Loader2,
    Lock,
    X,
} from 'lucide-react';

const ACCESS_ITEMS = [
    {
        title: 'Profile information',
        detail: 'Name, username, photo, and follower counts.',
    },
    {
        title: 'Audience insights',
        detail: 'Reach and audience metrics for campaign matching.',
    },
    {
        title: 'Content performance',
        detail: 'Reels and post data used to recommend opportunities.',
    },
];

const WONT_ITEMS = ['Post without permission', 'Send DMs', 'Change your account'];

function PageBackdrop({ children }: { children: ReactNode }) {
    return (
        <div className="relative -m-6 md:-m-8 min-h-[calc(100vh-4rem)] overflow-hidden px-6 py-12 md:px-12 md:py-16">
            <div className="absolute inset-0 bg-gradient-to-br from-[#efe8ff] via-[#fbf8f5] to-[#ffe6d6]" />
            <div className="pointer-events-none absolute -left-24 -top-16 h-80 w-80 rounded-full bg-[#c4b5fd]/45 blur-3xl" />
            <div className="pointer-events-none absolute -right-10 top-0 h-[28rem] w-[28rem] rounded-full bg-[#fdba8c]/35 blur-3xl" />
            <div className="pointer-events-none absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-[#87D8FF]/35 blur-3xl" />
            <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
                {children}
            </div>
        </div>
    );
}

export function InstagramConnectCard({
    errorMessage,
    isConnecting,
    onConnect,
}: {
    errorMessage?: string | null;
    isConnecting: boolean;
    onConnect: () => void;
}) {
    return (
        <PageBackdrop>
            <div className="max-w-xl">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-500 ring-1 ring-white/80">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#87D8FF]" />
                    Creator setup
                </span>

                <h2 className="font-instrument mt-6 text-[2.6rem] leading-[1.12] text-gray-900 md:text-5xl">
                    Connect Instagram
                    <br />
                    to unlock campaigns
                    <br />
                    made for your audience.
                </h2>

                <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#7a6bb5]">
                    Profile · Insights · Performance
                </p>

                <p className="mt-5 max-w-md text-sm leading-relaxed text-gray-500">
                    Import your Instagram audience insights and profile data so we can recommend
                    relevant campaigns and opportunities.
                </p>

                {errorMessage && (
                    <p className="mt-4 text-sm font-medium text-[#FF5A5F]">{errorMessage}</p>
                )}

                <div className="mt-8 flex flex-wrap items-center gap-3">
                    <button
                        type="button"
                        onClick={onConnect}
                        disabled={isConnecting}
                        className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#87D8FF] to-[#6bb8e8] px-6 py-3 text-sm font-semibold text-gray-900 shadow-[0_10px_30px_rgba(135,216,255,0.45)] transition hover:brightness-105 disabled:opacity-60"
                    >
                        {isConnecting ? (
                            <>
                                <Loader2 size={16} className="animate-spin" /> Opening Instagram
                            </>
                        ) : (
                            <>
                                Connect Instagram <ArrowRight size={16} />
                            </>
                        )}
                    </button>
                    <span className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-medium text-gray-700 ring-1 ring-gray-200/80">
                        <Lock size={14} className="text-gray-400" />
                        We never post
                    </span>
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                    {['Profile', 'Insights', 'No posting'].map((label) => (
                        <span
                            key={label}
                            className="rounded-full bg-white/80 px-3.5 py-1.5 text-xs font-medium text-gray-600 ring-1 ring-gray-200/70"
                        >
                            {label}
                        </span>
                    ))}
                </div>
            </div>

            <div className="relative mx-auto w-full max-w-[520px] px-4 pb-10 pt-8 lg:mx-0 lg:justify-self-end">
                <span className="absolute -top-3 left-8 z-20 rounded-full bg-[#7c5cff] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
                    We'll access
                </span>

                <div className="aspect-square overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#87D8FF] via-[#b7a4ff] to-[#ff8fab] p-1 shadow-[0_30px_80px_rgba(135,160,255,0.35)]">
                    <div className="flex h-full flex-col justify-between rounded-[1.7rem] bg-gradient-to-br from-[#9adfff] via-[#c4b5fd] to-[#fda4af] p-7">
                        <p className="font-instrument text-3xl leading-tight text-white drop-shadow-sm md:text-4xl">
                            Your audience,
                            <br />
                            your campaigns.
                        </p>
                        <ul className="space-y-3">
                            {ACCESS_ITEMS.map((item) => (
                                <li key={item.title} className="flex items-start gap-3 text-white">
                                    <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-white/25">
                                        <Check size={12} strokeWidth={3} />
                                    </span>
                                    <div>
                                        <p className="text-sm font-semibold">{item.title}</p>
                                        <p className="text-xs text-white/80">{item.detail}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="absolute -right-2 -top-6 w-36 overflow-hidden rounded-2xl bg-white p-2 shadow-[0_16px_40px_rgba(0,0,0,0.08)] ring-1 ring-white sm:w-40">
                    <div className="flex aspect-square flex-col items-center justify-center rounded-xl bg-[#87D8FF]/15 text-[#5eb8e0]">
                        <Instagram size={28} />
                        <p className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                            Your account
                        </p>
                    </div>
                </div>

                <div className="absolute -bottom-12 -left-3 max-w-[220px] rounded-2xl bg-white p-4 shadow-[0_16px_40px_rgba(0,0,0,0.08)] ring-1 ring-white">
                    <p className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        <X size={11} className="text-[#FF5A5F]" /> We won't
                    </p>
                    <ul className="space-y-1.5">
                        {WONT_ITEMS.map((item) => (
                            <li key={item} className="text-xs font-medium text-gray-600">
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </PageBackdrop>
    );
}
