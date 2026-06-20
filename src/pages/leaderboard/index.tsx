import { useQuery } from '@tanstack/react-query';
import api from '@/api/axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Medal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function Leaderboard() {
    const { data: scorers, isLoading } = useQuery({
        queryKey: ['leaderboard'],
        queryFn: async () => {
            const res = await api.get('/leaderboard');
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
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Leaderboard</h1>
                <p className="text-muted-foreground text-sm">Top performing creators in the platform</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Global Rankings</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {scorers?.map((creator: any, index: number) => (
                            <div key={creator.id} className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="flex items-center gap-4">
                                    <div className="font-bold text-lg w-6">
                                        {index + 1 === 1 && <Medal className="h-6 w-6 text-yellow-500" />}
                                        {index + 1 === 2 && <Medal className="h-6 w-6 text-slate-400" />}
                                        {index + 1 === 3 && <Medal className="h-6 w-6 text-amber-600" />}
                                        {index + 1 > 3 && index + 1}
                                    </div>
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={creator.profile_image} />
                                        <AvatarFallback>{creator.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-semibold">{creator.name}</p>
                                        <Badge variant="outline" className="text-xs">
                                            {creator.rank?.level || 'Bronze'}
                                        </Badge>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-primary">{parseInt(creator.total_points).toLocaleString()} pts</p>
                                    <p className="text-xs text-muted-foreground">Rank Score: {creator.rank?.rank_score || 0}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
