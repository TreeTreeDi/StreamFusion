import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Stream } from "@/types";
import Link from "next/link";
import { UserAvatar } from "../UserAvatar";
import { formatViewerCount } from "@/lib/format";
import Image from "next/image";

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
          {stream.thumbnailUrl ? (
            <Image
              src={stream.thumbnailUrl}
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
