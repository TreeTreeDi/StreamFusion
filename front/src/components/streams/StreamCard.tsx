import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Stream } from "@/types";
import Link from "next/link";
import { UserAvatar } from "../UserAvatar";
import { formatViewerCount } from "@/lib/format";
import Image from "next/image";

import { motion } from "framer-motion";

interface StreamCardProps {
  stream: Stream;
}

export const StreamCard = ({ stream }: StreamCardProps) => {
  const user = typeof stream.user === 'string' 
    ? { username: 'unknown', displayName: 'Unknown', avatar: '' } 
    : stream.user;
  
  const categoryName = typeof stream.category === 'string' 
    ? '' 
    : stream.category?.name;

  return (
    <Link href={`/channel/${user.username}`}>
      <Card className="stream-card overflow-hidden border-none bg-background/60 hover:bg-background/80 transition-all hover:translate-y-[-5px] hover:shadow-md">
        <div className="aspect-video bg-muted relative">
          {stream.thumbnail ? (
            <Image
              src={stream.thumbnail}
              alt={stream.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <p className="text-muted-foreground">预览不可用</p>
            </div>
          )}
          
          {stream.isLive && (
            <div className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded-md flex items-center">
              <div className="w-2 h-2 bg-white rounded-full mr-1"></div>
              直播中
            </div>
          )}
          
          <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-md">
            {formatViewerCount(stream.viewerCount)} 观众
          </div>
        </div>
        <CardHeader className="p-3">
          <div className="flex space-x-2">
            <UserAvatar user={user} />
            <div>
              <CardTitle className="text-base truncate">{stream.title}</CardTitle>
              <CardDescription className="text-xs truncate">{user.displayName}</CardDescription>
              {categoryName && (
                <p className="text-xs text-muted-foreground mt-1 truncate">{categoryName}</p>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>
    </Link>
  );
}; 


// 首页 Stream 类型（兼容 page.tsx mock 和 API 数据）
export interface HomeStream {
  id: string;
  name?: string;
  participantCount?: number;
  title: string;
  streamer: string;
  category: string;
  viewers: number;
  thumbnailUrl: string;
}

interface StreamCardV2Props {
  stream: HomeStream;
}

const cardHover = {
  rest: { scale: 1, boxShadow: "0px 0px 0px rgba(0,0,0,0.1)" },
  hover: { 
    scale: 1.05,
    boxShadow: "0px 10px 20px rgba(0,0,0,0.2), 0 0 15px rgba(147, 51, 234, 0.3)",
    transition: { type: "spring", stiffness: 300, damping: 20 }
  }
};

const imageHover = {
  rest: { y: 0 },
  hover: {
    y: -5,
    transition: { type: "spring", stiffness: 300, damping: 20 }
  }
};

export function StreamCardV2({ stream }: StreamCardV2Props) {
  return (
    <motion.div
      whileHover="hover"
      initial="rest"
      animate="rest"
      variants={cardHover}
    >
      <Link href={`/dashboard?roomName=${encodeURIComponent(stream.name || stream.id)}&role=viewer`} className="group block h-full bg-card rounded-xl overflow-hidden shadow-sm transition-all hover:shadow-lg">
        <div className="space-y-3">
          <motion.div
            className="relative aspect-video overflow-hidden"
            variants={imageHover}
          >
            <Image
              src={stream.thumbnailUrl}
              alt={`${stream.title || stream.name} 直播缩略图`}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
            />
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-semibold px-2 py-0.5 rounded-md flex items-center">
              <span className="w-2 h-2 rounded-full bg-white mr-1 animate-pulse"></span>
              直播
            </div>
            <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md">
              {stream.viewers.toLocaleString()} 名观众
            </div>
          </motion.div>
          <div className="flex items-start space-x-3 p-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex-shrink-0 overflow-hidden relative">
              <div className="absolute inset-0.5 bg-card rounded-full"></div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold truncate text-foreground group-hover:text-primary">{stream.title || stream.name}</h3>
              <p className="text-xs text-muted-foreground truncate">{stream.streamer}</p>
              <p className="text-xs text-muted-foreground truncate flex items-center mt-1">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mr-1"></span>
                {stream.category}
              </p>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
