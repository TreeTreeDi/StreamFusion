import { apiClient } from '../api/apiClient';

export interface CategoryQueryParams {
  sort?: string;
  tags?: string;
  category?: string;
  limit?: number;
  page?: number;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

import { CategoriesResponse } from '@/types';

// 移除重复的CategoriesResponse定义，使用types/index.ts中的定义

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  coverImage?: string;
  viewerCount: number;
  streamCount: number;
  tags?: string[];
}

export const categoryService = {
  // 获取所有分类
  async getCategories(params?: CategoryQueryParams): Promise<CategoriesResponse> {
    const { data } = await apiClient.get('/categories', { params });
    return {
      items: data.data.items || data.data,
      pagination: data.data.pagination || {
        total: data.data.length || 0,
        page: params?.page || 1,
        limit: params?.limit || 20,
        pages: Math.ceil((data.data.length || 0) / (params?.limit || 20))
      }
    };
  },

  // 获取热门分类
  async getPopularCategories(params?: CategoryQueryParams): Promise<CategoriesResponse> {
    const { data } = await apiClient.get('/categories/popular', { params });
    
    console.log("getPopularCategories: ", data);
    
    return {
      items: data.data.items || data.data,
      pagination: data.data.pagination || {
        total: data.data.length || 0,
        page: params?.page || 1,
        limit: params?.limit || 10,
        pages: Math.ceil((data.data.length || 0) / (params?.limit || 10))
      }
    };
  },

  // 获取单个分类
  async getCategoryById(id: string) {
    const { data } = await apiClient.get(`/categories/${id}`);
    return data.data;
  },

  // 获取特定slug的分类
  async getCategoryBySlug(slug: string) {
    const { data } = await apiClient.get(`/categories/slug/${slug}`);
    return data.data;
  }
};
