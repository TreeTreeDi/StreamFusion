import { Stream } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';

interface StreamDetailsModalProps {
  stream: Stream | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function StreamDetailsModal({ stream, isOpen, onClose }: StreamDetailsModalProps) {
  if (!stream) {
    return null;
  }

  const formatDate = (dateString?: string, includeTime: boolean = true) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), includeTime ? 'yyyy-MM-dd HH:mm:ss' : 'yyyy-MM-dd');
    } catch (error) {
      console.error("Error formatting date:", dateString, error);
      return dateString;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>直播间详情: {stream.title}</DialogTitle>
          <DialogDescription>
            查看直播间的详细信息。
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-3 items-center gap-4">
            <span className="text-sm font-medium text-gray-500">ID:</span>
            <span className="col-span-2 text-sm">{stream._id}</span>
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <span className="text-sm font-medium text-gray-500">标题:</span>
            <span className="col-span-2 text-sm">{stream.title}</span>
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <span className="text-sm font-medium text-gray-500">描述:</span>
            <span className="col-span-2 text-sm whitespace-pre-wrap">{stream.description || '无'}</span>
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <span className="text-sm font-medium text-gray-500">主播:</span>
            <span className="col-span-2 text-sm">{stream.user?.displayName || stream.user?.username || 'N/A'}</span>
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <span className="text-sm font-medium text-gray-500">分类:</span>
            <span className="col-span-2 text-sm">{stream.category?.name || 'N/A'}</span>
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <span className="text-sm font-medium text-gray-500">状态:</span>
            <span className="col-span-2 text-sm">
              {stream.isLive ? (
                <Badge variant="destructive">直播中</Badge>
              ) : (
                <Badge variant="outline">已结束</Badge>
              )}
            </span>
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <span className="text-sm font-medium text-gray-500">观众数:</span>
            <span className="col-span-2 text-sm">{stream.viewerCount}</span>
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <span className="text-sm font-medium text-gray-500">开播时间:</span>
            <span className="col-span-2 text-sm">{formatDate(stream.startedAt)}</span>
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <span className="text-sm font-medium text-gray-500">结束时间:</span>
            <span className="col-span-2 text-sm">{formatDate(stream.endedAt)}</span>
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <span className="text-sm font-medium text-gray-500">创建时间:</span>
            <span className="col-span-2 text-sm">{formatDate(stream.createdAt)}</span>
          </div>
           <div className="grid grid-cols-3 items-center gap-4">
            <span className="text-sm font-medium text-gray-500">最后更新:</span>
            <span className="col-span-2 text-sm">{formatDate(stream.updatedAt)}</span>
          </div>
          {stream.thumbnailUrl && (
            <div className="grid grid-cols-3 items-start gap-4">
              <span className="text-sm font-medium text-gray-500 pt-1">缩略图:</span>
              <div className="col-span-2">
                <img src={stream.thumbnailUrl} alt="Thumbnail" className="max-w-xs max-h-40 rounded border" />
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={onClose}>关闭</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
