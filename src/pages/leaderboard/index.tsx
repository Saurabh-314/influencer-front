import { useQuery } from '@tanstack/react-query';
import api from '@/api/axios';
import { Card, Typography, Avatar, Badge, List, Space } from 'antd';
import {
    TrophyOutlined,
    GlobalOutlined,
    LoadingOutlined,
    StarFilled
} from '@ant-design/icons';

const { Title, Text } = Typography;

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
            <div className="flex items-center justify-center min-h-[60vh]">
                <LoadingOutlined className="text-4xl text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-10">
            <div className="flex items-center justify-between">
                <div>
                    <Title level={2} className="!m-0 !font-black !tracking-tight">Global Leaderboard</Title>
                    <Text type="secondary" className="font-medium">Top performing creators in the platform</Text>
                </div>
                <Badge
                    count={<Space className="bg-primary/10 text-primary font-black px-4 py-1.5 rounded-full border border-primary/20"><GlobalOutlined /> LIVE</Space>}
                />
            </div>

            <Card
                className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white"
                bodyStyle={{ padding: 0 }}
            >
                <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                    <Title level={4} className="!m-0 !font-black !tracking-tight uppercase tracking-widest text-[10px] text-gray-400">
                        Top Ranking Creators
                    </Title>
                    <div className="flex gap-4 text-[10px] font-black uppercase tracking-widest text-gray-300">
                        <span>Rank</span>
                        <span className="w-40 text-right">Points</span>
                    </div>
                </div>

                <List
                    dataSource={scorers}
                    renderItem={(creator: any, index: number) => {
                        const rank = index + 1;
                        let rankColor = "text-gray-400";
                        if (rank === 1) rankColor = "text-yellow-400 scale-125";
                        if (rank === 2) rankColor = "text-gray-300 scale-110";
                        if (rank === 3) rankColor = "text-amber-600 scale-105";

                        return (
                            <List.Item className="!px-8 !py-6 hover:bg-gray-50/80 transition-all cursor-pointer group border-b border-gray-50 last:border-0">
                                <div className="flex items-center justify-between w-full">
                                    <div className="flex items-center gap-8">
                                        <div className={`font-black text-2xl w-10 flex justify-center transition-transform ${rankColor}`}>
                                            {rank <= 3 ? <TrophyOutlined /> : rank}
                                        </div>

                                        <div className="relative">
                                            <Avatar
                                                size={56}
                                                src={creator.profile_image}
                                                className="border-2 border-white shadow-md group-hover:scale-105 transition-transform"
                                            >
                                                {creator.name.charAt(0)}
                                            </Avatar>
                                            {rank === 1 && (
                                                <StarFilled className="absolute -top-1 -right-1 text-yellow-400 text-lg border-2 border-white rounded-full bg-white" />
                                            )}
                                        </div>

                                        <div className="space-y-1">
                                            <Text className="font-black text-lg tracking-tight group-hover:text-primary transition-colors block">
                                                {creator.name}
                                            </Text>
                                            <Badge
                                                status="processing"
                                                text={<span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{creator.rank?.level || 'Bronze'}</span>}
                                            />
                                        </div>
                                    </div>

                                    <div className="text-right space-y-1 w-40">
                                        <Text className="font-black text-2xl tracking-tighter text-primary block leading-none">
                                            {parseInt(creator.total_points).toLocaleString()}
                                        </Text>
                                        <Text type="secondary" className="text-[9px] font-black uppercase tracking-[0.2em]">
                                            Score: {creator.rank?.rank_score || 0}
                                        </Text>
                                    </div>
                                </div>
                            </List.Item>
                        );
                    }}
                />
            </Card>
        </div>
    );
}
