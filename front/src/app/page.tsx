import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";

// 模拟的静态数据
const liveStreams = [
  { id: '1', title: '🔴 新赛季冲分！中单法王', streamer: '大神玩家A', category: '英雄联盟', viewers: 1234, thumbnailUrl: 'https://picsum.photos/seed/stream1/440/248' },
  { id: '2', title: '轻松一刻，聊聊日常', streamer: '聊天主播B', category: 'Just Chatting', viewers: 987, thumbnailUrl: 'https://picsum.photos/seed/stream2/440/248' },
  { id: '3', title: 'Valorant 精彩集锦 | !抽奖', streamer: '枪王C', category: 'Valorant', viewers: 2500, thumbnailUrl: 'https://picsum.photos/seed/stream3/440/248' },
  { id: '4', title: '深夜食堂，一起看剧', streamer: '陪伴主播D', category: 'Just Chatting', viewers: 555, thumbnailUrl: 'https://picsum.photos/seed/stream4/440/248' },
];

const preferredCategories = [
  { id: 'lol', name: '英雄联盟', viewers: '5万', coverUrl: 'https://static-cdn.jtvnw.net/ttv-boxart/21779-188x250.jpg', tags: ['角色扮演', '策略'] },
  { id: 'chatting', name: 'Just Chatting', viewers: '30.2万', coverUrl: 'https://static-cdn.jtvnw.net/ttv-boxart/509658-188x250.jpg', tags: ['IRL'] },
  { id: 'valorant', name: 'Valorant', viewers: '10万', coverUrl: 'https://static-cdn.jtvnw.net/ttv-boxart/516575-188x250.jpg', tags: ['第一人称射击游戏', '战术射击'] },
];

const categoryStreams = {
  lol: [
    { id: 'lol1', title: '峡谷之巅对决', streamer: '王者E', category: '英雄联盟', viewers: 3100, thumbnailUrl: 'https://picsum.photos/seed/lol1/440/248' },
    { id: 'lol2', title: '下路组合教学', streamer: 'ADC大师F', category: '英雄联盟', viewers: 1800, thumbnailUrl: 'https://picsum.photos/seed/lol2/440/248' },
    { id: 'lol3', title: '欢乐大乱斗', streamer: '娱乐主播G', category: '英雄联盟', viewers: 950, thumbnailUrl: 'https://picsum.photos/seed/lol3/440/248' },
    { id: 'lol4', title: '冲分日记 Day 5', streamer: '大神玩家A', category: '英雄联盟', viewers: 1234, thumbnailUrl: 'https://picsum.photos/seed/stream1/440/248' }, // 复用
  ],
  chatting: [
    { id: 'chat1', title: '一起听歌吧', streamer: '音乐主播H', category: 'Just Chatting', viewers: 1500, thumbnailUrl: 'https://picsum.photos/seed/chat1/440/248' },
    { id: 'chat2', title: '户外探险直播', streamer: '旅行家I', category: 'Just Chatting', viewers: 2200, thumbnailUrl: 'https://picsum.photos/seed/chat2/440/248' },
    { id: 'chat3', title: '深夜电台', streamer: '聊天主播B', category: 'Just Chatting', viewers: 987, thumbnailUrl: 'https://picsum.photos/seed/stream2/440/248' }, // 复用
    { id: 'chat4', title: '美食制作分享', streamer: '厨神J', category: 'Just Chatting', viewers: 700, thumbnailUrl: 'https://picsum.photos/seed/chat4/440/248' },
  ],
  valorant: [
    { id: 'val1', title: '职业哥排位', streamer: '枪王C', category: 'Valorant', viewers: 2500, thumbnailUrl: 'https://picsum.photos/seed/stream3/440/248' }, // 复用
    { id: 'val2', title: '新地图探索', streamer: '战术大师K', category: 'Valorant', viewers: 1900, thumbnailUrl: 'https://picsum.photos/seed/val2/440/248' },
    { id: 'val3', title: '和水友一起玩', streamer: '互动主播L', category: 'Valorant', viewers: 1100, thumbnailUrl: 'https://picsum.photos/seed/val3/440/248' },
    { id: 'val4', title: '爆头集锦', streamer: '狙神M', category: 'Valorant', viewers: 2800, thumbnailUrl: 'https://picsum.photos/seed/val4/440/248' },
  ],
};

export default function Home() {
  return (
    <div className="p-6 md:p-12 space-y-12">

      {/* 正在直播 */}
      <section>
        <h2 className="text-2xl font-bold mb-4">正在直播</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {liveStreams.map((stream) => (
            <StreamCard key={stream.id} stream={stream} />
          ))}
        </div>
      </section>

      {/* 喜欢的类别 */}
      <section>
        <h2 className="text-2xl font-bold mb-4">我们认为您会喜欢的类别</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {preferredCategories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </section>

      {/* 各类别直播列表 */}
      {preferredCategories.map((category) => (
        <section key={category.id}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">{category.name} 直播</h2>
            <Link href={`/directory/category/${category.id}`} className="text-sm text-primary hover:underline">
              查看更多
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {(categoryStreams[category.id as keyof typeof categoryStreams] || []).map((stream) => (
              <StreamCard key={stream.id} stream={stream} />
            ))}
          </div>
        </section>
      ))}

    </div>
  );
}

// --- 子组件 ---

interface Stream {
  id: string;
  title: string;
  streamer: string;
  category: string;
  viewers: number;
  thumbnailUrl: string;
}

interface StreamCardProps {
  stream: Stream;
}

function StreamCard({ stream }: StreamCardProps) {
  return (
    <Link href={`/live/${stream.streamer}`} className="group block space-y-2">
      <div className="relative aspect-video rounded-lg overflow-hidden transition-transform duration-200 ease-in-out group-hover:scale-105">
        <Image
          src={stream.thumbnailUrl}
          alt={`${stream.title} 直播缩略图`}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
        />
        <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-semibold px-2 py-0.5 rounded">
          直播
        </div>
        <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">
          {stream.viewers.toLocaleString()} 名观众
        </div>
      </div>
      <div className="flex items-start space-x-3">
        {/* 占位符头像 */}
        <div className="w-9 h-9 rounded-full bg-muted flex-shrink-0 mt-1"></div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold truncate text-foreground group-hover:text-primary">{stream.title}</h3>
          <p className="text-xs text-muted-foreground truncate">{stream.streamer}</p>
          <p className="text-xs text-muted-foreground truncate">{stream.category}</p>
        </div>
      </div>
    </Link>
  );
}


interface Category {
    id: string;
    name: string;
    viewers: string;
    coverUrl: string;
    tags: string[];
}

interface CategoryCardProps {
    category: Category;
}

function CategoryCard({ category }: CategoryCardProps) {
    return (
        <Link href={`/directory/category/${category.id}`} className="group block space-y-2">
            <div className="aspect-[3/4] rounded overflow-hidden transition-transform duration-200 ease-in-out group-hover:scale-105">
                <Image
                    src={category.coverUrl}
                    alt={`${category.name} 封面`}
                    width={188}
                    height={250}
                    className="object-cover w-full h-full"
                />
            </div>
            <div>
                <h3 className="text-sm font-semibold truncate text-foreground group-hover:text-primary">{category.name}</h3>
                <p className="text-xs text-muted-foreground">{category.viewers} 名观众</p>
                <div className="mt-1 flex flex-wrap gap-1">
                    {category.tags.map(tag => (
                        <span key={tag} className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">
                            {tag}
                        </span>
                    ))}
                </div>
            </div>
        </Link>
    );
}
