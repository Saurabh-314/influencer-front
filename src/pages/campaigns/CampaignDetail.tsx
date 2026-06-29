import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api/axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Award, CheckCircle, ArrowLeft, ExternalLink, XCircle, Clock } from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getStoredUser } from '@/utils/auth';
import { message } from 'antd';

interface Submission {
    id: number;
    submission_url: string;
    status: string;
    payout_amount?: number;
    user?: { name: string; email: string };
    social_account?: { username: string; followers_count: number; platform: string };
    payout_schedule?: { release_at: string; status: string; amount: number };
}

export default function CampaignDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const queryClient = useQueryClient();
    const user = getStoredUser();
    const isBrandView = user?.role === 'brand' || location.pathname.startsWith('/brand/');
    const backPath = isBrandView ? '/brand/campaigns' : '/campaigns';

    const [submissionUrl, setSubmissionUrl] = useState('');
    const [success, setSuccess] = useState(false);

    const { data: campaign, isLoading } = useQuery({
        queryKey: ['campaign', id],
        queryFn: async () => {
            const res = await api.get(`/campaigns/${id}`);
            return res.data.data;
        },
    });

    const { data: submissions, isLoading: submissionsLoading } = useQuery({
        queryKey: ['campaign-submissions', id],
        queryFn: async () => {
            const res = await api.get(`/submissions/campaign/${id}`);
            return res.data.data as Submission[];
        },
        enabled: isBrandView && !!id,
    });

    const submitMutation = useMutation({
        mutationFn: async () => {
            const accountsRes = await api.get('/social-accounts');
            const accountId = accountsRes.data.data[0]?.id;

            if (!accountId) throw new Error('Please connect a social account first');

            return api.post('/submissions', {
                campaign_id: id,
                social_account_id: accountId,
                submission_url: submissionUrl,
            });
        },
        onSuccess: () => setSuccess(true),
    });

    const approveMutation = useMutation({
        mutationFn: (submissionId: number) => api.patch(`/submissions/${submissionId}/approve`),
        onSuccess: (res) => {
            message.success(res.data.message);
            queryClient.invalidateQueries({ queryKey: ['campaign-submissions', id] });
        },
        onError: (error: { response?: { data?: { message?: string } } }) => {
            message.error(error.response?.data?.message || 'Approval failed');
        },
    });

    const rejectMutation = useMutation({
        mutationFn: (submissionId: number) => api.patch(`/submissions/${submissionId}/reject`),
        onSuccess: () => {
            message.success('Submission rejected');
            queryClient.invalidateQueries({ queryKey: ['campaign-submissions', id] });
        },
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <Button variant="ghost" onClick={() => navigate(backPath)} className="mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Campaigns
            </Button>

            <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between mb-2">
                                <Badge variant="secondary" className="capitalize">{campaign.campaign_type}</Badge>
                                <div className="flex items-center text-primary font-bold">
                                    <Award className="h-5 w-5 mr-1" />
                                    ₹{Number(campaign.total_budget).toLocaleString()} budget
                                </div>
                            </div>
                            <CardTitle className="text-3xl">{campaign.title}</CardTitle>
                            <CardDescription className="text-lg">
                                Ends on {new Date(campaign.end_date).toLocaleDateString()}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="prose dark:prose-invert">
                            <p>{campaign.description}</p>

                            <h3 className="text-lg font-semibold mt-6">Campaign Assets</h3>
                            <div className="grid grid-cols-2 gap-4 mt-2">
                                {campaign.assets?.map((asset: { id: number; asset_type: string }) => (
                                    <div key={asset.id} className="border rounded-lg p-4 flex items-center justify-between">
                                        <span className="text-sm">{asset.asset_type.toUpperCase()}</span>
                                        <Button variant="outline" size="sm">Download</Button>
                                    </div>
                                ))}
                            </div>

                            <h3 className="text-lg font-semibold mt-6">Recommended Caption</h3>
                            {campaign.captions?.map((cap: { id: number; caption: string; hashtags: string }) => (
                                <div key={cap.id} className="bg-muted p-4 rounded-lg mt-2 relative">
                                    <p className="text-sm italic">&quot;{cap.caption}&quot;</p>
                                    <p className="text-primary text-xs mt-2">{cap.hashtags}</p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    {isBrandView ? (
                        <Card>
                            <CardHeader>
                                <CardTitle>Creator Submissions</CardTitle>
                                <CardDescription>Verify submissions. Approved payouts release after 48 hours.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {submissionsLoading ? (
                                    <div className="flex justify-center py-6">
                                        <Loader2 className="animate-spin" />
                                    </div>
                                ) : !submissions?.length ? (
                                    <p className="text-sm text-muted-foreground text-center py-4">No submissions yet.</p>
                                ) : (
                                    <div className="space-y-4">
                                        {submissions.map((sub) => (
                                            <div key={sub.id} className="border rounded-lg p-4 space-y-3">
                                                <div>
                                                    <p className="font-semibold text-sm">{sub.user?.name}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        @{sub.social_account?.username} • {sub.social_account?.followers_count?.toLocaleString()} followers
                                                    </p>
                                                    <a href={sub.submission_url} target="_blank" rel="noopener noreferrer" className="text-xs text-[#87D8FF] hover:underline break-all">
                                                        {sub.submission_url}
                                                    </a>
                                                </div>
                                                {sub.status === 'pending' && (
                                                    <div className="flex gap-2">
                                                        <Button size="sm" className="flex-1" onClick={() => approveMutation.mutate(sub.id)} disabled={approveMutation.isPending}>
                                                            <CheckCircle className="h-3 w-3 mr-1" /> Approve
                                                        </Button>
                                                        <Button size="sm" variant="outline" className="flex-1" onClick={() => rejectMutation.mutate(sub.id)} disabled={rejectMutation.isPending}>
                                                            <XCircle className="h-3 w-3 mr-1" /> Reject
                                                        </Button>
                                                    </div>
                                                )}
                                                {sub.status === 'approved' && (
                                                    <div className="flex items-center gap-2 text-xs text-emerald-600">
                                                        <Clock size={12} />
                                                        ₹{Number(sub.payout_amount).toLocaleString()} — releases{' '}
                                                        {sub.payout_schedule?.release_at
                                                            ? new Date(sub.payout_schedule.release_at).toLocaleString()
                                                            : 'in 48hrs'}
                                                    </div>
                                                )}
                                                {sub.status === 'rejected' && (
                                                    <Badge variant="destructive">Rejected</Badge>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ) : (
                        <Card>
                            <CardHeader>
                                <CardTitle>Submit Work</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {success ? (
                                    <div className="text-center py-6 space-y-4">
                                        <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
                                        <p className="font-semibold">Submission Successful!</p>
                                        <p className="text-sm text-muted-foreground">Your work is pending brand verification.</p>
                                        <Button onClick={() => navigate('/creator/dashboard')} className="w-full">Go to Dashboard</Button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="url">Post URL</Label>
                                            <Input
                                                id="url"
                                                placeholder="https://..."
                                                value={submissionUrl}
                                                onChange={(e) => setSubmissionUrl(e.target.value)}
                                            />
                                        </div>
                                        <Button
                                            className="w-full"
                                            onClick={() => submitMutation.mutate()}
                                            disabled={submitMutation.isPending || !submissionUrl}
                                        >
                                            {submitMutation.isPending ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <ExternalLink className="mr-2 h-4 w-4" />}
                                            Submit for Review
                                        </Button>
                                        {submitMutation.error && (
                                            <p className="text-xs text-red-500">{(submitMutation.error as Error).message}</p>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
