import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface RecommendedStreamProps {
  className?: string;
}

const RecommendedStreams = ({ className }: RecommendedStreamProps) => {
  // 模拟推荐直播数据
  const recommendedStreams = [
    {
      id: 'stream1',
      title: '王者荣耀职业赛事解说',
      streamer: '游戏解说_小王',
      thumbnailUrl: 'https://images.unsplash.com/photo-1511882150382-421056c89033',
      viewerCount: 7200,
    },
    {
      id: 'stream2',
      title: 'PUBG亚洲邀请赛',
      streamer: '电竞赛事频道',
      thumbnailUrl: 'https://images.unsplash.com/photo-1560253023-3ec5d502959f',
      viewerCount: 5800,
    },
    {
      id: 'stream3',
      title: '和平精英实况教学',
      streamer: '游戏大咖_老张',
      thumbnailUrl: 'https://images.unsplash.com/photo-1603501667226-d6bcef4c566b',
      viewerCount: 3400,
    },
  ];

  return (
    <div className={cn("", className)}>
      <h2 className="text-xl font-bold mb-4">您可能也喜欢</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {recommendedStreams.map((stream) => (
          <Link href={`/channel/${stream.id}`} key={stream.id}>
            <div className="bg-gray-800 rounded-md overflow-hidden cursor-pointer hover:bg-gray-700 transition-colors">
              <div className="relative">
                <div className="aspect-video relative">
                  <Image 
                    src={`${stream.thumbnailUrl}?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80`}
                    alt={stream.title} 
                    className="object-cover"
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                  />
                </div>
                <div className="absolute bottom-2 left-2 bg-red-600 text-white text-xs px-1.5 py-0.5 rounded-md flex items-center">
                  <div className="w-1.5 h-1.5 bg-white rounded-full mr-1"></div>
                  {stream.viewerCount.toLocaleString()}
                </div>
              </div>
              <div className="p-2">
                <h3 className="font-medium text-sm truncate">{stream.title}</h3>
                <p className="text-gray-400 text-xs">{stream.streamer}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RecommendedStreams; 
