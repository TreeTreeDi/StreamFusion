import { Category, Stream, ApiResponse } from "@/types";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const axiosInstance = axios.create({
  baseURL: API_URL,
});

export const fetchCategories = async (): Promise<Category[]> => {
  try {
    const response = await fetch(`${API_URL}/categories`);
    const data: ApiResponse<Category[]> = await response.json();
    
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

export const fetchPopularCategories = async (limit: number = 6): Promise<Category[]> => {
  try {
    const response = await fetch(`${API_URL}/categories/popular?limit=${limit}`);
    const data: ApiResponse<Category[]> = await response.json();
    
    if (!data.success || !data.data) {
      console.error("获取热门分类失败:", data.error);
      return [];
    }
    
    return data.data;
  } catch (error) {
    console.error("获取热门分类时出错:", error);
    return [];
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
