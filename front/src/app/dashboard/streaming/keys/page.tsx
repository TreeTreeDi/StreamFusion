'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { authApi } from '@/lib/api'; // 导入 API 函数
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Copy, RefreshCw, PlayCircle } from 'lucide-react'; // 添加 PlayCircle 图标
import { useAuth } from "@/contexts/auth-context"; // 导入 useAuth

// 从环境变量或配置中获取 RTMP URL
const RTMP_URL = process.env.NEXT_PUBLIC_RTMP_URL || 'rtmp://localhost:1935/live'; // 示例

export default function StreamingKeysPage() {
  const { user, isLoading: isAuthLoading, refreshUser } = useAuth(); // 获取用户信息和加载状态
  const [streamKey, setStreamKey] = useState<string | null>(null);
  const [isLoadingKey, setIsLoadingKey] = useState(true);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isEnablingStreaming, setIsEnablingStreaming] = useState(false); // 新增状态
  const [error, setError] = useState<string | null>(null);

  const isStreamer = user?.isStreamer;

  const fetchStreamKey = useCallback(async () => {
    if (!isStreamer) return; // 如果不是主播，不获取密钥
    setIsLoadingKey(true);
    setError(null);
    try {
      const response = await authApi.getStreamKey();
      if (response.success && response.data?.streamKey) {
        setStreamKey(response.data.streamKey);
      } else {
        setError(response.message || '获取推流密钥失败');
        toast.error(response.message || '获取推流密钥失败');
      }
    } catch (err) {
      setError('加载推流密钥时发生错误');
      toast.error('加载推流密钥时发生错误');
      console.error(err);
    } finally {
      setIsLoadingKey(false);
    }
  }, [isStreamer]);

  useEffect(() => {
    // 只有当用户认证加载完成且用户是主播时才获取密钥
    if (!isAuthLoading && isStreamer) {
      fetchStreamKey();
    }
    if (!isAuthLoading && !isStreamer) {
        setIsLoadingKey(false); // 如果不是主播，设置加载完成
    }
  }, [isAuthLoading, isStreamer, fetchStreamKey]);

  const handleRegenerateKey = async () => {
    if (!isStreamer) return;
    setIsRegenerating(true);
    setError(null);
    try {
      const response = await authApi.regenerateStreamKey();
      if (response.success && response.data?.streamKey) {
        setStreamKey(response.data.streamKey);
        toast.success('推流密钥已成功重置！');
      } else {
        setError(response.message || '重置推流密钥失败');
        toast.error(response.message || '重置推流密钥失败');
      }
    } catch (err) {
      setError('重置推流密钥时发生错误');
      toast.error('重置推流密钥时发生错误');
      console.error(err);
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleEnableStreaming = async () => {
    setIsEnablingStreaming(true);
    setError(null);
    try {
      const response = await authApi.enableStreaming(); // 调用实际的 API

      if (response.success) {
        toast.success(response.message || '直播功能已开启！现在您可以获取推流密钥了。');
        await refreshUser(); // 刷新 AuthContext 中的用户信息
        // 用户状态更新后，useEffect 会自动触发 fetchStreamKey (如果 fetchStreamKey 依赖 isStreamer)
      } else {
        setError(response.message || '开启直播功能失败');
        toast.error(response.message || '开启直播功能失败');
      }
    } catch (err) {
      setError('开启直播功能时发生错误');
      toast.error('开启直播功能时发生错误');
      console.error(err);
    } finally {
      setIsEnablingStreaming(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        toast.success('已复制到剪贴板！');
      })
      .catch(err => {
        toast.error('复制失败');
        console.error('复制到剪贴板失败: ', err);
      });
  };

  // AuthContext 还在加载时显示骨架屏
  if (isAuthLoading) {
    return (
      <div className="p-6 max-w-2xl mx-auto space-y-6">
        <Skeleton className="h-8 w-1/4 bg-gray-700" />
        <Skeleton className="h-10 w-full bg-gray-700" />
        <Skeleton className="h-10 w-full bg-gray-700" />
        <Skeleton className="h-40 w-full bg-gray-700" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">直播设置</h1>

      {!isStreamer ? (
        // 用户不是主播时的界面
        <div className="p-6 bg-[#2a2a2d] rounded-md text-center">
          <h2 className="text-xl font-semibold mb-4">开启您的直播之旅</h2>
          <p className="text-gray-400 mb-6">看起来您还没有开启直播功能。点击下方按钮，即可获取您的专属推流密钥并开始直播！</p>
          <Button 
            onClick={handleEnableStreaming}
            disabled={isEnablingStreaming}
            className="bg-[#a970ff] hover:bg-[#9147ff] disabled:opacity-50"
          >
            {isEnablingStreaming ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                正在开启...
              </>
            ) : (
              <>
                <PlayCircle className="mr-2 h-4 w-4" />
                开启直播功能
              </>
            )}
          </Button>
          {error && <p className="text-red-500 mt-4">{error}</p>}
        </div>
      ) : (
        // 用户是主播时的界面
        <>
          {/* RTMP URL */}
          <div className="mb-6">
            <label htmlFor="rtmpUrl" className="block text-sm font-medium text-gray-400 mb-1">推流服务器地址</label>
            <div className="flex items-center gap-x-2">
              <Input 
                id="rtmpUrl"
                value={RTMP_URL}
                readOnly
                className="bg-[#2c2c2f] border-none focus-visible:ring-0 focus-visible:ring-transparent"
              />
              <Button variant="ghost" size="icon" onClick={() => copyToClipboard(RTMP_URL)} aria-label="复制服务器地址">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-1">将此地址粘贴到您的直播软件（如 OBS）的服务器设置中。</p>
          </div>

          {/* Stream Key */}
          <div className="mb-6">
            <label htmlFor="streamKey" className="block text-sm font-medium text-gray-400 mb-1">推流密钥</label>
            {isLoadingKey ? (
              <div className="flex items-center gap-x-2">
                <Skeleton className="h-10 flex-1 bg-gray-700" />
                <Skeleton className="h-10 w-10 bg-gray-700" />
                <Skeleton className="h-10 w-10 bg-gray-700" />
              </div>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : (
              <div className="flex items-center gap-x-2">
                <Input
                  id="streamKey"
                  type="password" // 隐藏密钥内容
                  value={streamKey || ''}
                  readOnly
                  className="bg-[#2c2c2f] border-none focus-visible:ring-0 focus-visible:ring-transparent"
                  placeholder="未能加载密钥"
                />
                <Button variant="ghost" size="icon" onClick={() => streamKey && copyToClipboard(streamKey)} disabled={!streamKey} aria-label="复制推流密钥">
                  <Copy className="h-4 w-4" />
                </Button>
                <Button 
                  variant="secondary" 
                  size="icon" 
                  onClick={handleRegenerateKey} 
                  disabled={isRegenerating}
                  className="bg-[#a970ff] hover:bg-[#9147ff] disabled:opacity-50"
                  aria-label="重置推流密钥"
                >
                  <RefreshCw className={`h-4 w-4 ${isRegenerating ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            )}
            <p className="text-xs text-gray-500 mt-1">将此密钥粘贴到您的直播软件（如 OBS）的串流密钥设置中。 <strong className="text-red-400">请勿分享此密钥！</strong></p>
          </div>

          {/* Instructions */}
          <div className="mt-8 p-4 bg-[#2a2a2d] rounded-md">
            <h2 className="text-lg font-semibold mb-2">如何开始直播 (以 OBS 为例)</h2>
            <ol className="list-decimal list-inside text-sm space-y-1 text-gray-300">
              <li>打开 OBS Studio。</li>
              <li>进入 "文件" &gt; "设置" &gt; "推流"。</li>
              <li>服务选择 "自定义..."。</li>
              <li>将上面的 "推流服务器地址" 粘贴到 "服务器" 字段。</li>
              <li>将上面的 "推流密钥" 粘贴到 "推流密钥" 字段。</li>
              <li>点击 "确定" 保存设置。</li>
              <li>在主界面点击 "开始推流"。</li>
            </ol>
          </div>
        </>
      )}
    </div>
  );
} 


