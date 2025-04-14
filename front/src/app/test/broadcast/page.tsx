import React from 'react';
import { StreamPlayer } from '@/components/stream/StreamPlayer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function BroadcastTestPage() {
  // 使用固定的测试房间名称，实际应用中可能是用户ID或频道ID
  const roomName = "test-stream";

  return (
    <div className="container mx-auto p-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>主播测试页面</CardTitle>
          <CardDescription>
            您现在是以主播身份，可以开始直播。请允许浏览器使用您的摄像头和麦克风。
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="w-full aspect-video overflow-hidden">
            <StreamPlayer 
              roomName={roomName} 
              isPublisher={true} 
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
