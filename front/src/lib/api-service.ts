import { Category, Stream, ApiResponse, StreamsResponse, CategoriesResponse } from "@/types";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const axiosInstance = axios.create({
  baseURL: API_URL,
});

// Helper to get token, assuming it's stored in localStorage
const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token');
  }
  return null;
};

export const fetchCategories = async (): Promise<Category[]> => {
  try {
    const response = await fetch(`${API_URL}/categories`);
    const data: ApiResponse<Category[]> = await response.json();
    console.log('API Response:', data); // 添加这行来查看返回数据

    if (!data.success || !data.data) {
      console.error("获取分类失败:", data.error);
      return [];
    }
    
    return data.data;
  } catch (error) {
    console.error("获取分类时出错:", error);
    return [];
  }
};

export const fetchPopularCategories = async (limit: number = 6): Promise<CategoriesResponse> => {
  try {
    const response = await fetch(`${API_URL}/categories/popular?limit=${limit}`);
    const data: ApiResponse<CategoriesResponse> = await response.json();
    
    if (!data.success || !data.data) {
      console.error("获取热门分类失败:", data.error);
      return { items: [], pagination: { total: 0, page: 1, limit, pages: 1 } };
    }
    
    return data.data;
  } catch (error) {
    console.error("获取热门分类时出错:", error);
    return { items: [], pagination: { total: 0, page: 1, limit, pages: 1 } };
  }
};

export const fetchRecommendedChannels = async (limit: number = 6): Promise<Stream[]> => {
  try {
    const response = await axiosInstance.get(`/recommended-channels?limit=${limit}`);
    const data: ApiResponse<Stream[]> = response.data;

    if (!data.success || !data.data) {
      console.error("获取推荐频道失败:", data.error);
      return [];
    }

    return data.data;
  } catch (error) {
    console.error("获取推荐频道时出错:", error);
    return [];
  }
};

export const fetchStreamsByCategory = async (categoryId: string, limit: number = 8): Promise<Stream[]> => {
  try {
    const response = await fetch(`${API_URL}/streams/by-category/${categoryId}?limit=${limit}`);
    const data: ApiResponse<Stream[]> = await response.json();
    
    if (!data.success || !data.data) {
      console.error("获取分类直播失败:", data.error);
      return [];
    }
    
    return data.data;
  } catch (error) {
    console.error("获取分类直播时出错:", error);
    return [];
  }
};

export const fetchBanners = async () => {
  try {
    const response = await axiosInstance.get('/banners');
    return response.data;
  } catch (error) {
    console.error('Error fetching banners:', error);
    throw error;
  }
};

export const fetchPopularStreams = async (limit: number = 8): Promise<StreamsResponse> => {
  try {
    const response = await axiosInstance.get(`/streams/popular?limit=${limit}`);
    const data = response.data;

    if (!data.success || !data.data) {
      console.error("获取热门直播失败:", data.error);
      return { streams: [], pagination: { total: 0, page: 1, limit: 8, pages: 1 } };
    }

    return data.data;
  } catch (error) {
    console.error("获取热门直播时出错:", error);
    return { streams: [], pagination: { total: 0, page: 1, limit: 8, pages: 1 } };
  }
};

interface CreateStreamSessionPayload {
  title: string;
  categoryName: string;
  description?: string;
}

export const createStreamSession = async (payload: CreateStreamSessionPayload): Promise<Stream> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error('用户未认证，无法创建直播会话');
  }

  try {
    const response = await axiosInstance.post('/streams/session', payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data: ApiResponse<Stream> = response.data;

    if (!data.success || !data.data) {
      console.error("创建直播会话失败:", data.message || data.error);
      throw new Error(data.message || data.error || '创建直播会话失败');
    }
    return data.data;
  } catch (error: any) {
    console.error("创建直播会话时出错:", error.response?.data || error.message || error);
    // Rethrow a more specific error or a generic one
    throw new Error(error.response?.data?.message || error.message || '创建直播会话时发生网络或服务器错误');
  }
};
