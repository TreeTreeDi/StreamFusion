import { Suspense } from "react";
import { StreamList } from "@/components/streams/StreamList";
import { PopularCategories } from "@/components/home/popular-categories";
import { fetchPopularStreams } from "@/lib/api-service";

export const revalidate = 60; // 每60秒重新验证数据

export default async function Home() {
  const streams = await fetchPopularStreams(4);
  console.log(streams.streams);

  return (
    <div className="p-6 md:p-12 space-y-8">

      
      {/* 推荐直播 */}
      <Suspense fallback={<StreamListSkeleton />}>
        <StreamList 
          title="推荐直播" 
          streams={streams.streams} 
          showMore={true} 
        />
      </Suspense>
      
      {/* 热门分类 */}
      <PopularCategories />
      
      {/* 推荐主播(后期实现) */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">推荐主播</h2>
          <button className="text-sm text-muted-foreground hover:text-primary transition-colors">
            查看更多
          </button>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {[1, 2, 3, 4, 5, 6].map((id) => (
            <StreamerCard key={id} />
          ))}
        </div>
      </div>
    </div>
  );
}

// 骨架屏组件
function BannerSkeleton() {
  return (
    <div className="w-full h-[300px] rounded-xl bg-muted animate-pulse"></div>
  );
}

function StreamListSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-48 bg-muted rounded animate-pulse"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((id) => (
          <div key={id} className="aspect-video bg-muted rounded-lg animate-pulse"></div>
        ))}
      </div>
    </div>
  );
}

function StreamerCard() {
  return (
    <div className="stream-card flex-shrink-0 w-[200px]">
      <div className="relative w-full aspect-video bg-muted rounded-md mb-2 overflow-hidden">
        <div className="absolute top-2 left-2 bg-destructive text-destructive-foreground text-xs px-2 py-1 rounded-md flex items-center">
          <div className="w-2 h-2 bg-white rounded-full mr-1"></div>
          直播中
        </div>
      </div>
      <div className="flex items-center">
        <div className="w-9 h-9 rounded-full bg-muted overflow-hidden mr-2"></div>
        <div className="overflow-hidden">
          <h3 className="text-sm font-medium truncate">主播名称</h3>
          <p className="text-xs text-muted-foreground truncate">游戏分类</p>
        </div>
      </div>
    </div>
  );
} 
