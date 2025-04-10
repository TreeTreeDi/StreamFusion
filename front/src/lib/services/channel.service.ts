import { ApiResponse } from "@/types"; // 导入共享的响应类型

// API 基础 URL (最好从环境变量或共享配置中获取)
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export interface UserChannelInfo {
  id: string;
  username: string;
  displayName: string;
  avatar: string | null;
  bio: string | null;
}

export interface StreamChannelInfo {
  id: string;
  title: string;
  description: string | null;
  category: { 
    _id: string;
    name: string;
    slug: string;
  } | null;
  thumbnailUrl: string | null;
  viewerCount: number;
  startedAt: string | null; // ISO Date string
  tags?: string[]; // 假设 API 返回 tags
}

export interface ChannelInfoResponse {
  user: UserChannelInfo;
  stream: StreamChannelInfo | null;
  isLive: boolean;
}

/**
 * 获取指定用户的频道信息
 * @param channelId 用户ID (即频道ID)
 * @returns Promise<ChannelInfoResponse | null>
 */
export const getChannelInfo = async (channelId: string): Promise<ChannelInfoResponse | null> => {
  try {
    // 注意：后端 API 路径是 /api/users/:userId/channel
    const res = await fetch(`${API_URL}/users/${channelId}/channel`);

    if (!res.ok) {
      // 如果响应状态不是 2xx，可以根据状态码处理
      if (res.status === 404) {
        console.warn(`频道 ${channelId} 未找到 (404)`);
        return null;
      } 
      throw new Error(`API 请求失败: ${res.status} ${res.statusText}`);
    }

    const data: ApiResponse<ChannelInfoResponse> = await res.json();
    
    if (data.success && data.data) { // 检查后端返回的 success 标志和 data
      return data.data;
    }
    
    // 如果后端返回 success: false 或 data 为空
    console.error(`获取频道 ${channelId} 数据失败:`, data.message);
    return null; 

  } catch (error) {
    console.error(`获取频道 ${channelId} 信息时发生网络或解析错误:`, error);
    return null; // 网络错误或 JSON 解析错误，返回 null
  }
}; 
