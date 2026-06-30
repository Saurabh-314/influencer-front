import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    Instagram,
    ArrowRight,
    Star,
    Music,
    PlayCircle,
    Eye,
    Users,
    TrendingUp,
    CheckCircle2,
    X,
    Zap,
    Link2,
    Video,
    Loader2,
    Clock,
} from 'lucide-react';
import { useConnectInstagram, useInstagramAccount, useSyncAccount } from '@/hooks/useSocialAccounts';
import {
    useCampaigns,
    useMySubmissions,
    useCreatorEarnings,
    useApplyCampaign,
    getPayoutForRank,
    getCampaignColor,
    type Campaign,
    type CampaignSubmission,
} from '@/hooks/useCampaigns';
import { formatCount, getVusicRank } from '@/utils/creator';
import { resolveAssetUrl } from '@/utils/image';

type SelectedGig = Campaign & { payout: number; color: string };

function StatItem({ label, value, color }: { label: string; value: number; color: string }) {
    return (
        <div className="flex flex-col items-center">
            <span className={`text-sm font-semibold tracking-tight ${color}`}>{value}</span>
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{label}</span>
        </div>
    );
}

export default function CreatorDashboard() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [selectedGig, setSelectedGig] = useState<SelectedGig | null>(null);
    const [applyError, setApplyError] = useState('');

    const { instagram, isLoading: accountsLoading } = useInstagramAccount();
    const { mutate: connectInstagram, isPending: isConnecting } = useConnectInstagram('creator');
    const { mutate: applyCampaign, isPending: isApplying } = useApplyCampaign();
    const { data: syncData, isLoading: syncLoading } = useSyncAccount(instagram?.id);
    const { data: campaigns, isLoading: campaignsLoading } = useCampaigns();
    const { data: submissions, isLoading: submissionsLoading } = useMySubmissions();
    const { data: earnings, isLoading: earningsLoading } = useCreatorEarnings(!!instagram);

    const success = searchParams.get('success');
    const urlError = searchParams.get('error');

    const clearOAuthParams = () => {
        searchParams.delete('success');
        searchParams.delete('error');
        setSearchParams(searchParams, { replace: true });
    };

    const participatedCampaignIds = useMemo(
        () => new Set(submissions?.map((s) => s.campaign_id) ?? []),
        [submissions],
    );

    const inProgressSubmissions = useMemo(
        () => submissions?.filter((s) => s.status === 'applied') ?? [],
        [submissions],
    );

    const completedSubmissions = useMemo(
        () => submissions?.filter((s) => s.status !== 'applied') ?? [],
        [submissions],
    );

    if (accountsLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-[#87D8FF]" />
            </div>
        );
    }

    if (!instagram) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)] text-center">
                    {success && (
                        <div className="mb-4 p-3 text-sm text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-xl">
                            Account connected successfully!
                        </div>
                    )}
                    {urlError && (
                        <div className="mb-4 p-3 text-sm text-[#FF5A5F] bg-red-50 border border-red-100 rounded-xl">
                            {urlError.replace(/_/g, ' ')}
                        </div>
                    )}
                    <div className="w-16 h-16 bg-[#87D8FF]/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-[#87D8FF]">
                        <Instagram size={32} />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 tracking-tight mb-2">Connect Your Audience</h2>
                    <p className="text-sm font-medium text-gray-500 mb-8 leading-relaxed">
                        Link your Instagram account to unlock exclusive music campaigns tailored to your specific
                        engagement stats and Vusic Rank.
                    </p>
                    <button
                        onClick={() => {
                            clearOAuthParams();
                            connectInstagram();
                        }}
                        disabled={isConnecting}
                        className="w-full py-3.5 bg-[#87D8FF] hover:bg-[#7bc8ef] disabled:opacity-60 text-gray-900 text-sm font-semibold rounded-xl shadow-sm transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2"
                    >
                        {isConnecting ? (
                            <>
                                <Loader2 size={16} className="animate-spin" /> Connecting...
                            </>
                        ) : (
                            <>
                                Connect Instagram <ArrowRight size={16} />
                            </>
                        )}
                    </button>
                </div>
            </div>
        );
    }

    const profile = syncData?.profile;
    const followers = profile?.followers_count ?? instagram.followers_count ?? 0;
    const engagement = syncData?.engagement_rate ?? instagram.engagement_rate ?? 0;
    const rank = getVusicRank(followers);
    const reelsStats = syncData?.reels_stats ?? { total: 0, '>1k': 0, '>10k': 0, '>100k': 0, '>1m': 0, '>10m': 0 };
    const avatar =
        profile?.profile_picture_url ||
        instagram.profile_image ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(instagram.display_name || instagram.username)}&background=87D8FF&color=fff`;
    const displayName = profile?.name || instagram.display_name || instagram.username;

    const availableCampaigns = campaigns?.filter((c) => !participatedCampaignIds.has(c.id)) ?? [];

    const handleApply = (gig: SelectedGig) => {
        if (!instagram) return;
        setApplyError('');
        applyCampaign(
            { campaign_id: gig.id, social_account_id: Number(instagram.id) },
            {
                onSuccess: () => {
                    if (gig.spotify_link) {
                        window.open(gig.spotify_link, '_blank');
                    }
                    setSelectedGig(null);
                    navigate(`/creator/campaigns/${gig.id}`);
                },
                onError: (err: { response?: { data?: { message?: string } } }) => {
                    setApplyError(err.response?.data?.message || 'Failed to apply');
                },
            },
        );
    };

    const renderCampaignRow = (campaign: Campaign, payout: number, color: string, onClick: () => void) => (
        <div
            key={campaign.id}
            onClick={onClick}
            className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-4 hover:border-[#87D8FF] hover:shadow-sm transition-all duration-300 hover:scale-[1.01] cursor-pointer group"
        >
            {campaign.track_artwork_url ? (
                <img
                    src={resolveAssetUrl(campaign.track_artwork_url)}
                    alt={campaign.title}
                    className="w-14 h-14 rounded-xl object-cover shadow-inner"
                />
            ) : (
                <div className={`w-14 h-14 rounded-xl ${color} flex items-center justify-center shadow-inner`}>
                    <Music size={20} className="text-white opacity-80" />
                </div>
            )}
            <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm text-gray-900 truncate">{campaign.title}</h4>
                <p className="text-xs font-medium text-gray-500 truncate">
                    {campaign.brand_name || 'Brand'} • {campaign.genre || campaign.campaign_type}
                </p>
            </div>
            <div className="text-right flex-shrink-0">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-0.5">Payout</p>
                <p className="text-sm font-semibold text-gray-900 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100 group-hover:bg-[#87D8FF]/10 transition-colors">
                    ₹{payout.toLocaleString()}
                </p>
            </div>
        </div>
    );

    const renderInProgressRow = (submission: CampaignSubmission) => {
        const campaign = submission.campaign;
        if (!campaign) return null;
        const payout = getPayoutForRank(campaign, rank.rank);
        const color = getCampaignColor(campaign, rank.rank);
        return renderCampaignRow(campaign, payout, color, () => navigate(`/creator/campaigns/${campaign.id}`));
    };

    const totalEarned = earnings?.totalEarned ?? 0;
    const balance = earnings?.balance ?? 0;
    const pendingBalance = earnings?.pendingBalance ?? 0;

    const formatSubmissionDate = (dateStr: string) =>
        new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    const getSubmissionStatusLabel = (status: string) => {
        if (status === 'approved') return 'Paid';
        if (status === 'rejected') return 'Rejected';
        return 'Pending';
    };

    const getSubmissionStatusColor = (status: string) => {
        if (status === 'approved') return 'text-emerald-600';
        if (status === 'rejected') return 'text-red-500';
        return 'text-amber-600';
    };

    return (
        <>
            {success && (
                <div className="mb-4 p-3 text-sm text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-xl max-w-5xl mx-auto">
                    Instagram connected successfully!
                </div>
            )}

            <div className="max-w-5xl mx-auto space-y-6">
                <div className="bg-white rounded-[2rem] border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)] overflow-hidden">
                    <div className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative">
                        <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-[#87D8FF]/5 to-transparent pointer-events-none" />

                        <div className="flex items-center gap-6 z-10 w-full md:w-auto">
                            <div className="relative">
                                <img
                                    src={avatar}
                                    alt="Profile"
                                    className="w-20 h-20 rounded-[1.2rem] border border-gray-100 shadow-sm object-cover"
                                />
                                <div className="absolute -bottom-2 -right-2 bg-white p-1 rounded-lg shadow-sm border border-gray-100">
                                    <Instagram size={14} className="text-[#FF5A5F]" />
                                </div>
                            </div>
                            <div>
                                <h2 className="text-2xl font-semibold text-gray-900 tracking-tight mb-1">{displayName}</h2>
                                <div className="flex items-center gap-4 text-sm font-medium text-gray-500">
                                    <span className="flex items-center gap-1">
                                        <Users size={14} /> {formatCount(followers)}
                                    </span>
                                    <span className="flex items-center gap-1 text-emerald-500">
                                        <TrendingUp size={14} /> {Number(engagement).toFixed(1)}% ER
                                    </span>
                                </div>
                                <div className="mt-2 inline-flex items-center gap-1.5 bg-[#FFE98F]/40 text-[#d48e00] px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider">
                                    <Star size={10} /> Rank {rank.rank} {rank.label}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col items-start md:items-end w-full md:w-auto z-10 p-4 md:p-0 bg-gray-50 md:bg-transparent rounded-2xl md:rounded-none gap-3">
                            <div>
                                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-1 text-left md:text-right">
                                    Total Earned
                                </p>
                                <h3 className="text-4xl md:text-5xl font-semibold tracking-tight text-gray-900 flex items-baseline gap-1">
                                    <span className="text-2xl text-gray-400 font-medium">₹</span>
                                    {earningsLoading ? (
                                        <Loader2 size={28} className="animate-spin text-gray-300" />
                                    ) : (
                                        totalEarned.toLocaleString()
                                    )}
                                </h3>
                                <div className="mt-2 flex items-center gap-2 md:justify-end">
                                    <span className="text-xs font-medium text-gray-500">Balance:</span>
                                    <span className="text-xs font-semibold bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded border border-emerald-100">
                                        {earningsLoading ? '...' : `₹${balance.toLocaleString()}`}
                                    </span>
                                    {!earningsLoading && pendingBalance > 0 && (
                                        <span className="text-xs font-medium text-amber-600">
                                            (+₹{pendingBalance.toLocaleString()} pending)
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 border-t border-gray-100 px-6 py-4 flex items-center justify-between overflow-x-auto gap-4">
                        <div className="flex items-center gap-2 min-w-max">
                            <Video size={16} className="text-gray-400" />
                            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest">
                                Reels Analytics
                            </span>
                            {syncLoading && <Loader2 size={12} className="animate-spin text-gray-400" />}
                        </div>
                        <div className="flex items-center gap-6 min-w-max text-sm">
                            <StatItem label="Total" value={reelsStats.total} color="text-gray-900" />
                            <StatItem label="> 1K" value={reelsStats['>1k']} color="text-[#87D8FF]" />
                            <StatItem label="> 10K" value={reelsStats['>10k']} color="text-[#FFA542]" />
                            <StatItem label="> 100K" value={reelsStats['>100k']} color="text-[#FF5A5F]" />
                            <StatItem label="> 1M" value={reelsStats['>1m']} color="text-emerald-500" />
                            <StatItem label="> 10M" value={reelsStats['>10m']} color="text-purple-500" />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-sm font-semibold tracking-tight text-gray-900 flex items-center gap-2">
                                <Zap size={16} className="text-[#FFA542]" /> Available Music Gigs
                            </h3>
                            {campaignsLoading && <Loader2 size={14} className="animate-spin text-gray-400" />}
                        </div>
                        <div className="space-y-3">
                            {campaignsLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="h-6 w-6 animate-spin text-[#87D8FF]" />
                                </div>
                            ) : availableCampaigns.length === 0 ? (
                                <p className="text-sm text-gray-500 px-2 py-4">No available gigs right now. Check back soon!</p>
                            ) : (
                                availableCampaigns.map((campaign) => {
                                    const payout = getPayoutForRank(campaign, rank.rank);
                                    const color = getCampaignColor(campaign, rank.rank);
                                    return renderCampaignRow(campaign, payout, color, () =>
                                        setSelectedGig({ ...campaign, payout, color }),
                                    );
                                })
                            )}
                        </div>

                        {inProgressSubmissions.length > 0 && (
                            <div className="space-y-3 pt-2">
                                <h3 className="text-sm font-semibold tracking-tight text-gray-900 flex items-center gap-2 px-2">
                                    <Clock size={16} className="text-amber-500" /> In Progress
                                </h3>
                                {inProgressSubmissions.map(renderInProgressRow)}
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-sm font-semibold tracking-tight text-gray-900">Completed Campaigns</h3>
                            {submissionsLoading && <Loader2 size={14} className="animate-spin text-gray-400" />}
                        </div>
                        <div className="bg-white border border-gray-100 rounded-[1.5rem] p-2">
                            {submissionsLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="h-6 w-6 animate-spin text-[#87D8FF]" />
                                </div>
                            ) : !completedSubmissions.length ? (
                                <p className="text-sm text-gray-500 px-4 py-6 text-center">No campaigns completed yet.</p>
                            ) : (
                                completedSubmissions.map((submission, idx) => {
                                    const earned = submission.payout_amount ?? getPayoutForRank(submission.campaign, rank.rank);
                                    const date = formatSubmissionDate(
                                        submission.submitted_at ?? submission.approved_at ?? submission.createdAt,
                                    );
                                    return (
                                        <div
                                            key={submission.id}
                                            className={`p-4 flex items-center justify-between ${
                                                idx !== completedSubmissions.length - 1 ? 'border-b border-gray-50' : ''
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100">
                                                    <CheckCircle2 size={16} className="text-emerald-500" />
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-xs text-gray-900">
                                                        {submission.campaign?.title ?? 'Unknown Campaign'}
                                                    </h4>
                                                    <p className="text-[10px] font-medium text-gray-500 flex items-center gap-2 mt-0.5">
                                                        <span>
                                                            <Eye size={10} className="inline mr-0.5" /> {formatCount(submission.views)}
                                                        </span>{' '}
                                                        • <span>{date}</span>
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-xs font-semibold text-gray-900 block">
                                                    ₹{earned.toLocaleString()}
                                                </span>
                                                <span className={`text-[10px] font-medium ${getSubmissionStatusColor(submission.status)}`}>
                                                    {getSubmissionStatusLabel(submission.status)}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {selectedGig && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-6">
                    <div
                        className="absolute inset-0 bg-gray-900/20 backdrop-blur-sm transition-opacity"
                        onClick={() => setSelectedGig(null)}
                    />
                    <div className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden">
                        <div className="relative h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
                            <div className={`absolute inset-0 ${selectedGig.color} opacity-20`} />
                            {selectedGig.track_artwork_url ? (
                                <img
                                    src={resolveAssetUrl(selectedGig.track_artwork_url)}
                                    alt={selectedGig.title}
                                    className="w-24 h-24 rounded-2xl shadow-lg object-cover z-10 transform -rotate-6"
                                />
                            ) : (
                                <div className={`w-24 h-24 rounded-2xl ${selectedGig.color} shadow-lg flex items-center justify-center z-10 transform -rotate-6`}>
                                    <Music size={40} className="text-white" />
                                </div>
                            )}
                            <button
                                onClick={() => setSelectedGig(null)}
                                className="absolute top-4 right-4 w-8 h-8 bg-white/50 backdrop-blur rounded-full flex items-center justify-center text-gray-800 hover:bg-white z-20 transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <div className="p-6 md:p-8">
                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1 block">
                                        {selectedGig.brand_name || 'Brand'} Campaign
                                    </span>
                                    <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">{selectedGig.title}</h2>
                                    {selectedGig.genre && (
                                        <p className="text-sm font-medium text-gray-500 mt-1">{selectedGig.genre}</p>
                                    )}
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">
                                        Your Dynamic Payout
                                    </p>
                                    <p className="text-2xl font-semibold text-emerald-500 tracking-tight">
                                        ₹{selectedGig.payout.toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4 mb-8">
                                {selectedGig.spotify_link && (
                                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex items-center gap-3">
                                        <div className="w-10 h-10 bg-[#1DB954]/10 rounded-full flex items-center justify-center">
                                            <Link2 size={16} className="text-[#1DB954]" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-semibold text-gray-900">Audio Source</p>
                                            <p className="text-[10px] font-medium text-gray-500 truncate">
                                                {selectedGig.spotify_link}
                                            </p>
                                        </div>
                                        <a
                                            href={selectedGig.spotify_link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs font-medium bg-white border border-gray-200 px-3 py-1.5 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
                                        >
                                            Preview
                                        </a>
                                    </div>
                                )}

                                {selectedGig.description && (
                                    <div>
                                        <h4 className="text-xs font-semibold text-gray-900 mb-2">Brief & Requirements</h4>
                                        <p className="text-sm text-gray-600 font-medium leading-relaxed bg-white border border-gray-100 p-4 rounded-xl shadow-sm">
                                            {selectedGig.description}
                                            {selectedGig.hashtags && (
                                                <>
                                                    {' '}
                                                    Use hashtags:{' '}
                                                    <strong className="text-[#87D8FF]">{selectedGig.hashtags}</strong>
                                                </>
                                            )}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {applyError && (
                                <p className="text-sm text-[#FF5A5F] bg-red-50 border border-red-100 rounded-xl p-3 mb-4">
                                    {applyError}
                                </p>
                            )}

                            <button
                                onClick={() => handleApply(selectedGig)}
                                disabled={isApplying || !instagram}
                                className="w-full py-4 bg-[#FF5A5F] hover:bg-[#ff464b] disabled:opacity-60 text-white text-sm font-semibold rounded-xl shadow-lg shadow-[#FF5A5F]/20 transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2"
                            >
                                {isApplying ? (
                                    <Loader2 size={18} className="animate-spin" />
                                ) : (
                                    <>
                                        Apply & Claim Audio <PlayCircle size={18} />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
