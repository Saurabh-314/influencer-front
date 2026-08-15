import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    BarChart3,
    Calendar,
    CheckCircle2,
    ExternalLink,
    Instagram,
    Link2,
    Loader2,
    Mail,
    Music,
    Star,
    TrendingUp,
    Users,
    Wallet,
    Zap,
} from 'lucide-react';
import { useAdminCreatorDetail, type AdminCreatorDetailSubmission } from '@/hooks/useAdminCreators';
import { formatCurrency } from '@/hooks/useWallet';
import { formatCount, getVusicRank } from '@/utils/creator';
import { resolveAssetUrl } from '@/utils/image';

function formatDate(dateStr?: string) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

function formatDateTime(dateStr?: string) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function StatusBadge({ status }: { status: 'active' | 'inactive' }) {
    const isActive = status === 'active';
    return (
        <span
            className={`inline-flex text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                isActive
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                    : 'bg-gray-50 text-gray-500 border-gray-100'
            }`}
        >
            {status}
        </span>
    );
}

function SubmissionStatusBadge({ status }: { status: AdminCreatorDetailSubmission['status'] }) {
    const styles: Record<AdminCreatorDetailSubmission['status'], string> = {
        applied: 'bg-amber-50 text-amber-600 border-amber-100',
        pending: 'bg-[#87D8FF]/10 text-[#5eb8e0] border-[#87D8FF]/20',
        approved: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        rejected: 'bg-red-50 text-red-500 border-red-100',
    };
    const labels: Record<AdminCreatorDetailSubmission['status'], string> = {
        applied: 'In Progress',
        pending: 'Under Review',
        approved: 'Approved',
        rejected: 'Rejected',
    };
    return (
        <span className={`inline-flex text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${styles[status]}`}>
            {labels[status]}
        </span>
    );
}

function StatCard({
    label,
    value,
    icon: Icon,
    accent,
}: {
    label: string;
    value: string | number;
    icon: typeof Wallet;
    accent: string;
}) {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className={`flex items-center gap-2 mb-2 ${accent}`}>
                <Icon size={16} />
                <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
            </div>
            <p className="text-2xl font-semibold text-gray-900 tracking-tight">{value}</p>
        </div>
    );
}

export default function AdminCreatorDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data, isLoading, isError } = useAdminCreatorDetail(id);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-[#87D8FF]" />
            </div>
        );
    }

    if (isError || !data) {
        return (
            <div className="max-w-6xl mx-auto text-center py-20">
                <p className="text-sm font-medium text-gray-900">Creator not found</p>
                <button
                    type="button"
                    onClick={() => navigate('/admin/creators')}
                    className="mt-4 text-sm font-semibold text-[#87D8FF] hover:underline"
                >
                    Back to creators
                </button>
            </div>
        );
    }

    const { user, instagram, rank, wallet, stats, recent_submissions, recent_points, social_accounts } = data;
    const avatarUrl = resolveAssetUrl(instagram?.profile_image || user.profile_image);
    const followers = instagram?.followers_count ?? 0;
    const vusicRank = getVusicRank(followers);
    const rankLabel = rank?.level || vusicRank.label;

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <button
                    type="button"
                    onClick={() => navigate('/admin/creators')}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors"
                >
                    <ArrowLeft size={16} /> Back to creators
                </button>
                {instagram && (
                    <button
                        type="button"
                        onClick={() => navigate(`/admin/creators/${id}/insights`)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#87D8FF] hover:bg-[#7bc8ef] text-gray-900 text-sm font-semibold rounded-xl shadow-sm transition-all hover:scale-[1.02]"
                    >
                        <BarChart3 size={16} /> Insights
                    </button>
                )}
            </div>

            <div className="bg-white rounded-[1.5rem] border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)] p-6 md:p-8">
                <div className="flex flex-col sm:flex-row sm:items-start gap-5">
                    {avatarUrl ? (
                        <img src={avatarUrl} alt={user.name} className="w-20 h-20 rounded-2xl object-cover flex-shrink-0" />
                    ) : (
                        <div className="w-20 h-20 rounded-2xl bg-[#87D8FF]/20 flex items-center justify-center flex-shrink-0">
                            <Users size={32} className="text-[#87D8FF]" />
                        </div>
                    )}
                    <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">{user.name}</h1>
                            <StatusBadge status={user.status} />
                        </div>
                        <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5">
                            <Mail size={14} /> {user.email}
                        </p>
                        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1.5">
                            <Calendar size={12} /> Joined {formatDate(user.createdAt)}
                        </p>
                        {instagram ? (
                            <a
                                href={`https://instagram.com/${instagram.username}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 mt-3 text-sm font-semibold text-[#E1306C] hover:underline"
                            >
                                <Instagram size={14} /> @{instagram.username}
                                <ExternalLink size={12} />
                            </a>
                        ) : (
                            <p className="inline-flex items-center gap-1.5 mt-3 text-sm text-gray-400">
                                <Link2 size={14} /> Instagram not connected
                            </p>
                        )}
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 border border-amber-100">
                        <Star size={16} className="text-amber-400" />
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600">Vusic Rank</p>
                            <p className="text-sm font-semibold text-gray-900">{rankLabel}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    label="Followers"
                    value={followers > 0 ? formatCount(followers) : '—'}
                    icon={Users}
                    accent="text-[#87D8FF]"
                />
                <StatCard
                    label="Total points"
                    value={stats.total_points.toLocaleString()}
                    icon={Zap}
                    accent="text-amber-500"
                />
                <StatCard
                    label="Approved gigs"
                    value={stats.submissions.approved}
                    icon={CheckCircle2}
                    accent="text-emerald-500"
                />
                <StatCard
                    label="Total earned"
                    value={formatCurrency(wallet.total_earned)}
                    icon={Wallet}
                    accent="text-emerald-500"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Wallet</p>
                    <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Available</span>
                            <span className="font-semibold text-gray-900">{formatCurrency(wallet.balance)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Pending (48hr)</span>
                            <span className="font-semibold text-amber-600">{formatCurrency(wallet.pending_balance)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Locked</span>
                            <span className="font-semibold text-gray-700">{formatCurrency(wallet.locked_balance)}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Submissions</p>
                    <div className="grid grid-cols-2 gap-3">
                        {(['applied', 'pending', 'approved', 'rejected'] as const).map((key) => (
                            <div key={key} className="text-center p-2 rounded-xl bg-gray-50">
                                <p className="text-lg font-semibold text-gray-900">{stats.submissions[key]}</p>
                                <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 capitalize">{key}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {instagram ? (
                    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Instagram stats</p>
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Engagement rate</span>
                                <span className="font-semibold text-gray-900">
                                    {instagram.engagement_rate ? `${instagram.engagement_rate.toFixed(1)}%` : '—'}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Posts</span>
                                <span className="font-semibold text-gray-900">{instagram.total_posts ?? '—'}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Last synced</span>
                                <span className="font-semibold text-gray-900">{formatDate(instagram.last_synced_at)}</span>
                            </div>
                            {rank?.rank_score != null && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Rank score</span>
                                    <span className="font-semibold text-gray-900 flex items-center gap-1">
                                        <TrendingUp size={12} /> {rank.rank_score.toFixed(1)}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex items-center justify-center">
                        <p className="text-sm text-gray-400">No Instagram account linked</p>
                    </div>
                )}
            </div>

            {social_accounts.length > 1 && (
                <div className="bg-white rounded-[1.5rem] border border-gray-100 shadow-sm p-6">
                    <h2 className="text-sm font-semibold text-gray-900 mb-4">Connected accounts</h2>
                    <div className="flex flex-wrap gap-3">
                        {social_accounts.map((account) => (
                            <div key={account.id} className="px-4 py-3 rounded-xl border border-gray-100 bg-gray-50/50">
                                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{account.platform}</p>
                                <p className="text-sm font-semibold text-gray-900 mt-1">@{account.username}</p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    {account.is_connected ? 'Connected' : 'Disconnected'}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="bg-white rounded-[1.5rem] border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)] overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Music size={18} className="text-[#87D8FF]" />
                        Campaign submissions
                        <span className="text-xs font-bold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                            {stats.submissions.all}
                        </span>
                    </h2>
                </div>
                {recent_submissions.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-12">No campaign activity yet.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[800px]">
                            <thead>
                                <tr className="bg-gray-50/80 border-b border-gray-100">
                                    <th className="text-left text-[10px] font-bold uppercase tracking-widest text-gray-400 px-6 py-3">Campaign</th>
                                    <th className="text-left text-[10px] font-bold uppercase tracking-widest text-gray-400 px-4 py-3">Status</th>
                                    <th className="text-left text-[10px] font-bold uppercase tracking-widest text-gray-400 px-4 py-3">Submitted</th>
                                    <th className="text-left text-[10px] font-bold uppercase tracking-widest text-gray-400 px-4 py-3">Payout</th>
                                    <th className="text-right text-[10px] font-bold uppercase tracking-widest text-gray-400 px-6 py-3">Link</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {recent_submissions.map((sub) => (
                                    <tr key={sub.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {sub.campaign?.track_artwork_url ? (
                                                    <img
                                                        src={resolveAssetUrl(sub.campaign.track_artwork_url)}
                                                        alt={sub.campaign.title}
                                                        className="w-10 h-10 rounded-xl object-cover flex-shrink-0"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-xl bg-[#87D8FF]/20 flex items-center justify-center flex-shrink-0">
                                                        <Music size={14} className="text-[#87D8FF]" />
                                                    </div>
                                                )}
                                                <div className="min-w-0">
                                                    <p className="text-sm font-semibold text-gray-900 truncate">
                                                        {sub.campaign?.title ?? 'Campaign'}
                                                    </p>
                                                    <p className="text-xs text-gray-500 capitalize truncate">
                                                        {sub.campaign?.campaign_type} • {sub.campaign?.brand_name || 'Brand'}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <SubmissionStatusBadge status={sub.status} />
                                        </td>
                                        <td className="px-4 py-4 text-xs font-medium text-gray-600">
                                            {formatDate(sub.submitted_at || sub.applied_at)}
                                        </td>
                                        <td className="px-4 py-4 text-sm font-semibold text-gray-900">
                                            {sub.payout_amount ? formatCurrency(sub.payout_amount) : '—'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {sub.submission_url ? (
                                                <a
                                                    href={sub.submission_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#87D8FF] hover:underline"
                                                >
                                                    View <ExternalLink size={11} />
                                                </a>
                                            ) : (
                                                <span className="text-xs text-gray-400">—</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {recent_points.length > 0 && (
                <div className="bg-white rounded-[1.5rem] border border-gray-100 shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                        <Zap size={18} className="text-amber-400" />
                        Recent points
                    </h2>
                    <div className="space-y-2">
                        {recent_points.map((entry) => (
                            <div key={entry.id} className="flex items-center justify-between px-4 py-3 rounded-xl border border-gray-50 hover:bg-gray-50/50">
                                <div>
                                    <p className="text-sm font-medium text-gray-900">
                                        +{entry.points} pts
                                        {entry.campaign?.title ? ` · ${entry.campaign.title}` : ''}
                                    </p>
                                    <p className="text-xs text-gray-500">{entry.reason || entry.campaign?.brand_name || 'Points earned'}</p>
                                </div>
                                <p className="text-xs text-gray-400">{formatDateTime(entry.createdAt)}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
