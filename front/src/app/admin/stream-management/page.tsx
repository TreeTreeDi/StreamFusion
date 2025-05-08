"use client";

import { useEffect, useState, useCallback } from 'react';
import adminApi, { ListStreamsParams } from '@/lib/admin-api-service';
import { Stream, AdminStreamListResponse } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination as UIPagination } from "@/components/ui/pagination"; // Renamed to avoid conflict
import { PlusCircle, Search } from 'lucide-react'; // Assuming PlusCircle might be used later, Search for search button

import StreamTable from './components/StreamTable';
import StreamDetailsModal from './components/StreamDetailsModal';

export default function StreamManagementPage() {
  const [streamListResponse, setStreamListResponse] = useState<AdminStreamListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [queryParams, setQueryParams] = useState<ListStreamsParams>({ page: 1, limit: 10, status: 'all' });
  const [searchTerm, setSearchTerm] = useState('');

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedStream, setSelectedStream] = useState<Stream | null>(null);

  const fetchStreams = useCallback(async (params: ListStreamsParams) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await adminApi.listStreams(params);
      setStreamListResponse(data);
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || '获取直播列表失败';
      setError(message);
      console.error("Fetch streams error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStreams(queryParams);
  }, [queryParams, fetchStreams]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setQueryParams(prev => ({ ...prev, page: 1, search: searchTerm || undefined }));
  };

  const handleStatusChange = (status: 'all' | 'live' | 'ended') => {
    setQueryParams(prev => ({ ...prev, page: 1, status: status }));
  };

  const handlePageChange = (newPage: number) => {
    setQueryParams(prev => ({ ...prev, page: newPage }));
  };

  const openDetailsModal = (stream: Stream) => {
    setSelectedStream(stream);
    setIsDetailsModalOpen(true);
  };

  const closeDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedStream(null);
  };

  const handleForceCloseStream = async (streamId: string) => {
    if (window.confirm('确定要强制关闭该直播吗？此操作会将直播状态设为已结束。')) {
      try {
        await adminApi.forceCloseStream(streamId);
        alert('直播已成功强制关闭！');
        fetchStreams(queryParams); // Refresh the list
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.message || '强制关闭直播失败';
        setError(errorMessage);
        alert(`强制关闭直播失败: ${errorMessage}`);
      }
    }
  };

  if (isLoading && !streamListResponse) {
    return <div className="p-4">正在加载直播数据...</div>;
  }

  // Error display should be prominent
  if (error && !streamListResponse) { // Only show full page error if no data at all
    return <div className="p-4 text-red-500">错误: {error}</div>;
  }
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">直播间管理</h1>

      {error && <p className="text-red-500 mb-4">发生错误: {error}</p>}

      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full md:w-auto">
          <Input
            type="text"
            placeholder="搜索直播 (标题, 主播用户名)"
            value={searchTerm}
            onChange={handleSearchChange}
            className="max-w-xs flex-grow"
          />
          <Button type="submit"><Search className="h-4 w-4 mr-2" />搜索</Button>
        </form>
        <div className="flex gap-2 items-center w-full md:w-auto">
          <span className="text-sm text-gray-600">状态:</span>
          <Select
            value={queryParams.status}
            onValueChange={(value: 'all' | 'live' | 'ended') => handleStatusChange(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="选择状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部</SelectItem>
              <SelectItem value="live">直播中</SelectItem>
              <SelectItem value="ended">已结束</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {isLoading && <p className="mb-4">正在刷新列表...</p>}

      {streamListResponse && streamListResponse.streams.length > 0 ? (
        <>
          <StreamTable
            streams={streamListResponse.streams}
            isLoading={isLoading}
            onViewDetails={openDetailsModal}
            onForceClose={handleForceCloseStream}
          />
          {streamListResponse.pagination.pages > 1 && (
            <div className="mt-6 flex justify-center">
              <UIPagination
                currentPage={streamListResponse.pagination.page}
                totalPages={streamListResponse.pagination.pages} // Changed from totalPages to pages
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      ) : (
        !isLoading && <p>未找到符合条件的直播间。</p>
      )}

      {selectedStream && (
        <StreamDetailsModal
          stream={selectedStream}
          isOpen={isDetailsModalOpen}
          onClose={closeDetailsModal}
        />
      )}
    </div>
  );
}
