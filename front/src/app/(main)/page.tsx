'use client'; // 需要标记为客户端组件以使用 hooks

import { Suspense, useState, useEffect, useRef } from "react"; // 导入 useState, useEffect, useRef
import { useRouter } from 'next/navigation';
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { motion } from "framer-motion"; // 导入framer-motion


// 移除静态 liveStreams 数据

// 抽离子组件
import { CategoryCard, Category } from "@/components/home/CategoryCard";
import { StreamCardV2 as StreamCard, HomeStream as Stream } from "@/components/streams/StreamCard";


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

// 淡入动画变体
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6 }
  }
};

// 交错动画容器变体
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function Home() {
  const router = useRouter();
  const [liveStreamsData, setLiveStreamsData] = useState<Stream[]>([]); // 添加 state
  const [isLoading, setIsLoading] = useState(true); // 添加加载状态
  const [error, setError] = useState<string | null>(null); // 添加错误状态

  useEffect(() => {
    const fetchLiveStreams = async () => {
      setIsLoading(true);
      setError(null);
      try {
      const response = await fetch('/api/livekit/rooms');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: Stream[] = await response.json();
        // 为 API 返回的数据补充 StreamCard 需要的字段
        const formattedData = data.map(stream => ({
          ...stream,
          title: stream.name || '未命名直播', // 使用 room name 作为 title
          streamer: '主播', // 占位符，后续可从 metadata 获取
          category: '直播中', // 占位符
          viewers: stream.participantCount || 0,
          thumbnailUrl: `https://picsum.photos/seed/${stream.name || stream.id}/440/248` // 临时缩略图
        }));
        setLiveStreamsData(formattedData);
      } catch (e) {
        console.error("Failed to fetch live streams:", e);
        setError(e instanceof Error ? e.message : '获取直播列表失败');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLiveStreams();
    // 可以设置定时器轮询刷新
    // const intervalId = setInterval(fetchLiveStreams, 30000); // 每 30 秒刷新一次
    // return () => clearInterval(intervalId); // 清除定时器
  }, []); // 空依赖数组，仅在挂载时运行

  const handleStartStreaming = () => {
    router.push('/start-stream');
  };

  const plugin = useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  );

  // Mock 图片数据
  const carouselImages = [
    'https://static-cdn.jtvnw.net/previews-ttv/live_user_valorant_pacific-440x248.jpg',
    'https://static-cdn.jtvnw.net/previews-ttv/live_user_mobilmobil-440x248.jpg',
    'https://static-cdn.jtvnw.net/previews-ttv/live_user_zondalol-320x180.jpg',
    'https://static-cdn.jtvnw.net/previews-ttv/live_user_uzra-320x180.jpg',
    'https://static-cdn.jtvnw.net/previews-ttv/live_user_qttsix-320x180.jpg',
  ];

  return (
    <motion.div 
      className="p-6 md:p-12 space-y-12 bg-gradient-to-b from-background/95 to-background"
      initial="hidden"
      animate="visible"
      variants={staggerContainer} // Apply staggerContainer to the main wrapper
    >
      {/* --- 顶部英雄区域 --- */}
      <motion.section
        className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-purple-900/30 to-indigo-900/30 backdrop-blur-sm shadow-xl mx-auto max-w-7xl"
        variants={fadeIn} // This section will now stagger in
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* 左侧轮播图 */}
          <motion.div 
            className="p-8"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Carousel
              plugins={[plugin.current]}
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full"
              onMouseEnter={plugin.current.stop}
              onMouseLeave={plugin.current.reset}
            >
              <CarouselContent>
                {carouselImages.map((src, index) => (
                  <CarouselItem key={index}>
                    <motion.div 
                      className="relative aspect-video overflow-hidden rounded-xl" 
                      whileHover={{ scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    > 
                      <Image
                        src={src}
                        alt={`轮播图 ${index + 1}`}
                        fill
                        className="object-cover"
                        priority={index === 0} 
                        sizes="(max-width: 768px) 100vw, 100vw" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                      <div className="absolute bottom-4 left-4 text-white">
                        <h3 className="font-bold text-xl">热门直播 {index + 1}</h3>
                        <p className="text-sm opacity-90">立即观看</p>
                      </div>
                    </motion.div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-10" /> 
              <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-10" /> 
            </Carousel>
          </motion.div>
          
          {/* 右侧欢迎信息 */}
          <motion.div 
            className="flex flex-col justify-center p-8"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">探索直播世界</h1>
            <p className="text-lg mb-6 text-muted-foreground">发现精彩内容，与创作者互动，或开始您自己的直播之旅</p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                onClick={handleStartStreaming} 
                className="text-lg px-8 py-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg rounded-xl"
                size="lg"
              >
                开始直播
                <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* 正在直播 */}
      <motion.section
        variants={fadeIn} // This section will now stagger in
        className="bg-card/40 backdrop-blur-sm rounded-xl p-6 shadow-sm"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-orange-500">
            <span className="inline-block mr-2">
              <svg className="w-6 h-6 text-red-500 inline" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
              </svg>
            </span>
            正在直播
          </h2>
          <Link href="/directory" className="text-sm text-primary hover:underline flex items-center">
            查看全部
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        {isLoading && (
          <div className="flex justify-center items-center h-32">
            <motion.div
              className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            />
          </div>
        )}
        {error && (
          <motion.div 
            className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p>错误: {error}</p>
          </motion.div>
        )}
        {!isLoading && !error && liveStreamsData.length === 0 && (
          <motion.div 
            className="text-center py-12 px-4 bg-muted/30 rounded-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <svg className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <p className="text-lg font-medium">当前没有直播</p>
            <p className="text-muted-foreground">稍后再来看看，或者您也可以开始直播</p>
          </motion.div>
        )}
        {!isLoading && !error && liveStreamsData.length > 0 && (
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {liveStreamsData.map((stream) => (
              <motion.div key={stream.id} variants={fadeIn}>
                <StreamCard stream={stream} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.section>

      {/* 喜欢的类别 */}
      <motion.section
        variants={fadeIn} // This section will now stagger in
        className="bg-card/40 backdrop-blur-sm rounded-xl p-6 shadow-sm"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-teal-500">
            <span className="inline-block mr-2">
              <svg className="w-6 h-6 text-blue-500 inline" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
              </svg>
            </span>
            我们认为您会喜欢的类别
          </h2>
          <Link href="/categories" className="text-sm text-primary hover:underline flex items-center">
            全部类别
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-8 lg:grid-cols-10 gap-6"
        >
          {preferredCategories.map((category) => (
            <motion.div key={category.id} variants={fadeIn}>
              <CategoryCard category={category} />
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* 各类别直播列表 */}
      {preferredCategories.map((category, index) => (
        <motion.section 
          key={category.id}
          variants={fadeIn}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          transition={{ delay: index * 0.1 }}
          className="bg-card/40 backdrop-blur-sm rounded-xl p-6 shadow-sm"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">
              <span className="inline-block w-3 h-3 rounded-full mr-2" style={{ 
                backgroundColor: category.id === 'lol' ? '#4A7DFF' : 
                  category.id === 'chatting' ? '#9146FF' : '#FF5555' 
              }}></span>
              {category.name} 直播
            </h2>
            <Link href={`/directory/category/${category.id}`} className="text-sm text-primary hover:underline flex items-center">
              查看更多
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6"
          >
            {(categoryStreams[category.id as keyof typeof categoryStreams] || []).map((stream) => (
              <motion.div key={stream.id} variants={fadeIn}>
                <StreamCard stream={stream} />
              </motion.div>
            ))}
          </motion.div>
        </motion.section>
      ))}

    </motion.div>
  );
}




