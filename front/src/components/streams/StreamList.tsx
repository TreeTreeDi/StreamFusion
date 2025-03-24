import { Stream } from "@/types";
import { StreamCard } from "./StreamCard";

interface StreamListProps {
  title: string;
  streams: Stream[];
  showMore?: boolean;
  onShowMoreClick?: () => void;
}

export const StreamList = ({
  title,
  streams,
  showMore = false,
  onShowMoreClick
}: StreamListProps) => {
  if (!streams || streams.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{title}</h2>
        {showMore && (
          <button 
            onClick={onShowMoreClick}
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            查看更多
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {streams.map((stream) => (
          <StreamCard key={stream._id} stream={stream} />
        ))}
      </div>
    </div>
  );
}; 
