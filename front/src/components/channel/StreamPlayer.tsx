import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { UserChannelInfo, StreamChannelInfo } from '@/lib/services/channel.service'; // 导入类型

interface StreamPlayerProps {
  stream: StreamChannelInfo | null; // 允许 stream 为 null
  user: UserChannelInfo; // 添加 user prop
  isLive: boolean;
  channelId: string; // 添加 channelId prop
  className?: string;
}

const StreamPlayer = ({ stream, user, isLive, channelId, className }: StreamPlayerProps) => {

  // 离线时使用的缩略图（优先使用主播头像，否则用默认图）
  const offlineThumbnail = user.avatar || '/images/stream-offline.jpg'; // 假设有默认离线图片
  const offlineTitle = `${user.displayName || user.username} 当前不在线`;

  // 最终使用的缩略图和标题
  const thumbnailUrl = isLive && stream?.thumbnailUrl ? stream.thumbnailUrl : offlineThumbnail;
  const title = isLive && stream?.title ? stream.title : offlineTitle;

  return (
    <div className={cn("bg-black rounded-md overflow-hidden mb-4 relative aspect-video", className)}>
      {/* 视频播放器区域 - 使用缩略图 */}
      <Image 
        src={`${thumbnailUrl}?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80`}
        alt={title} 
        className="w-full h-full object-cover"
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 75vw"
        priority // 优先加载，因为是主要内容
      />
        
      {/* 控制栏 - 仅在直播时可能需要显示完整控制，离线时可以简化或隐藏 */}
      {isLive && stream && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-4 py-3 opacity-0 hover:opacity-100 transition-opacity duration-300">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <button className="text-white hover:text-purple-400">
                <i className="fas fa-play text-xl"></i>
              </button>
              <div className="text-white">
                <span>00:00:00</span> {/* 时间显示需要动态更新 */}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-white hover:text-purple-400">
                <i className="fas fa-cog"></i>
              </button>
              <button className="text-white hover:text-purple-400">
                <i className="fas fa-expand"></i>
              </button>
            </div>
          </div>
          <div className="mt-2 relative">
            <div className="h-1 bg-gray-600 rounded-full overflow-hidden">
              <div className="h-full w-1/3 bg-purple-500"></div> {/* 进度条需要动态更新 */} 
            </div>
          </div>
        </div>
      )}
        
      {/* 在线状态或离线提示 */}
      <div className="absolute top-4 left-4">
        {isLive && stream ? (
          <div className="flex items-center bg-red-600 text-white px-2 py-1 rounded-md text-sm font-medium">
            <div className="w-2 h-2 bg-white rounded-full mr-1.5 animate-pulse"></div>
            直播中 · {stream.viewerCount.toLocaleString()} 观众
          </div>
        ) : (
          <div className="bg-gray-700 text-white px-2 py-1 rounded-md text-sm font-medium">
            离线
          </div>
        )}
      </div>

      {/* 离线时的遮罩和提示信息 */}
      {!isLive && (
        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white">
           <div className="w-16 h-16 rounded-full overflow-hidden relative mb-4 border-2 border-gray-500">
             {user.avatar && (
                <Image 
                  src={`${user.avatar}?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80`}
                  alt={`${user.displayName || user.username}的头像`} 
                  className="object-cover"
                  fill
                  sizes="64px"
                />
             )}
            </div>
          <h3 className="text-xl font-semibold mb-1">{user.displayName || user.username} 当前不在线</h3>
          <p className="text-gray-300 text-sm">下次直播时间：未知</p> {/* 可以从用户 bio 或其他地方获取 */} 
        </div>
      )}
    </div>
  );
};

export default StreamPlayer; 
