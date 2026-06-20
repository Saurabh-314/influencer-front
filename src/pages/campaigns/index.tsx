import { useQuery } from '@tanstack/react-query';
import api from '@/api/axios';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Target, Calendar, Award } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function Campaigns() {
    const { data: campaigns, isLoading } = useQuery({
        queryKey: ['campaigns'],
        queryFn: async () => {
            const res = await api.get('/campaigns');
            return res.data.data;
        }
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Campaigns</h1>
                    <p className="text-muted-foreground text-sm">Discover and join available marketing tasks</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {campaigns?.map((campaign: any) => (
                    <Card key={campaign.id} className="flex flex-col">
                        <CardHeader>
                            <div className="flex items-center justify-between mb-2">
                                <Badge variant="secondary" className="capitalize">
                                    {campaign.campaign_type.replace('_', ' ')}
                                </Badge>
                                <div className="flex items-center text-primary font-bold">
                                    <Award className="h-4 w-4 mr-1" />
                                    {campaign.reward_points} pts
                                </div>
                            </div>
                            <CardTitle className="line-clamp-1">{campaign.title}</CardTitle>
                            <CardDescription className="line-clamp-2">
                                {campaign.description}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <div className="space-y-2 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    Ends on {new Date(campaign.end_date).toLocaleDateString()}
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full">
                                View Details & Join
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
                {campaigns?.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center py-12 text-muted-foreground">
                        <Target className="h-12 w-12 mb-4 opacity-20" />
                        <p>No active campaigns found. Check back later!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
