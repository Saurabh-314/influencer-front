import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
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
    // BarChart3,
} from 'lucide-react';
import { useConnectInstagram, useInstagramAccount, useSyncAccount } from '@/hooks/useSocialAccounts';
import { computeReelsStats, formatCount, getVusicRank } from '@/utils/creator';

const MUSIC_GIGS = [
    { id: 1, title: 'Summer Vibes Anthem', artist: 'DJ Horizon', genre: 'Electronic', baseAmount: 200, multiplier: 5, color: 'bg-[#FF5A5F]', brand: 'Sony Music' },
    { id: 2, title: 'Midnight City Lights', artist: 'The Synthwave', genre: 'Pop', baseAmount: 150, multiplier: 4, color: 'bg-[#87D8FF]', brand: 'Universal' },
    { id: 3, title: 'Acoustic Sunrise', artist: 'Maya & The Woods', genre: 'Indie', baseAmount: 100, multiplier: 3, color: 'bg-[#FFA542]', brand: 'Indie Label' },
    { id: 4, title: 'Street Flow (Beat 1)', artist: 'MC Kilo', genre: 'Hip-Hop', baseAmount: 300, multiplier: 6, color: 'bg-[#FBBF24]', brand: 'Def Jam' },
];

const COMPLETED_GIGS = [
    { id: 'c1', title: 'Neon Dreams Promo', views: '125K', earned: '₹12,500', status: 'Paid', date: 'Oct 24' },
    { id: 'c2', title: 'Acoustic Covers Vol 1', views: '45K', earned: '₹4,500', status: 'Paid', date: 'Oct 18' },
    { id: 'c3', title: 'Lo-Fi Study Beats', views: '88K', earned: '₹8,800', status: 'Pending', date: 'Oct 12' },
];

type SelectedGig = (typeof MUSIC_GIGS)[number] & { payout: number };

function StatItem({ label, value, color }: { label: string; value: number; color: string }) {
    return (
        <div className="flex flex-col items-center">
            <span className={`text-sm font-semibold tracking-tight ${color}`}>{value}</span>
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{label}</span>
        </div>
    );
}

export default function CreatorDashboard() {
    // const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [selectedGig, setSelectedGig] = useState<SelectedGig | null>(null);

    const { instagram, isLoading: accountsLoading } = useInstagramAccount();
    const { mutate: connectInstagram, isPending: isConnecting } = useConnectInstagram('creator');
    const { data: syncData, isLoading: syncLoading } = useSyncAccount(instagram?.id);

    const success = searchParams.get('success');
    const urlError = searchParams.get('error');

    const clearOAuthParams = () => {
        searchParams.delete('success');
        searchParams.delete('error');
        setSearchParams(searchParams, { replace: true });
    };

    const calculatePayout = (base: number, multiplier: number, rank: number) => {
        const scale = 5 - rank;
        return base * scale * multiplier;
    };

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
    const reelsStats = syncData?.media ? computeReelsStats(syncData.media) : { total: 0, '>1k': 0, '>10k': 0, '>100k': 0, '>1m': 0, '>10m': 0 };
    const avatar =
        profile?.profile_picture_url ||
        instagram.profile_image ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(instagram.display_name || instagram.username)}&background=87D8FF&color=fff`;
    const displayName = profile?.name || instagram.display_name || instagram.username;

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
                            {/* <button
                                onClick={() => navigate(`/creator/insights/${instagram.id}`)}
                                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-[#87D8FF]/10 text-[#87D8FF] border border-[#87D8FF]/20 rounded-xl hover:bg-[#87D8FF]/20 transition-colors"
                            >
                                <BarChart3 size={14} /> View Insights
                            </button> */}
                            <div>
                                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-1 text-left md:text-right">
                                    Total Earned
                                </p>
                                <h3 className="text-4xl md:text-5xl font-semibold tracking-tight text-gray-900 flex items-baseline gap-1">
                                    <span className="text-2xl text-gray-400 font-medium">₹</span>0
                                </h3>
                                <div className="mt-2 flex items-center gap-2 md:justify-end">
                                    <span className="text-xs font-medium text-gray-500">Balance:</span>
                                    <span className="text-xs font-semibold bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded border border-emerald-100">
                                        ₹0
                                    </span>
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
                        </div>
                        <div className="space-y-3">
                            {MUSIC_GIGS.map((gig) => {
                                const payout = calculatePayout(gig.baseAmount, gig.multiplier, rank.rank);
                                return (
                                    <div
                                        key={gig.id}
                                        onClick={() => setSelectedGig({ ...gig, payout })}
                                        className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-4 hover:border-[#87D8FF] hover:shadow-sm transition-all duration-300 hover:scale-[1.01] cursor-pointer group"
                                    >
                                        <div className={`w-14 h-14 rounded-xl ${gig.color} flex items-center justify-center shadow-inner`}>
                                            <Music size={20} className="text-white opacity-80" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-semibold text-sm text-gray-900 truncate">{gig.title}</h4>
                                            <p className="text-xs font-medium text-gray-500 truncate">
                                                {gig.brand} • {gig.genre}
                                            </p>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-0.5">
                                                Payout
                                            </p>
                                            <p className="text-sm font-semibold text-gray-900 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100 group-hover:bg-[#87D8FF]/10 transition-colors">
                                                ₹{payout.toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold tracking-tight text-gray-900 px-2">Completed Campaigns</h3>
                        <div className="bg-white border border-gray-100 rounded-[1.5rem] p-2">
                            {COMPLETED_GIGS.map((gig, idx) => (
                                <div
                                    key={gig.id}
                                    className={`p-4 flex items-center justify-between ${
                                        idx !== COMPLETED_GIGS.length - 1 ? 'border-b border-gray-50' : ''
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100">
                                            <CheckCircle2 size={16} className="text-emerald-500" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-xs text-gray-900">{gig.title}</h4>
                                            <p className="text-[10px] font-medium text-gray-500 flex items-center gap-2 mt-0.5">
                                                <span>
                                                    <Eye size={10} className="inline mr-0.5" /> {gig.views}
                                                </span>{' '}
                                                • <span>{gig.date}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs font-semibold text-gray-900 block">{gig.earned}</span>
                                        <span className="text-[10px] font-medium text-emerald-600">{gig.status}</span>
                                    </div>
                                </div>
                            ))}
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
                            <div className={`w-24 h-24 rounded-2xl ${selectedGig.color} shadow-lg flex items-center justify-center z-10 transform -rotate-6`}>
                                <Music size={40} className="text-white" />
                            </div>
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
                                        {selectedGig.brand} Campaign
                                    </span>
                                    <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">{selectedGig.title}</h2>
                                    <p className="text-sm font-medium text-gray-500 mt-1">by {selectedGig.artist}</p>
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
                                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex items-center gap-3">
                                    <div className="w-10 h-10 bg-[#1DB954]/10 rounded-full flex items-center justify-center">
                                        <Link2 size={16} className="text-[#1DB954]" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-semibold text-gray-900">Audio Source</p>
                                        <p className="text-[10px] font-medium text-gray-500 truncate">
                                            open.spotify.com/track/{selectedGig.id}...
                                        </p>
                                    </div>
                                    <button className="text-xs font-medium bg-white border border-gray-200 px-3 py-1.5 rounded-lg shadow-sm hover:bg-gray-50 transition-colors">
                                        Preview
                                    </button>
                                </div>

                                <div>
                                    <h4 className="text-xs font-semibold text-gray-900 mb-2">Brief & Requirements</h4>
                                    <p className="text-sm text-gray-600 font-medium leading-relaxed bg-white border border-gray-100 p-4 rounded-xl shadow-sm">
                                        Create an engaging reel using the chorus of this track (0:45 - 1:00). We want high
                                        energy, natural transitions, and the hashtag{' '}
                                        <strong className="text-[#87D8FF]">#SummerVibes2026</strong>.
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => setSelectedGig(null)}
                                className="w-full py-4 bg-[#FF5A5F] hover:bg-[#ff464b] text-white text-sm font-semibold rounded-xl shadow-lg shadow-[#FF5A5F]/20 transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2"
                            >
                                Apply & Claim Audio <PlayCircle size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
