"use client";

import { useEffect, useState, useContext } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { fetchPopularCategories, fetchRecommendedChannels } from "@/lib/api-service";
import { Category, Stream } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { SidebarContext } from "@/contexts/sidebar-context";
import { motion } from "framer-motion";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  // 获取侧边栏状态
  const { isOpen, closeSidebar } = useContext(SidebarContext);
  
  // 存储推荐频道和热门分类
  const [recommendedChannels, setRecommendedChannels] = useState<Stream[]>([]);
  const [popularCategories, setPopularCategories] = useState<Category[]>([]);
  
  // 加载状态 作用是当侧边栏数据加载时，显示加载状态
  const [isLoadingChannels, setIsLoadingChannels] = useState(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  // 加载侧边栏数据
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

  // 计算移动端侧边栏的类名
  const mobileSidebarClasses = cn(
    "fixed inset-y-0 left-0 z-50 w-72 bg-[#0e0e10] md:hidden border-r border-[#2a2a2d] shadow-lg transition-transform duration-300 transform",
    isOpen ? "translate-x-0" : "-translate-x-full"
  );


  // 桌面侧边栏类名
  const desktopSidebarClasses = cn(
    "flex h-full w-60 flex-col bg-[#0e0e10] border-r border-[#2a2a2d]",
    className
  );

  // 添加遮罩层，点击时关闭侧边栏
  const maskLayer = isOpen && (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden" 
      onClick={closeSidebar}
    />
  );

  // 桌面侧边栏
  const desktopSidebar = (
      <motion.aside
        initial={{ x: -200 }}
        animate={{ x: 0 }}
        transition={{ type: "spring", stiffness: 250, damping: 30 }}
        className={desktopSidebarClasses}
      >
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
    </motion.aside>
  );

  return (
    <>
      {maskLayer}
      {desktopSidebar}
    </>
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
  onClick?: () => void;
}

function SidebarItem({ label, href, avatar, icon, viewerCount, isLive, onClick }: SidebarItemProps) {
  return (
    <Link 
      href={href}
      className="sidebar-item flex items-center gap-x-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-[#18181b] transition-colors"
      onClick={onClick}
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
        <p className="truncate">{label}</p>
        {viewerCount !== undefined && (
          <p className="text-xs text-muted-foreground truncate">
            {viewerCount.toLocaleString()} 观众
          </p>
        )}
      </div>
    </Link>
  );
} 
