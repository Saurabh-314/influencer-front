import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '@/api/axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Instagram, Youtube, Facebook, Twitter, Linkedin, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const platformIcons: any = {
    instagram: Instagram,
    youtube: Youtube,
    facebook: Facebook,
    twitter: Twitter,
    linkedin: Linkedin,
    tiktok: () => <span className="font-bold">TT</span>
};

export default function Accounts() {
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const { data: accounts, isLoading, error: queryError } = useQuery({
        queryKey: ['social-accounts'],
        queryFn: async () => {
            const res = await api.get('/social-accounts');
            return res.data.data;
        }
    });

    const { mutate, isPending, error: mutationError } = useMutation({
        mutationFn: async (platform: string) => {
            if (platform === 'instagram') {
                const res = await api.get('/social-accounts/connect/instagram');
                if (res.data.url) {
                    window.location.href = res.data.url;
                }
                return null;
            }
            return api.post('/social-accounts/connect', {
                platform,
                username: `@user_${platform}`
            });
        },
        onSuccess: (data) => {
            if (data) {
                queryClient.invalidateQueries({ queryKey: ['social-accounts'] });
            }
        }
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const searchParams = new URLSearchParams(window.location.search);
    const success = searchParams.get('success');
    const urlError = searchParams.get('error');

    const error = (queryError as any)?.response?.data?.message || (mutationError as any)?.message || urlError;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Social Accounts</h1>
                    <p className="text-muted-foreground text-sm">Manage your connected social media profiles</p>
                </div>
            </div>

            {success && (
                <div className="p-4 mb-4 text-sm text-green-500 bg-green-50 border border-green-200 rounded-lg">
                    Account connected successfully!
                </div>
            )}

            {error && (
                <div className="p-4 mb-4 text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg">
                    {error}
                </div>
            )}

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {['instagram', 'youtube', 'facebook', 'twitter', 'tiktok', 'linkedin'].map((platform) => {
                    const connected = accounts?.find((a: any) => a.platform === platform);
                    const Icon = platformIcons[platform];

                    return (
                        <Card key={platform} className={connected ? 'border-primary/50' : ''}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-muted rounded-lg">
                                        {Icon && <Icon className="h-5 w-5" />}
                                    </div>
                                    <CardTitle className="capitalize">{platform}</CardTitle>
                                </div>
                                {connected && <Badge variant="secondary">Connected</Badge>}
                            </CardHeader>
                            <CardContent>
                                {connected ? (
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium">{connected.username}</p>
                                        <p className="text-xs text-muted-foreground">Connected on {new Date(connected.createdAt).toLocaleDateString()}</p>
                                        <div className="pt-4 space-y-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full"
                                                onClick={() => navigate(`/accounts/${connected.id}`)}
                                            >
                                                View Insights
                                            </Button>
                                            <Button variant="ghost" size="sm" className="w-full">
                                                Manage Content
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <p className="text-sm text-muted-foreground">Connect your account to start participating in campaigns.</p>
                                        <Button
                                            variant="default"
                                            size="sm"
                                            className="w-full"
                                            onClick={() => mutate(platform)}
                                            disabled={isPending}
                                        >
                                            <Plus className="h-4 w-4 mr-2" />
                                            Connect {platform}
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
