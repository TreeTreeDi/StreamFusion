import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="p-6 md:p-12 space-y-8">
      {/* 轮播图（后期实现） */}
      <div className="w-full h-[300px] rounded-xl bg-[#18181b] flex items-center justify-center">
        <p className="text-muted-foreground">轮播图内容将在后期实现</p>
      </div>
      
      {/* 推荐直播 */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">推荐直播</h2>
          <button className="text-sm text-muted-foreground hover:text-[#a970ff] transition-colors">
            查看更多
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((id) => (
            <StreamCard key={id} />
          ))}
        </div>
      </div>
      
      {/* 热门分类 */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">热门分类</h2>
          <button className="text-sm text-muted-foreground hover:text-[#a970ff] transition-colors">
            查看全部
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((id) => (
            <CategoryCard key={id} />
          ))}
        </div>
      </div>
      
      {/* 推荐主播 */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">推荐主播</h2>
          <button className="text-sm text-muted-foreground hover:text-[#a970ff] transition-colors">
            发现更多
          </button>
        </div>
        <div className="flex overflow-x-auto pb-2 gap-4 scrollbar-hide">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((id) => (
            <StreamerCard key={id} />
          ))}
        </div>
      </div>
    </div>
  );
}

function StreamCard() {
  return (
    <Card className="stream-card overflow-hidden border-none">
      <div className="aspect-video bg-[#0e0e10] relative">
        {/* 这里将来会放置实际的缩略图 */}
        <div className="absolute top-2 left-2 bg-destructive text-destructive-foreground text-xs px-2 py-1 rounded-md flex items-center">
          <div className="w-2 h-2 bg-white rounded-full mr-1"></div>
          直播中
        </div>
        <div className="absolute bottom-2 left-2 bg-background/80 text-foreground text-xs px-2 py-1 rounded-md">
          1,234 观众
        </div>
      </div>
      <CardHeader className="p-3">
        <div className="flex space-x-2">
          <div className="h-10 w-10 rounded-full bg-[#18181b] overflow-hidden">
            {/* 这里将来会放置主播头像 */}
          </div>
          <div>
            <CardTitle className="text-base truncate">直播标题示例</CardTitle>
            <CardDescription className="text-xs truncate">主播名称</CardDescription>
            <p className="text-xs text-muted-foreground mt-1 truncate">游戏分类</p>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}

function CategoryCard() {
  return (
    <Card className="category-card overflow-hidden border-none">
      <div className="aspect-[4/5] bg-[#18181b] relative">
        {/* 这里将来会放置分类封面图 */}
      </div>
      <CardContent className="p-3">
        <CardTitle className="text-base truncate">分类名称</CardTitle>
        <CardDescription className="text-xs truncate">
          1.2万 观众
        </CardDescription>
      </CardContent>
    </Card>
  );
}

function StreamerCard() {
  return (
    <div className="stream-card flex-shrink-0 w-[200px]">
      <div className="relative w-full aspect-video bg-[#18181b] rounded-md mb-2 overflow-hidden">
        {/* 这里将来会放置直播缩略图 */}
        <div className="absolute top-2 left-2 bg-destructive text-destructive-foreground text-xs px-2 py-1 rounded-md flex items-center">
          <div className="w-2 h-2 bg-white rounded-full mr-1"></div>
          直播中
        </div>
      </div>
      <div className="flex items-center">
        <div className="w-9 h-9 rounded-full bg-[#18181b] overflow-hidden mr-2">
          {/* 这里将来会放置主播头像 */}
        </div>
        <div className="overflow-hidden">
          <h3 className="text-sm font-medium truncate">主播名称</h3>
          <p className="text-xs text-muted-foreground truncate">游戏分类</p>
        </div>
      </div>
    </div>
  );
} 
