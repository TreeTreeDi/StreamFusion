'use client';

import React, { useEffect, useState, useRef } from 'react';
import { userApi, ChannelData } from '@/lib/api';
import { useParams } from 'next/navigation'; // 用于获取路由参数
import { Skeleton } from "@/components/ui/skeleton";
import Hls from 'hls.js'; // 导入 hls.js

// ！！重要提示：生产环境中不应直接暴露 SRS 的 8080 端口，并且播放 URL 的生成应通过后端代理或 SRS token 验证等安全方式实现。
const SRS_HTTP_URL = process.env.NEXT_PUBLIC_SRS_HTTP_URL || 'http://localhost:8080'; // 假设 SRS HTTP 端口是 8080

export default function ChannelPage() {
  const params = useParams();
  const username = params?.username as string; // 从路由获取用户名
  const videoRef = useRef<HTMLVideoElement>(null); // 创建 video 元素的 ref
  const hlsRef = useRef<Hls | null>(null); // 存储 Hls 实例

  const [channelData, setChannelData] = useState<ChannelData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!username) return;

    const fetchChannelData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await userApi.getChannelByUsername(username);
        if (response.success && response.data) {
          setChannelData(response.data);
        } else {
          setError(response.message || '无法加载频道信息');
          // 可以根据 status code 进一步处理，例如 404 显示用户不存在
        }
      } catch (err) {
        setError('加载频道信息时出错');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChannelData();
  }, [username]);

  // HLS 播放器初始化和销毁逻辑
  useEffect(() => {
    if (!videoRef.current || !channelData || !channelData.isLive) {
      // 如果 video 元素不存在，或频道数据未加载，或主播未开播，则不初始化
      return;
    }

    // 确保 HLS 支持当前浏览器
    if (Hls.isSupported()) {
      // 销毁旧的 Hls 实例 (如果存在)
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
      
      const hls = new Hls();
      hlsRef.current = hls;

      // !!! 临时方案：直接用用户名构建播放 URL，实际应由后端提供或通过安全方式获取
      const playbackUrl = `${SRS_HTTP_URL}/live/${username}.m3u8`;
      console.log("尝试加载播放源:", playbackUrl); 

      hls.loadSource(playbackUrl);
      hls.attachMedia(videoRef.current);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log('HLS manifest 加载完成，尝试播放');
        videoRef.current?.play().catch(e => console.error("自动播放失败:", e));
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.error('HLS 网络错误:', data);
              // 可以尝试重新连接
              // hls.startLoad();
              setError('无法连接到直播流 (网络错误)');
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.error('HLS 媒体错误:', data);
              // 可能是视频解码问题
              // hls.recoverMediaError();
              setError('直播流媒体内容错误');
              break;
            default:
              console.error('HLS 未知错误:', data);
              // 销毁实例
              hls.destroy();
              hlsRef.current = null;
              setError('加载直播流时发生未知错误');
              break;
          }
        }
      });

    } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
      // 对于原生支持 HLS 的浏览器 (如 Safari)
      // !!! 同样需要安全的播放 URL
      const playbackUrl = `${SRS_HTTP_URL}/live/${username}.m3u8`; 
      videoRef.current.src = playbackUrl;
      videoRef.current.addEventListener('loadedmetadata', () => {
        videoRef.current?.play().catch(e => console.error("自动播放失败:", e));
      });
    }

    // 组件卸载时销毁 HLS 实例
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [channelData, username]); // 依赖 channelData 和 username

  // --- 渲染逻辑 ---
  if (isLoading) {
    return (
      <div className="p-4">
        <Skeleton className="w-full aspect-video mb-4" />
        <Skeleton className="h-8 w-1/2 mb-2" />
        <Skeleton className="h-4 w-1/4" />
      </div>
    );
  }

  if (error && !channelData?.isLive) { // 仅当错误且非直播时显示错误信息，否则尝试显示播放器
    return <div className="p-4 text-center text-red-500">{error || '无法加载频道信息'}</div>;
  }
  
  if (!channelData) { // 如果没有频道数据（例如用户不存在）
      return <div className="p-4 text-center text-gray-400">{error || '无法找到该频道'}</div>
  }

  // --- 主体内容渲染 ---
  return (
    <div className="p-4">
      {/* 视频播放器区域 */}
      <div className="w-full aspect-video bg-black mb-4 relative">
        <video
          ref={videoRef}
          controls // 显示浏览器默认控制条
          className="w-full h-full"
          autoPlay // 尝试自动播放 (可能被浏览器阻止)
          muted // 自动播放通常需要静音
        />
        {!channelData.isLive && (
           <div className="absolute inset-0 flex items-center justify-center bg-black/80">
             <p className="text-white text-xl font-semibold">主播当前未开播</p>
           </div>
        )}
         {error && channelData.isLive && ( // 如果正在直播但加载出错
            <div className="absolute inset-0 flex items-center justify-center bg-black/80">
             <p className="text-red-500 text-lg">加载直播失败: {error}</p>
           </div>
         )}
      </div>
      
      {/* 主播信息 */}
      <div>
        <h1 className="text-2xl font-bold">{channelData.user.displayName}</h1>
        <p className="text-sm text-muted-foreground">@{channelData.user.username}</p>
        {channelData.stream && (
          <p className="mt-2">正在直播: {channelData.stream.title}</p>
        )}
      </div>
      {/* TODO: 添加聊天区域等 */}
    </div>
  );
} 
