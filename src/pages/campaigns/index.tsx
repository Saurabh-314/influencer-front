import { useQuery } from "@tanstack/react-query";
import api from "@/api/axios";
import { Card, Button, Badge, Row, Col, Typography, Empty } from "antd";
import {
  // TrophyOutlined,
  // CalendarOutlined,
  ArrowRightOutlined,
  LoadingOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Title, Text, Paragraph } = Typography;

interface Campaign {
  id: string;
  title: string;
  description: string;
  campaign_type: string;
  reward_points: number;
  end_date: string;
  created_at?: string;
  participants_count?: number;
}

export default function Campaigns() {
  const navigate = useNavigate();
  const { data: campaigns, isLoading } = useQuery({
    queryKey: ["campaigns"],
    queryFn: async () => {
      const res = await api.get("/campaigns");
      return res.data.data;
    },
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
          <Title level={2} className="!m-0 !font-black !tracking-tight">
            Active Campaigns
          </Title>
          <Text type="secondary" className="font-medium">
            Discover and join available marketing tasks
          </Text>
        </div>

        <Button
          type="primary"
          size="large"
          onClick={() => navigate("/brand/campaigns/create")}
          className="h-12 px-6 rounded-xl font-bold bg-[#87D8FF] hover:bg-[#7bc8ef] text-white hover:scale-[1.02] transition-all duration-300"
        >
          Create Campaign
          <PlusOutlined />
        </Button>
      </div>

      <Row gutter={[32, 32]}>
        {campaigns?.map((campaign: Campaign) => (
          <Col key={campaign.id} xs={24} md={12} lg={8}>
            <Card
              className="h-full border-none shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all rounded-3xl overflow-hidden group"
              bodyStyle={{
                padding: "28px",
                display: "flex",
                flexDirection: "column",
                height: "100%",
              }}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-5">
                <Badge
                  count={campaign.campaign_type.replace("_", " ").toUpperCase()}
                  style={{
                    backgroundColor: "#eff6ff",
                    color: "#2563eb",
                    fontWeight: 700,
                    border: "none",
                  }}
                />

                <div className="text-right">
                  <div className="text-primary font-black text-xl">
                    {campaign.reward_points}
                  </div>
                  <div className="text-xs text-gray-400 uppercase">
                    Reward Points
                  </div>
                </div>
              </div>

              {/* Title */}
              <Title
                level={4}
                className="!m-0 !mb-3 !font-black line-clamp-2 group-hover:text-primary transition-colors"
              >
                {campaign.title}
              </Title>

              {/* Description */}
              <Paragraph
                type="secondary"
                className="line-clamp-3 text-sm min-h-[70px]"
              >
                {campaign.description}
              </Paragraph>

              {/* Campaign Details */}
              <div className="bg-gray-50 rounded-2xl p-4 mt-3 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Campaign ID</span>
                  <span className="font-semibold">
                    #{campaign.id.slice(0, 8)}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Type</span>
                  <span className="font-semibold capitalize">
                    {campaign.campaign_type.replace("_", " ")}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Ends On</span>
                  <span className="font-semibold">
                    {new Date(campaign.end_date).toLocaleDateString()}
                  </span>
                </div>

                {campaign.participants_count !== undefined && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Participants</span>
                    <span className="font-semibold">
                      {campaign.participants_count}
                    </span>
                  </div>
                )}
              </div>

              {/* Footer */}
              <Button
                type="primary"
                block
                size="large"
                onClick={() => navigate(`/brand/campaigns/${campaign.id}`)}
                className="mt-6 h-12 rounded-xl font-bold"
              >
                View Details
                <ArrowRightOutlined />
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
                <p className="font-black text-xl tracking-tight">
                  No Active Campaigns
                </p>
                <p className="text-gray-400 font-medium">
                  Check back later for new opportunities!
                </p>
              </div>
            }
          />
        </div>
      )}
    </div>
  );
}
