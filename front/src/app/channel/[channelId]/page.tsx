import { Metadata } from "next";
import { notFound } from "next/navigation";

import StreamPlayer from "@/components/channel/StreamPlayer";
import StreamInfo from "@/components/channel/StreamInfo";
import AboutStreamer from "@/components/channel/AboutStreamer";
import RecommendedStreams from "@/components/channel/RecommendedStreams";

interface ChannelPageProps {
  params: {
    channelId: string;
  };
}

export async function generateMetadata({ params }: ChannelPageProps): Promise<Metadata> {
  return {
    title: `频道: ${params.channelId} - 直播平台`,
    description: `观看 ${params.channelId} 的直播和视频内容`,
  };
}

export default function ChannelPage({ params }: ChannelPageProps) {
  const { channelId } = params;

  // 这里将来会使用实际的API获取数据
  // 暂时使用模拟数据
  const mockData = {
    isValid: true,
    stream: {
      id: "1",
      title: "英雄联盟排位冲分 - 钻石晋级赛",
      description: "英雄联盟高分玩家，擅长中单位置。每日直播时间19:00-23:00，周末全天。欢迎大家来一起玩游戏~",
      thumbnailUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e",
      isLive: true,
      viewerCount: 12500,
      category: "英雄联盟",
      tags: ["MOBA", "排位赛", "中文"]
    },
    user: {
      id: "streamer1",
      username: "电竞少女_小美",
      avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956",
      bio: "英雄联盟高分玩家，擅长中单位置。每日直播时间19:00-23:00，周末全天。欢迎大家来一起玩游戏~",
      isVerified: true,
      followerCount: 87500
    }
  };

  if (!mockData.isValid) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* 左侧内容区 */}
        <div className="lg:w-3/4">
          {/* 直播视频播放器 */}
          <StreamPlayer 
            stream={mockData.stream}
            isLive={mockData.stream.isLive}
          />
          
          {/* 直播信息 */}
          <StreamInfo 
            title={mockData.stream.title}
            category={mockData.stream.category}
            viewerCount={mockData.stream.viewerCount} 
            tags={mockData.stream.tags}
          />
          
          {/* 主播信息 */}
          <AboutStreamer 
            user={mockData.user}
          />
          
          {/* 推荐直播 */}
          <RecommendedStreams />
        </div>
        
        {/* 右侧聊天区将在稍后任务中实现 */}
        <div className="lg:w-1/4 bg-gray-800 rounded-md overflow-hidden flex flex-col h-auto lg:h-[calc(100vh-120px)] sticky top-4">
          <div className="flex items-center justify-between bg-gray-900 p-3 border-b border-gray-700">
            <div className="flex items-center space-x-3">
              <span className="font-medium">聊天室</span>
              <span className="text-gray-400 text-sm">12.5K 人</span>
            </div>
            <div>
              <button className="text-gray-400 hover:text-white">
                <i className="fas fa-cog"></i>
              </button>
            </div>
          </div>
          
          <div className="p-4 flex-1 flex items-center justify-center text-gray-400">
            聊天功能将在后续任务中实现
          </div>
        </div>
      </div>
    </div>
  );
} 
