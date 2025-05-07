import apiClient from './api/apiClient'; // 假设 apiClient 已配置好基础URL和错误处理
import { User } from '@/types'; // 修改为 User

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
};

export default adminApi;
