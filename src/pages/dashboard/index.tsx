import { useQuery } from '@tanstack/react-query';
import api from '@/api/axios';
import { Card, Typography, Row, Col, Statistic, List, Badge, Space } from 'antd';
import {
    UserOutlined,
    TrophyOutlined,
    BarChartOutlined,
    RocketOutlined,
    ArrowUpOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

export default function Dashboard() {
    const { data: campaigns } = useQuery({
        queryKey: ['campaigns'],
        queryFn: async () => {
            const res = await api.get('/campaigns');
            return res.data.data;
        }
    });

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <Title level={2} className="!m-0 !font-black !tracking-tight">Dashboard</Title>
                    <Text type="secondary" className="font-medium">Welcome back! Here's what's happening today.</Text>
                </div>
            </div>

            <Row gutter={[24, 24]}>
                <Col xs={24} sm={12} lg={6}>
                    <Card className="border-none shadow-sm hover:shadow-md transition-shadow rounded-2xl">
                        <Statistic
                            title={<Space className="text-gray-400 font-bold uppercase tracking-widest text-[10px]"><TrophyOutlined className="text-primary" /> Total Points</Space>}
                            value={12500}
                            valueStyle={{ fontWeight: 900, letterSpacing: '-0.025em' }}
                            suffix={<span className="text-xs text-emerald-500 font-bold ml-2 flex items-center gap-1"><ArrowUpOutlined /> 20%</span>}
                        />
                    </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <Card className="border-none shadow-sm hover:shadow-md transition-shadow rounded-2xl">
                        <Statistic
                            title={<Space className="text-gray-400 font-bold uppercase tracking-widest text-[10px]"><RocketOutlined className="text-primary" /> Active Campaigns</Space>}
                            value={campaigns?.length || 0}
                            valueStyle={{ fontWeight: 900, letterSpacing: '-0.025em' }}
                            suffix={<span className="text-[10px] text-gray-400 font-bold ml-2 uppercase tracking-tighter">3 ending soon</span>}
                        />
                    </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <Card className="border-none shadow-sm hover:shadow-md transition-shadow rounded-2xl">
                        <Statistic
                            title={<Space className="text-gray-400 font-bold uppercase tracking-widest text-[10px]"><BarChartOutlined className="text-primary" /> Engagement Rate</Space>}
                            value={4.2}
                            precision={1}
                            suffix="%"
                            valueStyle={{ fontWeight: 900, letterSpacing: '-0.025em' }}
                        />
                        <Text type="success" className="text-[10px] font-bold uppercase tracking-widest">+0.5% this month</Text>
                    </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <Card className="border-none shadow-sm hover:shadow-md transition-shadow rounded-2xl">
                        <Statistic
                            title={<Space className="text-gray-400 font-bold uppercase tracking-widest text-[10px]"><UserOutlined className="text-primary" /> Global Rank</Space>}
                            value={42}
                            prefix="#"
                            valueStyle={{ fontWeight: 900, letterSpacing: '-0.025em' }}
                        />
                        <Text type="secondary" className="text-[10px] font-bold uppercase tracking-widest">Top 1% of creators</Text>
                    </Card>
                </Col>
            </Row>

            <Row gutter={[24, 24]}>
                <Col xs={24} lg={16}>
                    <Card
                        title={<Title level={4} className="!m-0 !font-black !tracking-tight">Available Campaigns</Title>}
                        className="border-none shadow-xl rounded-3xl overflow-hidden"
                    >
                        <List
                            dataSource={campaigns}
                            renderItem={(c: any) => (
                                <List.Item className="!p-6 hover:bg-gray-50/50 cursor-pointer transition-all border-b border-gray-50 last:border-0">
                                    <List.Item.Meta
                                        title={<Text className="font-black text-lg tracking-tight hover:text-primary transition-colors">{c.title}</Text>}
                                        description={<Text type="secondary" className="font-medium line-clamp-1">{c.description}</Text>}
                                    />
                                    <div className="text-right flex flex-col items-end gap-1">
                                        <Badge
                                            count={`${c.reward_points} PTS`}
                                            style={{ backgroundColor: '#2563eb', fontWeight: 900, fontSize: '10px' }}
                                        />
                                        <Text className="text-[9px] font-black uppercase tracking-widest text-gray-300">{c.campaign_type}</Text>
                                    </div>
                                </List.Item>
                            )}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
}
