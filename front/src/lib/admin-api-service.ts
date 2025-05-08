import apiClient from './api/apiClient'; // 假设 apiClient 已配置好基础URL和错误处理
import { User, Stream, AdminStreamListResponse } from '@/types';

export interface UserListResponse {
  users: User[];
  currentPage: number;
  totalPages: number;
  totalUsers: number;
}

export interface UserQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  isStreamer?: boolean;
  isAdmin?: boolean;
}

export interface ListStreamsParams {
  page?: number;
  limit?: number;
  status?: 'live' | 'ended' | 'all';
  search?: string;
  // 根据需要添加其他筛选参数，例如 userId, categoryId
}

const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token');
  }
  return null;
};

const adminApi = {
  listUsers: async (params: UserQueryParams = {}): Promise<UserListResponse> => {
    const token = getAuthToken();
    const response = await apiClient.get('/admin/users', {
      params,
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.data; // 假设响应结构是 { success: true, data: {...}, message: '' }
  },

  getUserById: async (userId: string): Promise<User> => {
    const token = getAuthToken();
    const response = await apiClient.get(`/admin/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.data;
  },

  createUser: async (userData: Partial<User & { password?: string }>): Promise<User> => {
    const token = getAuthToken();
    const response = await apiClient.post('/admin/users', userData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.data;
  },

  updateUser: async (userId: string, userData: Partial<User>): Promise<User> => {
    const token = getAuthToken();
    // 确保不发送密码、用户名和邮箱
    const { password, username, email, ...updatableData } = userData;
    const response = await apiClient.put(`/admin/users/${userId}`, updatableData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.data;
  },

  deleteUser: async (userId: string): Promise<void> => {
    const token = getAuthToken();
    await apiClient.delete(`/admin/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    // 删除操作通常返回 200 OK (带可选消息体) 或 204 No Content
  },

  // Stream Management
  listStreams: async (params: ListStreamsParams = {}): Promise<AdminStreamListResponse> => {
    const token = getAuthToken();
    // 注意：这里的路径 '/streams' 假设 apiClient 的 baseURL 已经配置为指向 /api
    // 如果 apiClient 的 baseURL 是空的或者直接指向域名，那么路径需要是 '/api/streams'
    const response = await apiClient.get('/streams', {
      params,
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.data; // 假设响应结构与用户列表类似 { success: true, data: { streams: [], pagination: {} } }
  },

  getStreamDetails: async (streamId: string): Promise<Stream> => {
    const token = getAuthToken();
    const response = await apiClient.get(`/streams/${streamId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.data; // 假设响应结构是 { success: true, data: Stream }
  },

  forceCloseStream: async (streamId: string): Promise<Stream> => { // 通常会返回更新后的资源
    const token = getAuthToken();
    const response = await apiClient.put(`/streams/${streamId}/force-close`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.data; // 假设响应结构是 { success: true, data: Stream }
  },
};

export default adminApi;
