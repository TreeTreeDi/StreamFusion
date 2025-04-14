'use client';
import React, { useEffect, useState } from 'react';
import {
  LiveKitRoom,
  RoomAudioRenderer,
  ControlBar,
  useTracks,
} from '@livekit/components-react';
import { Track } from 'livekit-client';
import '@livekit/components-styles';
import { getLiveKitToken } from '@/lib/livekit';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';

interface StreamPlayerProps {
  roomName: string; // 直播间名称
  isPublisher?: boolean; // 是否为主播
}

// 添加自定义Alert组件
const Alert = ({ variant, children }: { variant?: string, children: React.ReactNode }) => (
  <div className={`p-4 rounded-md ${variant === 'destructive' ? 'bg-red-50 text-red-800' : 'bg-gray-50 text-gray-800'}`}>
    {children}
  </div>
);

const AlertTitle = ({ children }: { children: React.ReactNode }) => (
  <div className="font-medium mb-1">{children}</div>
);

const AlertDescription = ({ children }: { children: React.ReactNode }) => (
  <div className="text-sm">{children}</div>
);

// 主播视图组件 - 使用原生video元素
const BroadcasterView = () => {
  const tracks = useTracks([
    { source: Track.Source.Camera, withPlaceholder: true },
  ]);
  
  return (
    <div className="w-full h-full bg-black">
      {tracks.map((track) => (
        <div key={track.participant.identity} className="w-full h-full flex items-center justify-center">
          {track.publication?.track && (
            <video
              ref={(el) => {
                if (el && track.publication?.track) {
                  el.srcObject = new MediaStream([track.publication.track.mediaStreamTrack]);
                  el.play().catch(error => console.error('播放视频失败:', error));
                }
              }}
              autoPlay
              muted={true}
              className="w-full h-full object-cover"
            />
          )}
        </div>
      ))}
      {tracks.length === 0 && (
        <div className="flex items-center justify-center h-full text-white">
          摄像头未启动
        </div>
      )}
    </div>
  );
};

// 观众视图组件 - 使用原生video元素
const ViewerView = () => {
  const tracks = useTracks([
    { source: Track.Source.Camera, withPlaceholder: false },
  ], { 
    onlySubscribed: true, // 只显示已订阅的轨道
  });
  
  return (
    <div className="w-full h-full bg-black">
      {tracks.length > 0 ? (
        tracks.map((track) => (
          <div key={track.participant.identity} className="w-full h-full flex items-center justify-center">
            {track.publication?.track && (
              <video
                ref={(el) => {
                  if (el && track.publication?.track) {
                    el.srcObject = new MediaStream([track.publication.track.mediaStreamTrack]);
                    el.play().catch(error => console.error('播放视频失败:', error));
                  }
                }}
                autoPlay
                className="w-full h-full object-cover"
              />
            )}
          </div>
        ))
      ) : (
        <div className="flex items-center justify-center h-full text-white">
          等待主播开始直播...
        </div>
      )}
    </div>
  );
};

export const StreamPlayer: React.FC<StreamPlayerProps> = ({
  roomName,
  isPublisher = false,
}) => {
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // LiveKit 服务器 URL
  const serverUrl = process.env.NEXT_PUBLIC_LIVEKIT_WS_URL || 'wss://your-livekit-server.com';

  useEffect(() => {
    const fetchToken = async () => {
      try {
        setLoading(true);
        const response = await getLiveKitToken(roomName, isPublisher);
        
        if (!response.success || !response.data?.token) {
          setError(response.message || '获取直播令牌失败');
          return;
        }
        
        setToken(response.data.token);
      } catch (err) {
        setError(err instanceof Error ? err.message : '连接直播服务器失败');
      } finally {
        setLoading(false);
      }
    };

    fetchToken();
  }, [roomName, isPublisher]);

  if (loading) {
    return <Skeleton className="w-full aspect-video rounded-md" />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>直播连接错误</AlertTitle>
        <AlertDescription>
          {error}
        </AlertDescription>
      </Alert>
    );
  }

  if (!token) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>无法连接直播</AlertTitle>
        <AlertDescription>
          请确保您已登录并有权限访问此直播
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <LiveKitRoom
      token={token}
      serverUrl={serverUrl}
      connect={true}
      video={isPublisher} // 主播默认开启视频
      audio={isPublisher} // 主播默认开启音频
      className="w-full h-full"
      // 为了优化直播体验
      options={{
        adaptiveStream: true,
        dynacast: true,
        stopLocalTrackOnUnpublish: true,
      }}
    >
      {/* 根据角色显示不同的视图 */}
      {isPublisher ? <BroadcasterView /> : <ViewerView />}
      
      {/* 音频渲染器 */}
      <RoomAudioRenderer />
      
      {/* 控制栏，仅主播显示 */}
      {isPublisher && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-10">
          <ControlBar />
        </div>
      )}
    </LiveKitRoom>
  );
};

export default StreamPlayer;
