import { useEffect, useState, type ComponentType, type ReactNode } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import {
    Check,
    Clock,
    IndianRupee,
    Instagram,
    List,
    MessageSquareOff,
    Shield,
    ShieldCheck,
    Sparkles,
    Star,
    TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCount } from '@/utils/creator';
import { getInstagramOAuthErrorMessage, clearInstagramOAuthSearchParams } from '@/utils/socialAccounts';
import { getRoleDashboardPath, getStoredUser, needsOnboarding, type OnboardingData } from '@/utils/auth';
import { useSaveOnboarding } from '@/hooks/useOnboarding';
import { useConnectInstagram, useInstagramAccount, useSyncAccount } from '@/hooks/useSocialAccounts';
import {
    CONTENT_CATEGORIES,
    CREATOR_TYPES,
    LANGUAGES,
    LOCATIONS,
    ONBOARDING_STEPS,
    creatorTypeLabel,
} from '@/constants/onboarding';

const emptyData: OnboardingData = {
    creatorType: undefined,
    contentCategories: [],
    opportunities: [],
    brandInterests: [],
    location: undefined,
    languages: [],
    earningGoal: 'max_earn',
};

function ChoiceCard({
    selected,
    icon: Icon,
    title,
    desc,
    onClick,
}: {
    selected: boolean;
    icon: ComponentType<{ size?: number; className?: string }>;
    title: string;
    desc: string;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                'flex min-h-[68px] items-center gap-3 rounded-2xl border bg-white px-[18px] py-[17px] text-left transition hover:-translate-y-px',
                selected
                    ? 'border-[#e9408a] bg-[#fff4f8] shadow-[0_0_0_2px_rgba(233,64,138,0.07)]'
                    : 'border-[#e8e8ee] hover:border-[#d7d7df]',
            )}
        >
            <div
                className={cn(
                    'grid h-9 w-9 flex-none place-items-center rounded-[11px]',
                    selected ? 'bg-white text-[#e9408a]' : 'bg-[#f4f4f7] text-[#4b4d55]',
                )}
            >
                <Icon size={18} />
            </div>
            <div>
                <div className="text-sm font-bold text-[#111318]">{title}</div>
                <div className="mt-0.5 text-xs text-[#8a8c94]">{desc}</div>
            </div>
            <div
                className={cn(
                    'ml-auto grid h-5 w-5 flex-none place-items-center rounded-full border text-[11px]',
                    selected ? 'border-[#e9408a] bg-[#e9408a] text-white' : 'border-[#d7d7df] text-transparent',
                )}
            >
                ✓
            </div>
        </button>
    );
}

function Pill({
    selected,
    children,
    onClick,
}: {
    selected: boolean;
    children: string;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                'rounded-[11px] border px-3.5 py-2.5 text-[13px] transition',
                selected
                    ? 'border-[#e9408a] bg-[#fff1f7] font-bold text-[#bd2868]'
                    : 'border-[#e8e8ee] bg-white text-[#111318]',
            )}
        >
            {children}
        </button>
    );
}

function PrimaryButton({
    children,
    onClick,
    disabled,
    className,
}: {
    children: ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    className?: string;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={cn(
                'rounded-xl bg-[#111318] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#25262b] disabled:cursor-not-allowed disabled:opacity-45',
                className,
            )}
        >
            {children}
        </button>
    );
}

function SecondaryButton({ children, onClick }: { children: ReactNode; onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="rounded-xl bg-[#f1f1f5] px-5 py-3.5 text-sm font-bold text-[#333] transition hover:bg-[#e8e8ee]"
        >
            {children}
        </button>
    );
}

function Progress({ value }: { value: number }) {
    return (
        <div className="mb-[30px] h-[5px] overflow-hidden rounded-full bg-[#eeeef3]">
            <span
                className="block h-full rounded-full bg-[linear-gradient(90deg,#e9408a,#ff7bb4)] transition-all"
                style={{ width: `${value}%` }}
            />
        </div>
    );
}

function profileStrength(data: OnboardingData, connected: boolean) {
    let score = 0;
    if (connected) score += 40;
    if (data.creatorType) score += 10;
    if ((data.contentCategories?.length || 0) > 0) score += 15;
    if ((data.opportunities?.length || 0) > 0) score += 10;
    if (data.location) score += 10;
    if ((data.languages?.length || 0) > 0) score += 10;
    if (data.earningGoal) score += 5;
    return score;
}

export default function Onboarding() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const stored = getStoredUser();
    const saveOnboarding = useSaveOnboarding();
    const { instagram } = useInstagramAccount();
    const { mutate: connectInstagram, isPending: isConnecting } = useConnectInstagram('onboarding');
    const { data: syncData } = useSyncAccount(instagram?.id);

    const [step, setStep] = useState(() => {
        const saved = stored?.onboarding_step || 1;
        if (saved >= 8) return 7;
        if (saved === 7) return 6;
        return saved;
    });
    const [data, setData] = useState<OnboardingData>({
        ...emptyData,
        ...(stored?.onboarding_data || {}),
    });
    const [connecting, setConnecting] = useState(false);

    const oauthError = getInstagramOAuthErrorMessage(
        searchParams.get('error'),
        searchParams.get('error_description'),
    );
    const oauthSuccess = searchParams.get('success') === 'connected';

    useEffect(() => {
        if (!oauthSuccess && !oauthError) return;
        if (oauthSuccess) {
            setStep(6);
            saveOnboarding.mutate({ step: 6, data });
        } else {
            setStep(4);
        }
        clearInstagramOAuthSearchParams(searchParams);
        setSearchParams(searchParams, { replace: true });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [oauthSuccess, oauthError]);

    const followers = syncData?.profile?.followers_count ?? instagram?.followers_count ?? 0;
    const engagement = syncData?.engagement_rate ?? instagram?.engagement_rate ?? 0;
    const displayName = syncData?.profile?.name || instagram?.display_name || instagram?.username || stored?.name;
    const username = instagram?.username;
    const strength = profileStrength(data, !!instagram);
    const avatarUrl = instagram?.profile_image || stored?.profile_image;
    const profileMeta = [
        instagram ? `${formatCount(followers)} followers` : null,
        data.creatorType ? creatorTypeLabel(data.creatorType) : null,
        data.location || data.contentCategories?.[0],
    ]
        .filter(Boolean)
        .join(' · ');

    if (!stored) {
        return <Navigate to="/login" replace />;
    }
    if (stored.role !== 'creator') {
        return <Navigate to={getRoleDashboardPath(stored.role)} replace />;
    }
    if (!needsOnboarding(stored) && stored.onboarding_completed) {
        return <Navigate to="/creator/dashboard" replace />;
    }

    const go = async (next: number, extra?: OnboardingData, completed = false) => {
        const nextData = { ...data, ...extra };
        setData(nextData);
        setStep(next);
        await saveOnboarding.mutateAsync({ step: next, data: nextData, completed });
        if (completed) {
            navigate('/creator/dashboard', { replace: true });
        }
    };

    const startMeta = () => {
        setConnecting(true);
        saveOnboarding.mutate({ step: 5, data });
        connectInstagram();
    };

    const toggleList = (key: 'contentCategories' | 'opportunities' | 'brandInterests' | 'languages', value: string, max?: number) => {
        const current = data[key] || [];
        const exists = current.includes(value);
        if (!exists && max && current.length >= max) return;
        setData({
            ...data,
            [key]: exists ? current.filter((item) => item !== value) : [...current, value],
        });
    };

    return (
        <div className="min-h-screen bg-[#f6f7fb] font-manrope text-[#111318]">
            <div className="mx-auto w-full max-w-[1180px] px-3 py-4 sm:px-7 sm:py-7">
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                    <Link to="/" className="text-[22px] font-extrabold tracking-[-0.8px]">
                        Buzooka<span className="text-[#e9408a]">.</span>
                    </Link>
                    <p className="order-last w-full text-center text-xs leading-relaxed text-[#777] sm:order-none sm:w-auto sm:flex-1 sm:px-4">
                        Takes about <b className="font-semibold text-[#333]">2 minutes</b>.
                        {' '}Most information will be filled automatically from Instagram.
                    </p>
                    <div className="rounded-full border border-[#e8e8ee] bg-white px-3.5 py-2 text-[13px] text-[#777]">
                        Step {step} of {ONBOARDING_STEPS.length}
                    </div>
                </div>

                <div className="grid min-h-[720px] overflow-hidden rounded-3xl border border-[#e7e7ed] bg-white shadow-[0_18px_60px_rgba(20,20,40,0.07)] lg:grid-cols-[250px_1fr]">
                    <aside className="hidden border-r border-[#ededf2] bg-[#fafafd] px-5 py-7 lg:block">
                        <p className="mb-[18px] ml-2.5 mt-1 text-xs uppercase tracking-[1px] text-[#999]">
                            Creator onboarding
                        </p>
                        {ONBOARDING_STEPS.map((label, index) => {
                            const number = index + 1;
                            const active = number === step;
                            const done = number < step;
                            return (
                                <div
                                    key={label}
                                    className={cn(
                                        'mb-1.5 flex items-center gap-3 rounded-xl px-2.5 py-3 text-sm',
                                        active ? 'bg-[#fff0f7] text-[#111]' : done ? 'text-[#333]' : 'text-[#8a8c94]',
                                    )}
                                >
                                    <span
                                        className={cn(
                                            'grid h-[27px] w-[27px] place-items-center rounded-full text-xs font-bold',
                                            active
                                                ? 'bg-[#e9408a] text-white'
                                                : done
                                                    ? 'bg-[#e9f8f0] text-[#15945a]'
                                                    : 'bg-[#ececf2] text-[#8a8c94]',
                                        )}
                                    >
                                        {done ? '✓' : number}
                                    </span>
                                    {label}
                                </div>
                            );
                        })}
                    </aside>

                    <main className="flex items-center justify-center px-5 py-8 sm:px-10 lg:px-16">
                        <div className="w-full max-w-[650px]">
                            {step === 1 && (
                                <>
                                    <p className="mb-2.5 text-xs font-extrabold uppercase tracking-[1.5px] text-[#e9408a]">
                                        Welcome to Buzooka
                                    </p>
                                    <h1 className="mb-3 text-[31px] font-extrabold leading-[1.08] tracking-[-1.7px] lg:text-[38px]">
                                        Let's build your creator profile.
                                    </h1>
                                    <p className="mb-7 text-base leading-relaxed text-[#70727b]">
                                        A few quick questions help us match you with better brands, campaigns and opportunities.
                                    </p>
                                    <div className="mb-7 flex items-center gap-4 rounded-[19px] border border-[#e8e8ee] p-5">
                                        <div className="grid h-[54px] w-[54px] place-items-center rounded-2xl bg-[#111318] text-white">
                                            <Sparkles size={24} />
                                        </div>
                                        <div>
                                            <div className="text-base font-bold">Built for creators</div>
                                            <div className="mt-1 text-[13px] text-[#858791]">
                                                Tell us what you create. We'll handle the rest.
                                            </div>
                                        </div>
                                    </div>
                                    <PrimaryButton onClick={() => go(2)}>Let's get started →</PrimaryButton>
                                </>
                            )}

                            {step === 2 && (
                                <>
                                    <p className="mb-2.5 text-xs font-extrabold uppercase tracking-[1.5px] text-[#e9408a]">About you</p>
                                    <h1 className="mb-3 text-[31px] font-extrabold leading-[1.08] tracking-[-1.7px] lg:text-[38px]">
                                        What best describes you?
                                    </h1>
                                    <p className="mb-7 text-base leading-relaxed text-[#70727b]">
                                        Choose the option that fits your creator identity.
                                    </p>
                                    <Progress value={28} />
                                    <div className="mb-7 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                        {CREATOR_TYPES.map((item) => (
                                            <ChoiceCard
                                                key={item.id}
                                                selected={data.creatorType === item.id}
                                                icon={item.icon}
                                                title={item.title}
                                                desc={item.desc}
                                                onClick={() => setData({ ...data, creatorType: item.id })}
                                            />
                                        ))}
                                    </div>
                                    <div className="flex gap-2.5">
                                        <SecondaryButton onClick={() => setStep(1)}>Back</SecondaryButton>
                                        <PrimaryButton className="flex-1" disabled={!data.creatorType} onClick={() => go(3)}>
                                            Continue →
                                        </PrimaryButton>
                                    </div>
                                </>
                            )}

                            {step === 3 && (
                                <>
                                    <p className="mb-2.5 text-xs font-extrabold uppercase tracking-[1.5px] text-[#e9408a]">Your content</p>
                                    <h1 className="mb-3 text-[31px] font-extrabold leading-[1.08] tracking-[-1.7px] lg:text-[38px]">
                                        What do you create?
                                    </h1>
                                    <p className="mb-7 text-base leading-relaxed text-[#70727b]">
                                        Pick up to 5 categories. This helps brands find the right creators.
                                    </p>
                                    <Progress value={42} />
                                    <div className="mb-4 flex flex-wrap gap-2">
                                        {CONTENT_CATEGORIES.map((item) => (
                                            <button
                                                key={item}
                                                type="button"
                                                onClick={() => toggleList('contentCategories', item, 5)}
                                                className={cn(
                                                    'rounded-full border px-3.5 py-2.5 text-[13px] transition',
                                                    data.contentCategories?.includes(item)
                                                        ? 'border-[#e9408a] bg-[#fff1f7] font-bold text-[#bd2868]'
                                                        : 'border-[#e8e8ee] bg-white',
                                                )}
                                            >
                                                {item}
                                            </button>
                                        ))}
                                    </div>
                                    <p className="mb-6 text-xs text-[#8b8d96]">
                                        {data.contentCategories?.length || 0} of 5 selected
                                    </p>
                                    <div className="flex gap-2.5">
                                        <SecondaryButton onClick={() => setStep(2)}>Back</SecondaryButton>
                                        <PrimaryButton
                                            className="flex-1"
                                            disabled={!data.contentCategories?.length}
                                            onClick={() => go(4)}
                                        >
                                            Continue →
                                        </PrimaryButton>
                                    </div>
                                </>
                            )}

                            {step === 4 && (
                                <>
                                    <p className="mb-2.5 text-xs font-extrabold uppercase tracking-[1.5px] text-[#e9408a]">
                                        Connect account
                                    </p>
                                    <h1 className="mb-3 text-[31px] font-extrabold leading-[1.08] tracking-[-1.7px] lg:text-[38px]">
                                        Connect Instagram.<br />
                                        Get discovered. Get paid.
                                    </h1>
                                    <p className="mb-7 text-base leading-relaxed text-[#70727b]">
                                        Connect your Instagram through Facebook Login. You need a Professional Instagram account linked to a Facebook Page so we can read insights, publish reels, and attach Instagram music.
                                    </p>
                                    {oauthError && <p className="mb-4 text-sm font-medium text-red-500">{oauthError}</p>}
                                    <div className="mb-5 flex items-center gap-4 rounded-[19px] border border-[#e8e8ee] p-5">
                                        <div className="grid h-[54px] w-[54px] place-items-center rounded-2xl bg-[#111318] text-white">
                                            <Instagram size={24} />
                                        </div>
                                        <div>
                                            <div className="text-base font-bold">
                                                {instagram ? `@${instagram.username}` : 'Instagram'}
                                                {instagram && (
                                                    <span className="ml-1.5 rounded-full bg-[#eaf9f1] px-2 py-1 text-xs text-[#168d58]">
                                                        ✓ Connected
                                                    </span>
                                                )}
                                            </div>
                                            <div className="mt-1 text-[13px] text-[#858791]">
                                                Secure professional account connection
                                            </div>
                                        </div>
                                    </div>
                                    {/* <div className="mb-7 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                        <div className="flex min-h-[68px] items-center gap-3 rounded-2xl border border-[#e9408a] bg-[#fff4f8] px-[18px] py-[17px]">
                                            <div className="grid h-9 w-9 place-items-center rounded-[11px] bg-white text-[#e9408a]">
                                                <Check size={18} />
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold">Profile information</div>
                                                <div className="mt-0.5 text-xs text-[#8a8c94]">Username, profile & account type</div>
                                            </div>
                                        </div>
                                        <div className="flex min-h-[68px] items-center gap-3 rounded-2xl border border-[#e9408a] bg-[#fff4f8] px-[18px] py-[17px]">
                                            <div className="grid h-9 w-9 place-items-center rounded-[11px] bg-white text-[#e9408a]">
                                                <Loader2 size={18} />
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold">Creator analytics</div>
                                                <div className="mt-0.5 text-xs text-[#8a8c94]">Where authorized & available</div>
                                            </div>
                                        </div>
                                    </div> */}
                                    <div className="mb-7 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                        <div className="flex min-h-[68px] items-center gap-3 rounded-2xl border hover:border-[#e9408a] px-[18px] py-[17px]">
                                            <div className="grid h-9 w-9 place-items-center rounded-[11px] bg-white text-[#e9408a]">
                                                <IndianRupee size={18} />
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold">Earn More</div>
                                                <div className="mt-0.5 text-xs text-[#8a8c94]">Get discovered by brands looking for creators like you and unlock paid collaboration opportunities.</div>
                                            </div>
                                        </div>
                                        <div className="flex min-h-[68px] items-center gap-3 rounded-2xl border hover:border-[#e9408a] px-[18px] py-[17px]">
                                            <div className="grid h-9 w-9 place-items-center rounded-[11px] bg-white text-[#e9408a]">
                                                <Clock size={18} />
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold">Get Discovered</div>
                                                <div className="mt-0.5 text-xs text-[#8a8c94]">Brands can find you based on your content, audience, category and performance.</div>
                                            </div>
                                        </div>
                                        <div className="flex min-h-[68px] items-center gap-3 rounded-2xl border hover:border-[#e9408a] px-[18px] py-[17px]">
                                            <div className="grid h-9 w-9 place-items-center rounded-[11px] bg-white text-[#e9408a]">
                                                <TrendingUp size={18} />
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold">Grow Your Following</div>
                                                <div className="mt-0.5 text-xs text-[#8a8c94]">Unlock relevant campaigns and content opportunities that can put you in front of new audiences.</div>
                                            </div>
                                        </div>
                                        <div className="flex min-h-[68px] items-center gap-3 rounded-2xl border hover:border-[#e9408a] px-[18px] py-[17px]">
                                            <div className="grid h-9 w-9 place-items-center rounded-[11px] bg-white text-[#e9408a]">
                                                <Star size={18} />
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold">Build Your Reputation</div>
                                                <div className="mt-0.5 text-xs text-[#8a8c94]">Show brands your real content and performance so they can see your creator potential.</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2.5">
                                        <SecondaryButton onClick={() => setStep(3)}>Back</SecondaryButton>
                                        <PrimaryButton
                                            className="flex-1"
                                            onClick={() => (instagram ? go(6) : go(5))}
                                        >
                                            {instagram ? 'Continue →' : 'Connect Instagram →'}
                                        </PrimaryButton>
                                    </div>
                                    <p className="mt-4 text-xs text-[#8b8d96]">
                                        You'll be redirected to Meta's official authorization flow.
                                    </p>
                                </>
                            )}

                            {step === 5 && (
                                <div className="mx-auto max-w-[560px] text-center">
                                    <div className="mb-3.5 inline-flex items-center gap-1.5 rounded-full bg-[#f4f4f7] px-2.5 py-1.5 text-[10px] font-bold text-[#555860]">
                                        <ShieldCheck size={14} />
                                        Secure connection through Meta
                                    </div>
                                    <div className="mx-auto mb-4 h-11 w-11 animate-spin rounded-full border-[3px] border-[#eeeef2] border-t-[#e9408a]" />
                                    <p className="mb-2.5 text-xs font-extrabold uppercase tracking-[1.5px] text-[#e9408a]">
                                        Private & secure
                                    </p>
                                    <h1 className="mb-2.5 text-[32px] font-extrabold leading-[1.08] tracking-[-1.7px]">
                                        You're being connected securely.
                                    </h1>
                                    <p className="mb-6 text-base leading-relaxed text-[#70727b]">
                                        Buzooka is preparing the official Meta authorization screen. You will review exactly what Instagram allows us to access before anything is connected.
                                    </p>
                                    <div className="mb-6 rounded-[18px] border border-[#e8e8ee] bg-[#fbfbfd] px-5 py-[18px] text-left">
                                        {[
                                            {
                                                icon: Shield,
                                                title: 'Official Meta authorization',
                                                body: 'Instagram is connected through Facebook Login for Business — Buzooka never asks you for your Instagram or Facebook password.',
                                            },
                                            {
                                                icon: List,
                                                title: 'Only approved permissions',
                                                body: 'You choose what to authorize. We only request the permissions needed for the creator features you use.',
                                            },
                                            {
                                                icon: MessageSquareOff,
                                                title: 'No password or private messages',
                                                body: 'Buzooka cannot see your Instagram password. We do not request access to your private messages through this connection.',
                                            },
                                            {
                                                icon: ShieldCheck,
                                                title: 'You stay in control',
                                                body: 'You can review, approve or cancel the connection on Meta\'s screen before access is granted.',
                                            },
                                        ].map((item, index) => (
                                            <div
                                                key={item.title}
                                                className={cn('flex items-start gap-3 py-2.5', index > 0 && 'border-t border-[#ededf1]')}
                                            >
                                                <div className="grid h-7 w-7 flex-none place-items-center rounded-[9px] bg-[#eaf9f1] text-[#168d58]">
                                                    <item.icon size={15} />
                                                </div>
                                                <div>
                                                    <strong className="mb-1 block text-xs">{item.title}</strong>
                                                    <span className="block text-[10.5px] leading-relaxed text-[#858891]">{item.body}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex gap-2.5">
                                        <SecondaryButton onClick={() => setStep(4)}>Back</SecondaryButton>
                                        <PrimaryButton className="flex-1" disabled={isConnecting || connecting} onClick={startMeta}>
                                            {isConnecting || connecting ? 'Opening Meta...' : 'Continue to Meta →'}
                                        </PrimaryButton>
                                    </div>
                                    <p className="mt-4 text-[10px] leading-relaxed text-[#999ba3]">
                                        Buzooka does not collect your Instagram password. Access is granted by Meta using the permissions you approve.
                                    </p>
                                </div>
                            )}

                            {step === 6 && (
                                <>
                                    <p className="mb-2.5 text-xs font-extrabold uppercase tracking-[1.5px] text-[#e9408a]">
                                        Your creator goals
                                    </p>
                                    <h1 className="mb-3 text-[31px] font-extrabold leading-[1.08] tracking-[-1.7px] lg:text-[38px]">
                                        Let's find the right opportunities for you.
                                    </h1>
                                    <p className="mb-7 text-base leading-relaxed text-[#70727b]">
                                        Now that we know your content, tell us what you want to achieve. We’ll use your profile to match you with campaigns that fit your audience and creator style.
                                    </p>
                                    <div className="mb-7 flex items-center gap-[13px] rounded-[19px] border border-[#e2e3e9] bg-white px-[17px] py-3.5">
                                        <div
                                            className="h-[47px] w-[47px] flex-none overflow-hidden rounded-full bg-[linear-gradient(135deg,#222,#999)] bg-cover bg-center"
                                            style={avatarUrl ? { backgroundImage: `url(${avatarUrl})` } : undefined}
                                        />
                                        <div className="min-w-0">
                                            <div className="text-[15px] font-bold">
                                                {username ? `@${username}` : displayName || '@yourusername'}
                                            </div>
                                            {profileMeta && (
                                                <div className="mt-1 text-[13px] text-[#858791]">{profileMeta}</div>
                                            )}
                                        </div>
                                        <div className="ml-auto flex-none text-[13px] font-bold text-[#ee3c89]">
                                            ✓ Instagram connected
                                        </div>
                                    </div>
                                    <div className="mb-6">
                                        <label className="mb-2.5 block text-[13px] font-bold">Where are you based?</label>
                                        <div className="flex flex-wrap gap-2.5">
                                            {LOCATIONS.map((item) => (
                                                <Pill
                                                    key={item}
                                                    selected={data.location === item}
                                                    onClick={() => setData({ ...data, location: item })}
                                                >
                                                    {item}
                                                </Pill>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="mb-8">
                                        <label className="mb-2.5 block text-[13px] font-bold">What languages do you create in?</label>
                                        <div className="flex flex-wrap gap-2.5">
                                            {LANGUAGES.map((item) => (
                                                <Pill
                                                    key={item}
                                                    selected={!!data.languages?.includes(item)}
                                                    onClick={() => toggleList('languages', item)}
                                                >
                                                    {item}
                                                </Pill>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex gap-2.5">
                                        <SecondaryButton onClick={() => setStep(instagram ? 4 : 5)}>Back</SecondaryButton>
                                        <PrimaryButton
                                            className="flex-1"
                                            disabled={!data.location || !data.languages?.length}
                                            onClick={() => go(7)}
                                        >
                                            Create my profile →
                                        </PrimaryButton>
                                    </div>
                                </>
                            )}

                            {step === 7 && (
                                <div className="text-center">
                                    <div className="mx-auto mb-[22px] grid h-[78px] w-[78px] place-items-center rounded-full bg-[#eaf9f1] text-[#15945a]">
                                        <Check size={34} />
                                    </div>
                                    <p className="mb-2.5 text-xs font-extrabold uppercase tracking-[1.5px] text-[#e9408a]">
                                        Your Buzooka profile
                                    </p>
                                    <h1 className="mb-3 text-[31px] font-extrabold leading-[1.08] tracking-[-1.7px] lg:text-[38px]">
                                        You're ready to be discovered.
                                    </h1>
                                    <p className="mb-6 text-base leading-relaxed text-[#70727b]">
                                        We've combined your answers with your Instagram data to build your creator profile.
                                    </p>
                                    <div className="mb-4 rounded-[20px] border border-[#e8e8ee] p-5 text-left">
                                        <div className="flex items-center gap-3.5">
                                            <div
                                                className="h-[54px] w-[54px] rounded-full bg-[linear-gradient(145deg,#15161b,#6b6d77)] bg-cover bg-center"
                                                style={
                                                    instagram?.profile_image
                                                        ? { backgroundImage: `url(${instagram.profile_image})` }
                                                        : undefined
                                                }
                                            />
                                            <div>
                                                <div className="text-base font-bold">
                                                    {username ? `@${username}` : displayName || 'Your profile'}
                                                    {instagram && (
                                                        <span className="ml-1.5 rounded-full bg-[#eaf9f1] px-2 py-1 text-xs text-[#168d58]">
                                                            ✓ Verified
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="mt-1 text-[13px] text-[#858791]">
                                                    {creatorTypeLabel(data.creatorType)}
                                                    {data.contentCategories?.length
                                                        ? ` · ${data.contentCategories.slice(0, 2).join(' · ')}`
                                                        : ''}
                                                    {' · Brand ready'}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-[18px] grid grid-cols-2 gap-3">
                                            <div className="rounded-[14px] bg-[#f7f7fa] p-3.5">
                                                <strong className="block text-[13px]">{instagram ? formatCount(followers) : '—'}</strong>
                                                <span className="text-xs text-[#858791]">Followers</span>
                                            </div>
                                            <div className="rounded-[14px] bg-[#f7f7fa] p-3.5">
                                                <strong className="block text-[13px]">
                                                    {instagram ? `${engagement.toFixed(1)}%` : '—'}
                                                </strong>
                                                <span className="text-xs text-[#858791]">Engagement</span>
                                            </div>
                                            <div className="rounded-[14px] bg-[#f7f7fa] p-3.5">
                                                <strong className="block text-[13px]">{data.location || 'India'}</strong>
                                                <span className="text-xs text-[#858791]">Primary market</span>
                                            </div>
                                            <div className="rounded-[14px] bg-[#f7f7fa] p-3.5">
                                                <strong className="block text-[13px]">
                                                    {data.languages?.length ? data.languages.slice(0, 2).join(' + ') : '—'}
                                                </strong>
                                                <span className="text-xs text-[#858791]">Content languages</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="rounded-[19px] border border-[#e8e8ee] p-5 text-left">
                                        <div className="mb-2.5 flex items-center justify-between">
                                            <strong className="text-sm">Profile strength</strong>
                                            <b className="text-sm text-[#e9408a]">{strength}%</b>
                                        </div>
                                        <div className="h-2 overflow-hidden rounded-full bg-[#eeeef3]">
                                            <span
                                                className="block h-full rounded-full bg-[linear-gradient(90deg,#e9408a,#ff85b9)]"
                                                style={{ width: `${strength}%` }}
                                            />
                                        </div>
                                        <p className="mt-3 text-xs text-[#8b8d96]">
                                            Add your rates, bio and portfolio later to reach 100%.
                                        </p>
                                    </div>
                                    <PrimaryButton className="mt-[22px]" onClick={() => go(7, undefined, true)}>
                                        Go to my dashboard →
                                    </PrimaryButton>
                                </div>
                            )}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
