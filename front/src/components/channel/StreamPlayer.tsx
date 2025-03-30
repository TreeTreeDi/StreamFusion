import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface StreamPlayerProps {
  stream: {
    id: string;
    title: string;
    thumbnailUrl: string;
    viewerCount: number;
  };
  isLive: boolean;
  className?: string;
}

const StreamPlayer = ({ stream, isLive, className }: StreamPlayerProps) => {
  return (
    <div className={cn("bg-black rounded-md overflow-hidden mb-4 relative", className)} style={{ paddingTop: "56.25%" }}>
      <div className="absolute inset-0 flex items-center justify-center">
        {/* 视频播放器区域（使用图像作为占位符） */}
        <Image 
          src={`${stream.thumbnailUrl}?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80`}
          alt="直播画面" 
          className="w-full h-full object-cover"
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 75vw"
          priority
        />
        
        {/* 控制栏 */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <button className="text-white hover:text-purple-400">
                <i className="fas fa-play text-xl"></i>
              </button>
              <div className="text-white">
                <span>01:23:45</span>
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
              <div className="h-full w-2/3 bg-purple-500"></div>
            </div>
          </div>
        </div>
        
        {/* 在线人数和直播状态 */}
        {isLive && (
          <div className="absolute top-4 left-4">
            <div className="flex items-center bg-red-600 text-white px-2 py-1 rounded-md text-sm">
              <div className="w-2 h-2 bg-white rounded-full mr-1"></div>
              直播中 · {stream.viewerCount.toLocaleString()} 观众
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StreamPlayer; 
