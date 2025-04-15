'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { WebRTCService } from '@/lib/webrtc';
import { Preview } from './preview';

export default function StartStreamingPage() {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [isLive, setIsLive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const webrtcRef = useRef<WebRTCService | null>(null);

  const handleStreamReady = (mediaStream: MediaStream) => {
    setStream(mediaStream);
  };

  const handleStreamError = (error: Error) => {
    setError(error.message);
  };

  const handleStartStream = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!stream) {
        throw new Error('请先允许访问摄像头和麦克风');
      }

      // 初始化 WebRTC 服务
      webrtcRef.current = new WebRTCService();
      await webrtcRef.current.initialize();
      
      // 开始推流
      await webrtcRef.current.startStreaming(stream, {
        title,
        category
      });
      
      setIsLive(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : '开始直播失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStopStream = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (webrtcRef.current) {
        await webrtcRef.current.stopStreaming();
        webrtcRef.current = null;
      }
      
      setIsLive(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : '停止直播失败');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 预览区域 */}
        <div className="lg:col-span-2">
          <Card className="p-4">
            <div className="aspect-video bg-black rounded-lg mb-4">
              <Preview
                onStreamReady={handleStreamReady}
                onStreamError={handleStreamError}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${isLive ? 'bg-red-500' : 'bg-gray-500'}`} />
                <span className="text-sm text-gray-500">
                  {isLive ? '直播中' : '未开始直播'}
                </span>
              </div>
              {error && (
                <span className="text-sm text-red-500">{error}</span>
              )}
            </div>
          </Card>
        </div>

        {/* 控制面板 */}
        <div className="space-y-6">
          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-4">直播设置</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">直播标题</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="输入直播标题"
                  disabled={isLive}
                />
              </div>
              <div>
                <Label htmlFor="category">直播分类</Label>
                <Select value={category} onValueChange={setCategory} disabled={isLive}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择直播分类" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gaming">游戏</SelectItem>
                    <SelectItem value="music">音乐</SelectItem>
                    <SelectItem value="education">教育</SelectItem>
                    <SelectItem value="entertainment">娱乐</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-4">直播控制</h2>
            <div className="space-y-4">
              <Button
                className="w-full"
                variant={isLive ? "destructive" : "default"}
                onClick={isLive ? handleStopStream : handleStartStream}
                disabled={isLoading || (!isLive && (!title || !category || !stream))}
              >
                {isLoading ? '处理中...' : isLive ? '结束直播' : '开始直播'}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
} 
