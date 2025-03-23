"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { fetchPopularCategories, fetchRecommendedChannels } from "@/lib/api-service";
import { Category, Stream } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [recommendedChannels, setRecommendedChannels] = useState<Stream[]>([]);
  const [popularCategories, setPopularCategories] = useState<Category[]>([]);
  const [isLoadingChannels, setIsLoadingChannels] = useState(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  useEffect(() => {
    const loadSidebarData = async () => {
      // 加载推荐频道
      setIsLoadingChannels(true);
      try {
        const channels = await fetchRecommendedChannels(3);
        setRecommendedChannels(channels);
      } catch (error) {
        console.error("Failed to load recommended channels:", error);
      } finally {
        setIsLoadingChannels(false);
      }

      // 加载热门分类
      setIsLoadingCategories(true);
      try {
        const categories = await fetchPopularCategories(3);
        setPopularCategories(categories);
      } catch (error) {
        console.error("Failed to load popular categories:", error);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    loadSidebarData();
  }, []);

  // 使用示例数据作为备选
  const fallbackChannels = [
    {
      _id: "1",
      user: {
        _id: "user1",
        username: "示例频道1",
        avatar: "/images/avatars/avatar-1.png",
        isStreamer: true,
        email: "",
        createdAt: ""
      },
      title: "示例直播",
      isLive: true,
      viewerCount: 1240,
    },
    {
      _id: "2",
      user: {
        _id: "user2",
        username: "示例频道2",
        avatar: "/images/avatars/avatar-2.png",
        isStreamer: true,
        email: "",
        createdAt: ""
      },
      title: "示例直播",
      isLive: false,
      viewerCount: 0,
    },
    {
      _id: "3",
      user: {
        _id: "user3",
        username: "示例频道3",
        avatar: "/images/avatars/avatar-3.png",
        isStreamer: true,
        email: "",
        createdAt: ""
      },
      title: "示例直播",
      isLive: true,
      viewerCount: 5200,
    }
  ];

  const fallbackCategories = [
    {
      _id: "1",
      name: "游戏",
      slug: "games",
      viewerCount: 35000,
      streamCount: 100
    },
    {
      _id: "2",
      name: "音乐",
      slug: "music",
      viewerCount: 12000,
      streamCount: 50
    },
    {
      _id: "3",
      name: "聊天",
      slug: "chat",
      viewerCount: 8500,
      streamCount: 30
    }
  ];

  const displayedChannels = recommendedChannels.length > 0 ? recommendedChannels : fallbackChannels;
  const displayedCategories = popularCategories.length > 0 ? popularCategories : fallbackCategories;

  return (
    <aside className={cn(
      "fixed left-0 flex h-full w-60 flex-col bg-[#0e0e10] border-r border-[#2a2a2d] z-40",
      className
    )}>
      <div className="p-3">
        <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
          推荐频道
        </h2>
        <div className="space-y-1">
          {isLoadingChannels ? (
            // 加载状态骨架屏
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="px-3 py-2 flex items-center space-x-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-1 flex-1">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))
          ) : (
            // 实际内容
            displayedChannels.map((stream) => {
              const user = typeof stream.user === 'string' 
                ? { _id: stream.user, username: "Unknown", avatar: "", email: "", isStreamer: true, createdAt: "" }
                : stream.user;
                
              return (
                <SidebarItem 
                  key={stream._id}
                  label={user.username}
                  href={`/channel/${user._id}`}
                  avatar={user.avatar || "/images/avatars/avatar-1.png"}
                  viewerCount={stream.viewerCount}
                  isLive={stream.isLive}
                />
              );
            })
          )}
        </div>
      </div>
      <div className="p-3 pt-0">
        <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
          热门分类
        </h2>
        <div className="space-y-1">
          {isLoadingCategories ? (
            // 加载状态骨架屏
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="px-3 py-2 flex items-center space-x-3">
                <Skeleton className="h-8 w-8 rounded" />
                <div className="space-y-1 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))
          ) : (
            // 实际内容
            displayedCategories.map((category) => (
              <SidebarItem 
                key={category._id}
                label={category.name}
                href={`/category/${category.slug}`}
                viewerCount={category.viewerCount}
                icon={getCategoryEmoji(category.slug)}
              />
            ))
          )}
        </div>
      </div>
      <div className="mt-auto p-4 border-t border-[#2a2a2d]">
        <button className="w-full py-2 rounded-md bg-[#a970ff] text-white hover:bg-[#9461e5] transition-colors">
          开始直播
        </button>
      </div>
    </aside>
  );
}

// 为分类获取表情图标的辅助函数
function getCategoryEmoji(slug: string): string {
  const emojiMap: Record<string, string> = {
    games: "🎮",
    music: "🎵",
    chat: "💬",
    irl: "📱",
    creative: "🎨",
    esports: "🏆",
    // 默认为游戏图标
    default: "🎮"
  };
  
  return emojiMap[slug] || emojiMap.default;
}

interface SidebarItemProps {
  label: string;
  href: string;
  avatar?: string;
  icon?: string;
  viewerCount?: number;
  isLive?: boolean;
}

function SidebarItem({ label, href, avatar, icon, viewerCount, isLive }: SidebarItemProps) {
  return (
    <Link 
      href={href}
      className="sidebar-item flex items-center gap-x-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-[#18181b] transition-colors"
    >
      {avatar && (
        <div className="relative w-8 h-8 flex-shrink-0">
          <img 
            src={avatar} 
            alt={label} 
            className="w-full h-full rounded-full object-cover"
          />
          {isLive && (
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#0e0e10]"></span>
          )}
        </div>
      )}
      {icon && (
        <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center text-lg">
          {icon}
        </div>
      )}
      <div className="flex-1 overflow-hidden">
        <span className="truncate">{label}</span>
        {viewerCount !== undefined && (
          <p className="text-xs text-muted-foreground truncate">
            {viewerCount.toLocaleString()} 观众
          </p>
        )}
      </div>
      {isLive && !avatar && (
        <span className="w-2 h-2 rounded-full bg-destructive flex-shrink-0" />
      )}
    </Link>
  );
} 
