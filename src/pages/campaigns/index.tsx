import { useQuery } from "@tanstack/react-query";
import api from "@/api/axios";
import { Card, Button, Badge, Row, Col, Typography, Empty } from "antd";
import {
  // TrophyOutlined,
  // CalendarOutlined,
  //   ArrowRightOutlined,
  LoadingOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

interface RankAllocation {
  qty: number;
  rank: number;
  range: string;
  payout: number;
  color: string;
}

interface Campaign {
  id: number;
  title: string;
  description: string;
  campaign_type: string;
  reward_points: number;
  brand_name: string;
  brand_logo_url: string;
  track_artwork_url: string;
  total_budget: string;
  bonus_target_views: string;
  bonus_reward: string;
  audience_gender: string;
  audience_age: string;
  status: string;
  start_date: string;
  end_date: string;
  rank_allocations: RankAllocation[];
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

  const totalCreators =
    campaigns?.reduce(
      (sum: number, item: Campaign) =>
        sum +
          item.rank_allocations?.reduce(
            (sum: number, item: RankAllocation) => sum + item.qty,
            0,
          ) || 0,
      0,
    ) || 0;
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
            <Card className="flex flex-col h-full">
              {/* Top */}
              <div className="flex items-center justify-between mb-4">
                <Badge
                  status={campaign.status === "active" ? "success" : "default"}
                  text={campaign.status.toUpperCase()}
                />

                <div className="text-primary font-black text-xl">
                  ₹{Number(campaign.total_budget).toLocaleString()}
                </div>
              </div>

              {/* Title */}
              <Title level={4} className="!m-0 !mb-2 !font-black">
                {campaign.title}
              </Title>

              <Text type="secondary">
                {campaign.campaign_type.toUpperCase()} Campaign
              </Text>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 my-5">
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400">Budget</p>
                  <p className="font-bold">
                    ₹{Number(campaign.total_budget).toLocaleString()}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400">Creators</p>
                  <p className="font-bold">{totalCreators}</p>
                </div>

                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400">Bonus Reward</p>
                  <p className="font-bold">₹{campaign.bonus_reward}</p>
                </div>

                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400">Target Views</p>
                  <p className="font-bold">{campaign.bonus_target_views}</p>
                </div>
              </div>

              {/* Audience */}
              <div className="mb-4">
                <Text className="text-xs text-gray-400 uppercase">
                  Audience
                </Text>

                <div className="flex gap-2 mt-2">
                  <Badge
                    count={campaign.audience_gender}
                    style={{
                      backgroundColor: "#f3f4f6",
                      color: "#374151",
                    }}
                  />

                  <Badge
                    count={campaign.audience_age}
                    style={{
                      backgroundColor: "#f3f4f6",
                      color: "#374151",
                    }}
                  />
                </div>
              </div>

              {/* Top Prize */}
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-3 mb-4">
                <div className="text-xs text-gray-500">TOP REWARD</div>

                <div className="font-black text-lg text-orange-600">
                  ₹{campaign.rank_allocations?.[0]?.payout}
                </div>

                <div className="text-xs text-gray-500">
                  {campaign.rank_allocations?.[0]?.range}
                </div>
              </div>

              {/* Dates */}
              <div className="flex justify-between text-xs text-gray-500 mb-5">
                <span>
                  Starts: {new Date(campaign.start_date).toLocaleDateString()}
                </span>

                <span>
                  Ends: {new Date(campaign.end_date).toLocaleDateString()}
                </span>
              </div>

              <Button
                type="primary"
                block
                size="large"
                className="mt-auto"
                onClick={() => navigate(`/brand/campaigns/${campaign.id}`)}
              >
                View Details
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
