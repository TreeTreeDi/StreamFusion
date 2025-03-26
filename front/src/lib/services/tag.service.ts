import { apiClient } from '../api/apiClient';

export interface TagQueryParams {
  limit?: number;
  popular?: boolean;
}

export const tagService = {
  // 获取所有标签
  async getTags(params?: TagQueryParams) {
    const { data } = await apiClient.get('/tags', { params });
    return data.data;
  },

  // 获取热门标签
  async getPopularTags(limit: number = 10) {
    const { data } = await apiClient.get('/tags/popular', { params: { limit } });
    return data.data;
  },

  // 获取单个标签
  async getTagById(id: string) {
    const { data } = await apiClient.get(`/tags/${id}`);
    return data.data;
  },

  // 根据分类获取标签
  async getTagsByCategory(categoryId: string) {
    const { data } = await apiClient.get(`/tags/by-category/${categoryId}`);
    return data.data;
  }
}; 
