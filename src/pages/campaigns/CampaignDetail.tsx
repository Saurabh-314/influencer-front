import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '@/api/axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Award, CheckCircle, ArrowLeft, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function CampaignDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [submissionUrl, setSubmissionUrl] = useState('');
    const [success, setSuccess] = useState(false);

    const { data: campaign, isLoading } = useQuery({
        queryKey: ['campaign', id],
        queryFn: async () => {
            const res = await api.get(`/campaigns/${id}`);
            return res.data.data;
        }
    });

    const submitMutation = useMutation({
        mutationFn: async () => {
            // Mock social_account_id for now, in real app we'd pick one
            const accountsRes = await api.get('/social-accounts');
            const accountId = accountsRes.data.data[0]?.id;

            if (!accountId) throw new Error('Please connect a social account first');

            return api.post('/submissions', {
                campaign_id: id,
                social_account_id: accountId,
                submission_url: submissionUrl
            });
        },
        onSuccess: () => {
            setSuccess(true);
        }
    });

    if (isLoading) {
        return <div className="flex items-center justify-center h-full"><Loader2 className="animate-spin text-primary" /></div>;
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <Button variant="ghost" onClick={() => navigate('/campaigns')} className="mb-4">
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
                                    {campaign.reward_points} pts
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
                                {campaign.assets?.map((asset: any) => (
                                    <div key={asset.id} className="border rounded-lg p-4 flex items-center justify-between">
                                        <span className="text-sm">{asset.asset_type.toUpperCase()}</span>
                                        <Button variant="outline" size="sm">Download</Button>
                                    </div>
                                ))}
                            </div>

                            <h3 className="text-lg font-semibold mt-6">Recommended Caption</h3>
                            {campaign.captions?.map((cap: any) => (
                                <div key={cap.id} className="bg-muted p-4 rounded-lg mt-2 relative">
                                    <p className="text-sm italic">"{cap.caption}"</p>
                                    <p className="text-primary text-xs mt-2">{cap.hashtags}</p>
                                    <Button variant="ghost" size="sm" className="absolute top-2 right-2">Copy</Button>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Submit Work</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {success ? (
                                <div className="text-center py-6 space-y-4">
                                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
                                    <p className="font-semibold">Submission Successful!</p>
                                    <p className="text-sm text-muted-foreground">Your work is pending approval.</p>
                                    <Button onClick={() => navigate('/dashboard')} className="w-full">Go to Dashboard</Button>
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
                                        <p className="text-xs text-red-500">{(submitMutation.error as any).message}</p>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
