import { Stream } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Trash2, Eye } from 'lucide-react'; // Eye for View Details
import { format } from 'date-fns';

interface StreamTableProps {
  streams: Stream[];
  isLoading: boolean;
  onViewDetails: (stream: Stream) => void;
  onForceClose: (streamId: string) => Promise<void>;
}

export default function StreamTable({ streams, isLoading, onViewDetails, onForceClose }: StreamTableProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'yyyy-MM-dd HH:mm:ss');
    } catch (error) {
      console.error("Error formatting date:", dateString, error);
      return dateString; // fallback to original string if formatting fails
    }
  };

  if (isLoading && streams.length === 0) {
    return <p>正在加载直播数据...</p>;
  }

  if (!isLoading && streams.length === 0) {
    return <p>没有找到直播间。</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>标题</TableHead>
          <TableHead>主播</TableHead>
          <TableHead>分类</TableHead>
          <TableHead>状态</TableHead>
          <TableHead>观众数</TableHead>
          <TableHead>开播时间</TableHead>
          <TableHead>结束时间</TableHead>
          <TableHead className="text-right">操作</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {streams.map((stream) => (
          <TableRow key={stream._id}>
            <TableCell className="font-medium">{stream.title}</TableCell>
            <TableCell>{stream.user?.displayName || stream.user?.username || 'N/A'}</TableCell>
            <TableCell>{stream.category?.name || 'N/A'}</TableCell>
            <TableCell>
              {stream.isLive ? (
                <Badge variant="destructive">直播中</Badge>
              ) : (
                <Badge variant="outline">已结束</Badge>
              )}
            </TableCell>
            <TableCell>{stream.viewerCount}</TableCell>
            <TableCell>{formatDate(stream.startedAt)}</TableCell>
            <TableCell>{formatDate(stream.endedAt)}</TableCell>
            <TableCell className="text-right space-x-2">
              <Button variant="outline" size="sm" onClick={() => onViewDetails(stream)} title="查看详情">
                <Eye className="h-4 w-4" />
              </Button>
              {stream.isLive && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onForceClose(stream._id)}
                  title="强制关闭"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
