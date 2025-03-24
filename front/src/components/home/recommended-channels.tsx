"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

import { fetchRecommendedChannels } from "@/lib/api-service";
import { Stream } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export const RecommendedChannels = () => {
  const [channels, setChannels] = useState<Stream[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadChannels = async () => {
      try {
        setIsLoading(true);
        const response = await fetchRecommendedChannels();
        console.log(response);
        if (response.success && response.data) {
        }
      } catch (error) {
        console.error("加载推荐频道失败:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadChannels();
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array(3).fill(0).map((_, i) => (
          <Skeleton key={i} className="aspect-video w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (channels.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">暂无推荐频道</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {channels.map((channel) => (
        <ChannelCard key={channel._id} channel={channel} />
      ))}
    </div>
  );
};

interface ChannelCardProps {
  channel: Stream;
}

const ChannelCard = ({ channel }: ChannelCardProps) => {
  const userObj = typeof channel.user === 'object' ? channel.user : null;
  const categoryObj = typeof channel.category === 'object' ? channel.category : null;

  return (
    <Link href={`/channel/${channel._id}`}>
      <div className="group border rounded-lg overflow-hidden hover:border-primary transition">
        <div className="relative aspect-video w-full">
          {channel.thumbnail ? (
            <Image
              src={channel.thumbnail}
              alt={channel.title}
              fill
              className="object-cover group-hover:scale-105 transition duration-300"
            />
          ) : (
            <div className="w-full h-full bg-secondary flex items-center justify-center">
              <span className="text-secondary-foreground">无缩略图</span>
            </div>
          )}
          {channel.isLive && (
            <Badge 
              variant="destructive"
              className="absolute top-2 left-2"
            >
              直播中
            </Badge>
          )}
          <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-1 rounded-md text-xs text-white">
            {channel.viewerCount} 观众
          </div>
        </div>
        <div className="p-3">
          <div className="flex items-start gap-2">
            {userObj?.avatar && (
              <div className="relative w-8 h-8 rounded-full overflow-hidden">
                <Image 
                  src={userObj.avatar} 
                  alt={userObj.username} 
                  fill 
                  className="object-cover"
                />
              </div>
            )}
            <div className="flex-1 overflow-hidden">
              <h3 className="font-medium text-sm truncate">{channel.title}</h3>
              <p className="text-xs text-muted-foreground truncate">
                {userObj?.displayName || userObj?.username || '未知用户'}
              </p>
              {categoryObj && (
                <p className="text-xs text-muted-foreground mt-1">
                  {categoryObj.name}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}; 
