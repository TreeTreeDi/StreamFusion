import axios from 'axios';

// API基础URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// 创建axios实例
export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器-添加认证令牌
apiClient.interceptors.request.use((config) => {
  // 在SSR环境中不尝试访问localStorage
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// 响应拦截器-统一处理错误
apiClient.interceptors.response.use(
  response => response,
  error => {
    // 全局错误处理
    if (error.response) {
      // 服务器返回错误状态码
      const status = error.response.status;
      
      // 处理401未授权错误
      if (status === 401) {
        // 清除本地存储的token
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient; 
