import apiClient from './api/apiClient';

/**
 * LiveKit API 服务封装
 */
export interface LiveKitTokenResponse {
  success: boolean;
  data?: {
    token: string;
    identity: string;
    room: string;
  };
  message?: string;
}

/**
 * 获取 LiveKit 访问令牌
 * 
 * @param roomName 房间名称
 * @param isPublisher 是否为主播
 * @returns 包含令牌、身份和房间信息的响应
 */
export const getLiveKitToken = async (
  roomName: string,
  isPublisher: boolean = false
): Promise<LiveKitTokenResponse> => {
  try {
    // apiClient 会自动从 localStorage 添加认证令牌
    const response = await apiClient.post(
      `/livekit/token`,
      { roomName, isPublisher }
    );

    return response.data;
  } catch (error) {
    console.error('获取 LiveKit 令牌失败:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : '获取直播令牌失败'
    };
  }
}; 
