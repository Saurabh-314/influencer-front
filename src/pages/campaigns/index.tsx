import { useQuery } from '@tanstack/react-query';
import api from '@/api/axios';
import { Card, Button, Badge, Row, Col, Typography, Empty } from 'antd';
import {
    TrophyOutlined,
    CalendarOutlined,
    ArrowRightOutlined,
    LoadingOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

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
            <div className="flex items-center justify-center min-h-[60vh]">
                <LoadingOutlined className="text-4xl text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-10">
            <div className="flex items-center justify-between">
                <div>
                    <Title level={2} className="!m-0 !font-black !tracking-tight">Active Campaigns</Title>
                    <Text type="secondary" className="font-medium">Discover and join available marketing tasks</Text>
                </div>
            </div>

            <Row gutter={[32, 32]}>
                {campaigns?.map((campaign: any) => (
                    <Col key={campaign.id} xs={24} md={12} lg={8}>
                        <Card
                            className="h-full border-none shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all rounded-3xl overflow-hidden group"
                            bodyStyle={{ padding: '32px', display: 'flex', flexDirection: 'column', height: '100%' }}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <Badge
                                    className="scale-110"
                                    count={campaign.campaign_type.replace('_', ' ')}
                                    style={{ backgroundColor: '#eff6ff', color: '#3b82f6', border: 'none', fontWeight: 900, textTransform: 'uppercase', fontSize: '10px', padding: '0 12px' }}
                                />
                                <div className="flex items-center gap-1.5 text-primary">
                                    <TrophyOutlined className="text-sm" />
                                    <span className="font-black tracking-tighter text-lg">{campaign.reward_points} PTS</span>
                                </div>
                            </div>

                            <div className="flex-1 space-y-4">
                                <Title level={4} className="!m-0 !font-black !tracking-tight line-clamp-1 border-b border-gray-50 pb-4 group-hover:text-primary transition-colors">
                                    {campaign.title}
                                </Title>
                                <Paragraph type="secondary" className="font-medium line-clamp-2 text-sm leading-relaxed">
                                    {campaign.description}
                                </Paragraph>

                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-300">
                                    <CalendarOutlined />
                                    <span>ENDS {new Date(campaign.end_date).toLocaleDateString()}</span>
                                </div>
                            </div>

                            <Button
                                type="primary"
                                size="large"
                                block
                                className="mt-8 h-14 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-primary/30 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                            >
                                View Details <ArrowRightOutlined />
                            </Button>
                        </Card>
                    </Col>
                ))}
            </Row>

            {campaigns?.length === 0 && (
                <div className="py-20">
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description={
                            <div className="space-y-2">
                                <p className="font-black text-xl tracking-tight">No Active Campaigns</p>
                                <p className="text-gray-400 font-medium">Check back later for new opportunities!</p>
                            </div>
                        }
                    />
                </div>
            )}
        </div>
    );
}
