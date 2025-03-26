import { apiClient } from '../api/apiClient';

export interface CategoryQueryParams {
  sort?: string;
  tags?: string;
  category?: string;
  limit?: number;
}

export const categoryService = {
  // 获取所有分类
  async getCategories(params?: CategoryQueryParams) {
    const { data } = await apiClient.get('/categories', { params });
    console.log(data);
    return data.data;
  },

  // 获取热门分类
  async getPopularCategories(params?: CategoryQueryParams) {
    const { data } = await apiClient.get('/categories/popular', { params });
    return data.data;
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
