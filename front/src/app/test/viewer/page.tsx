import React from 'react';
import { StreamPlayer } from '@/components/stream/StreamPlayer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ViewerTestPage() {
  // 使用与主播页面相同的房间名称
  const roomName = "test-stream";

  return (
    <div className="container mx-auto p-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>观众测试页面</CardTitle>
          <CardDescription>
            您现在是以观众身份，可以观看直播。如果主播未开始直播，您可能看不到内容。
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="w-full aspect-video overflow-hidden">
            <StreamPlayer 
              roomName={roomName} 
              isPublisher={false} 
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
