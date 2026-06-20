import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import api from '@/api/axios';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Loader2, ArrowLeft, RefreshCw, Heart, MessageCircle, Info, Lock
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
    ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts';

export default function SocialAccountDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const { data: syncData, isLoading, refetch, isFetching } = useQuery({
        queryKey: ['social-account-detail', id],
        queryFn: async () => {
            const res = await api.post(`/social-accounts/${id}/sync`);
            return res.data.data;
        }
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!syncData) return <div>Account not found</div>;

    const { profile, media, influencer_score, engagement_rate, adv_stats } = syncData;

    // Heatmap mock data based on actual media count if low
    const freqData = [
        { name: 'Mon', posts: 1 }, { name: 'Tue', posts: 2 }, { name: 'Wed', posts: 3 },
        { name: 'Thu', posts: 5 }, { name: 'Fri', posts: 4 }, { name: 'Sat', posts: 2 }, { name: 'Sun', posts: 1 }
    ];

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-12">
            {/* Action Bar */}
            <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={() => navigate('/accounts')} className="gap-2">
                    <ArrowLeft className="h-4 w-4" /> Back to Accounts
                </Button>
                <Button onClick={() => refetch()} disabled={isFetching} variant="outline" size="sm">
                    <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
                    Refresh Analytics
                </Button>
            </div>

            {/* Premium Header Card */}
            <Card className="overflow-hidden border-none shadow-xl bg-white">
                <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row min-h-[280px]">
                        {/* Profile Section */}
                        <div className="flex-1 p-8 border-r border-gray-100 relative">
                            <div className="flex items-start gap-6">
                                <div className="relative">
                                    <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600">
                                        <img
                                            src={profile.profile_picture_url || 'https://via.placeholder.com/150'}
                                            className="w-full h-full rounded-full object-cover border-2 border-white"
                                            alt=""
                                        />
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-sm">
                                        <div className="bg-gradient-to-tr from-purple-500 to-pink-500 rounded-full p-0.5">
                                            <div className="p-1"><InstagramIcon className="w-3 h-3 text-white" /></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3">
                                        <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
                                        <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-100 gap-1 px-3 py-1 font-semibold">
                                            {influencer_score % 10} excellent <Info className="w-3 h-3 opacity-50" />
                                        </Badge>
                                    </div>
                                    <p className="text-gray-500 font-medium">@{profile.username}</p>
                                    <div className="text-sm text-gray-600 mt-4 leading-relaxed max-w-md whitespace-pre-line">
                                        {profile.biography}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Engagement Section */}
                        <div className="w-full md:w-[380px] bg-gray-50/30 p-8 flex flex-col justify-between">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                                    Engagement Rate <Info className="w-4 h-4 text-gray-400" />
                                </h3>
                                <span className="text-3xl font-black text-gray-900">{engagement_rate}%</span>
                            </div>

                            {/* <div className="flex justify-center mb-8">
                                <Button className="bg-gray-900 hover:bg-black text-white gap-2 px-8 py-6 rounded-xl font-bold">
                                    <Lock className="w-4 h-4" /> Unlock detailed report
                                </Button>
                            </div> */}

                            <div className="grid grid-cols-2 border-t border-gray-100">
                                <div className="p-4 border-r border-b border-gray-100">
                                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Followers</p>
                                    <p className="text-xl font-bold text-gray-900">{Math.ceil(profile.followers_count / 1000).toFixed(1)}K</p>
                                </div>
                                <div className="p-4 border-b border-gray-100">
                                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Uploads</p>
                                    <p className="text-xl font-bold text-gray-900">{(profile.media_count / 1000).toFixed(2)}K</p>
                                </div>
                                <div className="p-4 border-r border-gray-100">
                                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Avg. likes</p>
                                    <p className="text-xl font-bold text-gray-900">{(adv_stats.avgLikes / 1000).toFixed(2)}K</p>
                                </div>
                                <div className="p-4">
                                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Avg. comments</p>
                                    <p className="text-xl font-bold text-gray-900">{adv_stats.avgComments}</p>
                                </div>
                            </div>

                            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                                <span className="text-xs text-gray-500 font-bold uppercase tracking-wider flex items-center gap-1">
                                    Avg. activity <Info className="w-3 h-3" />
                                </span>
                                <div className="flex flex-col items-end gap-1">
                                    <span className="text-lg font-bold text-gray-900">743%</span>
                                    <div className="w-32 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-green-500 w-[74%]" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Publishing Frequency Section */}
            <div className="grid gap-8 lg:grid-cols-12">
                <Card className="lg:col-span-12 border-none shadow-lg">
                    <CardContent className="p-8">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-xl font-bold text-gray-900">Publishing frequency</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                            <div className="space-y-2 group">
                                <div className="flex items-center gap-4 border-b-2 border-primary pb-4">
                                    <span className="text-4xl font-bold text-gray-900">{adv_stats.postsPerDay}</span>
                                    <span className="text-red-500 text-xs font-bold flex items-center">
                                        ↓ -0.49
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500 font-medium">Posts per day</p>
                            </div>
                            <div className="space-y-2 group">
                                <div className="flex items-center gap-4 border-b-2 border-primary pb-4">
                                    <span className="text-4xl font-bold text-gray-900">{adv_stats.postsPerWeek}</span>
                                    <span className="text-red-500 text-xs font-bold flex items-center">
                                        ↓ -3.44
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500 font-medium">Posts per week</p>
                            </div>
                            {/* <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl relative group overflow-hidden">
                                <div className="absolute inset-0 bg-black/5 flex items-center justify-center backdrop-blur-[2px]">
                                    <Button size="sm" variant="secondary" className="gap-2 bg-gray-900 text-white hover:bg-black">
                                        <Lock className="w-3 h-3" /> Unlock
                                    </Button>
                                </div>
                                <span className="text-4xl font-bold blur-sm">7.64</span>
                                <p className="text-sm text-gray-500 font-medium mt-2">Stories / Day</p>
                            </div> */}
                        </div>
                    </CardContent>
                </Card>

                {/* Popular Post Time */}
                <Card className="lg:col-span-8 border-none shadow-lg overflow-hidden">
                    <CardContent className="p-8">
                        <div className="flex items-center gap-8 mb-8">
                            <h2 className="text-xl font-bold text-gray-900">By week</h2>
                            <div className="flex p-1 bg-gray-100 rounded-lg">
                                <Button size="sm" className="bg-white text-primary shadow-sm hover:bg-white text-xs px-4">Posts</Button>
                                <Button size="sm" variant="ghost" className="text-gray-500 hover:bg-transparent text-xs px-4">Engagement Rate</Button>
                            </div>
                        </div>
                        <p className="text-xs text-gray-400 font-medium mb-6 uppercase tracking-widest">From the last 12 posts</p>

                        <div className="h-[240px] w-full relative">
                            {/* Schedule Graph Background */}
                            <div className="grid grid-cols-7 h-full text-[10px] text-gray-400 font-bold uppercase">
                                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                                    <div key={day} className="flex flex-col items-center justify-between border-r border-gray-50 last:border-0 pb-1 pt-12">
                                        <div className="flex-1 w-full flex items-center justify-center relative">
                                            {/* Dot dots dots */}
                                            {day === 'Thu' && <div className="w-6 h-6 rounded-full bg-primary/80 absolute top-1/4" />}
                                            {(day === 'Wed' || day === 'Fri') && <div className="w-4 h-4 rounded-full bg-primary/40 absolute top-2/3" />}
                                            {day === 'Sat' && <div className="w-3 h-3 rounded-full bg-primary/20 absolute top-1/2" />}
                                        </div>
                                        <span>{day}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="absolute inset-0 flex flex-col justify-between pr-4 py-8 pointer-events-none opacity-20">
                                {[...Array(9)].map((_, i) => (
                                    <div key={i} className="h-px w-full bg-gray-300" />
                                ))}
                            </div>
                        </div>
                        <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-6">
                            Time is shown in <span className="text-gray-900">UTC</span> time zone
                        </p>
                    </CardContent>
                </Card>

                {/* Most Popular Time Stats */}
                <Card className="lg:col-span-4 border-none shadow-lg bg-gray-50/30">
                    <CardContent className="p-8">
                        <h2 className="text-lg font-bold text-gray-900 text-center mb-2">Most popular post time</h2>
                        <p className="text-2xl font-black text-gray-900 text-center mb-8">Thursday | 12:00</p>

                        <div className="h-[180px]">
                            {/* <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={freqData}>
                                    <Bar dataKey="posts" fill="hsl(var(--primary))" opacity={0.3} radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="posts" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} data={[{ name: 'Thu', posts: 5 }]} />
                                </BarChart>
                            </ResponsiveContainer> */}
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={freqData}>
                                    {/* Optional: Add XAxis and YAxis if you need them visible */}
                                    {/* <XAxis dataKey="name" /> */}

                                    <Bar dataKey="posts" radius={[4, 4, 0, 0]}>
                                        {freqData.map((entry, index) => {
                                            // Check if this specific item is the one you want to highlight (e.g., 'Thu')
                                            const isHighlighted = entry.name === 'Thu';

                                            return (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill="hsl(var(--primary))"
                                                    style={{
                                                        // Apply 100% opacity to 'Thu', and 30% opacity to everything else
                                                        opacity: isHighlighted ? 1 : 0.3
                                                    }}
                                                />
                                            );
                                        })}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex justify-between text-[10px] font-bold text-gray-400 mt-2 px-1">
                            <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                        </div>
                        <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-6">From the last 12 posts</p>
                    </CardContent>
                </Card>
            </div>

            {/* Top Posts Section */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <h2 className="text-xl font-bold text-gray-900">Top posts</h2>
                        <div className="flex p-1 bg-gray-100 rounded-lg">
                            <Button size="sm" className="bg-white text-primary shadow-sm hover:bg-white text-xs px-4">Most liked</Button>
                            <Button size="sm" variant="ghost" className="text-gray-500 hover:bg-transparent text-xs px-4">Most commented</Button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {media?.slice(0, 8).map((item: any) => (
                        <div key={item.id} className="aspect-square relative group overflow-hidden rounded-xl shadow-md">
                            <img src={item.media_url} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                                <div className="flex justify-between text-white font-bold text-sm">
                                    <span className="flex items-center gap-1.5"><Heart className="w-4 h-4" /> {item.like_count >= 1000 ? (item.like_count / 1000).toFixed(1) + 'k' : item.like_count}</span>
                                    <span className="flex items-center gap-1.5"><MessageCircle className="w-4 h-4" /> {item.comments_count}</span>
                                </div>
                                <p className="text-[10px] text-gray-300 mt-1 font-bold">{new Date(item.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-md rounded-full p-3 pointer-events-none">
                                    <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[12px] border-l-white border-b-[8px] border-b-transparent ml-1" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function InstagramIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
        </svg>
    )
}
