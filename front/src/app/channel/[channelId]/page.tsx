import { Metadata } from "next";
import { notFound } from "next/navigation";

import StreamPlayer from "@/components/channel/StreamPlayer";
import StreamInfo from "@/components/channel/StreamInfo";
import AboutStreamer from "@/components/channel/AboutStreamer";
// import RecommendedStreams from "@/components/channel/RecommendedStreams"; // 暂时注释掉推荐
// import ChatRoom from "@/components/channel/ChatRoom"; // 聊天室组件 (暂不实现)
import { getChannelInfo } from "@/lib/services/channel.service"; // 导入服务函数

interface ChannelPageProps {
  params: {
    channelId: string;
  };
}

export async function generateMetadata({ params }: ChannelPageProps): Promise<Metadata> {
  // 尝试获取频道信息用于元数据
  const channelInfo = await getChannelInfo(params.channelId);
  
  if (!channelInfo) {
    return {
      title: "频道未找到 - 直播平台",
    };
  }
  
  return {
    title: `${channelInfo.user.displayName} (${channelInfo.user.username}) - 直播平台`,
    description: `观看 ${channelInfo.user.displayName} 的直播。${channelInfo.stream?.title ?? ''}`,
    // 可以添加 Open Graph 或 Twitter 卡片元数据
    // openGraph: {
    //   title: `${channelInfo.user.displayName} 的直播间`,
    //   description: channelInfo.stream?.title ?? '正在直播',
    //   images: [
    //     {
    //       url: channelInfo.stream?.thumbnailUrl ?? channelInfo.user.avatar ?? '/default-og-image.png',
    //       width: 1200,
    //       height: 630,
    //     },
    //   ],
    // },
  };
}

// 将页面组件改为 async 函数
export default async function ChannelPage({ params }: ChannelPageProps) {
  const { channelId } = params;

  // 调用 API 获取频道数据
  const channelInfo = await getChannelInfo(channelId);

  // 如果未找到频道信息，显示 404 页面
  if (!channelInfo) {
    notFound();
  }

  // 从 channelInfo 解构所需数据
  const { user, stream, isLive } = channelInfo;

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* 左侧内容区 */}
        <div className="lg:w-3/4">
          {/* 直播视频播放器 */}
          <StreamPlayer 
            stream={stream} // 传递 stream 对象或 null
            user={user} // 传递 user 对象
            isLive={isLive} // 传递直播状态
            channelId={channelId} // 传递频道 ID
          />
          
          {/* 直播信息 */}
          <StreamInfo 
            title={stream?.title ?? "暂无标题"} // 处理 stream 可能为 null 的情况
            category={stream?.category?.name ?? "未知分类"}
            viewerCount={stream?.viewerCount ?? 0}
            tags={stream?.tags ?? []} // 假设 stream 对象中有 tags
          />
          
          {/* 主播信息 */}
          <AboutStreamer 
            user={user} // 传递用户信息
          />
          
          {/* 推荐直播 (暂时注释) */}
          {/* <RecommendedStreams currentChannelId={channelId} /> */}
        </div>
        
        {/* 右侧聊天区 (暂不实现) */}
        {/* <div className="lg:w-1/4">
          <ChatRoom channelId={channelId} />
        </div> */}
      </div>
    </div>
  );
} 
