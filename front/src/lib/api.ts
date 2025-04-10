import axios from 'axios';

// API基础URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// 创建axios实例
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器-添加认证令牌
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 用户接口定义
export interface IUser {
  id: string;
  username: string;
  email: string;
  displayName: string;
  avatar?: string;
  bio?: string;
  isStreamer: boolean;
  isAdmin: boolean;
  followersCount?: number;
  followingCount?: number;
  createdAt: string;
}

// 认证响应接口
export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    token: string;
    user: IUser;
  };
  status?: number;
  error?: any;
  timestamp?: number;
}

// 注册请求参数
export interface RegisterParams {
  username: string;
  email: string;
  password: string;
  displayName?: string;
}

// 登录请求参数
export interface LoginParams {
  username?: string;
  email?: string;
  password: string;
}

// 推流密钥响应接口
export interface StreamKeyResponse {
  success: boolean;
  message: string;
  data?: {
    streamKey: string;
  };
  status?: number;
  error?: any;
  timestamp?: number;
}

// 开启直播响应接口（复用AuthResponse，因为返回用户信息）
// export interface EnableStreamingResponse extends AuthResponse {}

// 认证相关API
export const authApi = {
  // 用户注册
  register: async (params: RegisterParams): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>('/auth/register', params);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as AuthResponse;
      }
      return {
        success: false,
        message: '注册请求失败',
        error: error,
      };
    }
  },

  // 用户登录
  login: async (params: LoginParams): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>('/auth/login', params);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as AuthResponse;
      }
      return {
        success: false,
        message: '登录请求失败',
        error: error,
      };
    }
  },

  // 获取当前用户信息
  getCurrentUser: async (): Promise<AuthResponse> => {
    try {
      const response = await api.get<AuthResponse>('/auth/me');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as AuthResponse;
      }
      return {
        success: false,
        message: '获取用户信息失败',
        error: error,
      };
    }
  },
  
  // 获取推流密钥
  getStreamKey: async (): Promise<StreamKeyResponse> => {
    try {
      const response = await api.get<StreamKeyResponse>('/auth/stream-key');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as StreamKeyResponse;
      }
      return {
        success: false,
        message: '获取推流密钥失败',
        error: error,
      };
    }
  },

  // 重置推流密钥
  regenerateStreamKey: async (): Promise<StreamKeyResponse> => {
    try {
      const response = await api.post<StreamKeyResponse>('/auth/stream-key/regenerate');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as StreamKeyResponse;
      }
      return {
        success: false,
        message: '重置推流密钥失败',
        error: error,
      };
    }
  },

  // 开启直播功能
  enableStreaming: async (): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>('/auth/enable-streaming');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as AuthResponse;
      }
      return {
        success: false,
        message: '开启直播功能请求失败',
        error: error,
      };
    }
  },
};

export default api; 
