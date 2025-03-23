import Link from "next/link";
import { cn } from "@/lib/utils";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
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
          {/* 这里将来会循环渲染推荐频道列表 */}
          <SidebarItem 
            label="示例频道1"
            href="/channel/1"
            avatar="https://images.unsplash.com/photo-1527980965255-d3b416303d12?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80"
            viewerCount={1240}
            isLive
          />
          <SidebarItem 
            label="示例频道2"
            href="/channel/2"
            avatar="https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80"
          />
          <SidebarItem 
            label="示例频道3"
            href="/channel/3"
            avatar="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80"
            viewerCount={5200}
            isLive
          />
        </div>
      </div>
      <div className="p-3 pt-0">
        <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
          热门分类
        </h2>
        <div className="space-y-1">
          {/* 这里将来会循环渲染热门分类列表 */}
          <SidebarItem 
            label="游戏"
            href="/category/games"
            viewerCount={35000}
            icon="🎮"
          />
          <SidebarItem 
            label="音乐"
            href="/category/music"
            viewerCount={12000}
            icon="🎵"
          />
          <SidebarItem 
            label="聊天"
            href="/category/chat"
            viewerCount={8500}
            icon="💬"
          />
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
