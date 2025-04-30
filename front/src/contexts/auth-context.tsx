"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, IUser, LoginParams, RegisterParams } from '@/lib/api';

interface AuthContextType {
  user: IUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (params: LoginParams) => Promise<{ success: boolean; message: string }>;
  register: (params: RegisterParams) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // 检查是否已登录
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          const response = await authApi.getCurrentUser();
          if (response.success && response.data?.user) {
            setUser(response.data.user);
            setIsAuthenticated(true);
          } else {
            // 令牌无效，清除存储
            localStorage.removeItem('auth_token');
          }
        } catch (error) {
          console.error('认证检查失败:', error);
          localStorage.removeItem('auth_token');
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  // 用户登录
  const login = async (params: LoginParams) => {
    setIsLoading(true);
    try {
      const response = await authApi.login(params);
      if (response.success && response.data) {
        const { token, user } = response.data;
        // 保存令牌到本地存储
        localStorage.setItem('auth_token', token);
        // 更新状态
        setUser(user);
        setIsAuthenticated(true);
        setIsLoading(false);
        return { success: true, message: '登录成功' };
      } else {
        setIsLoading(false);
        return { success: false, message: response.message || '登录失败' };
      }
    } catch (error) {
      setIsLoading(false);
      console.error('登录失败:', error);
      return { success: false, message: '登录请求异常' };
    }
  };

  // 用户注册
  const register = async (params: RegisterParams) => {
    setIsLoading(true);
    try {
      const response = await authApi.register(params);
      if (response.success && response.data) {
        const { token, user } = response.data;
        // 保存令牌到本地存储
        localStorage.setItem('auth_token', token);
        // 更新状态
        setUser(user);
        setIsAuthenticated(true);
        setIsLoading(false);
        return { success: true, message: '注册成功' };
      } else {
        setIsLoading(false);
        return { success: false, message: response.message || '注册失败' };
      }
    } catch (error) {
      setIsLoading(false);
      console.error('注册失败:', error);
      return { success: false, message: '注册请求异常' };
    }
  };

  // 用户登出
  const logout = () => {
    // 清除令牌
    localStorage.removeItem('auth_token');
    // 重置状态
    setUser(null);
    setIsAuthenticated(false);

  };

  // 刷新用户信息
  const refreshUser = async () => {
    if (isAuthenticated) {
      try {
        const response = await authApi.getCurrentUser();
        if (response.success && response.data?.user) {
          setUser(response.data.user);
        }
      } catch (error) {
        console.error('刷新用户信息失败:', error);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth必须在AuthProvider内部使用');
  }
  return context;
}; 
