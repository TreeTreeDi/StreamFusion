import { apiClient } from '../api/apiClient';

export interface StreamQueryParams {
  category?: string;
  tags?: string;
  sort?: 'viewers' | 'newest' | 'trending';
  page?: number;
  limit?: number;
  search?: string;
}

export interface PaginationResult<T> {
  items: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  }
}

export interface Stream {
  _id: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  category: {
    _id: string;
    name: string;
    slug: string;
  };
  user: {
    _id: string;
    username: string;
    displayName: string;
    avatar?: string;
  };
  isLive: boolean;
  viewerCount: number;
  startedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export const streamService = {
  // 获取直播列表(带筛选和分页)
  async getStreams(params?: StreamQueryParams): Promise<PaginationResult<Stream>> {
    const { data } = await apiClient.get('/streams', { params });
    return {
      items: data.data.streams,
      pagination: data.data.pagination
    };
  },

  // 获取热门直播
  async getPopularStreams(params?: StreamQueryParams): Promise<PaginationResult<Stream>> {
    const { data } = await apiClient.get('/streams/popular', { params });
    return {
      items: data.data.streams,
      pagination: data.data.pagination
    };
  },

  // 按分类获取直播
  async getStreamsByCategory(categoryId: string, params?: StreamQueryParams): Promise<PaginationResult<Stream>> {
    const { data } = await apiClient.get(`/streams/by-category/${categoryId}`, { params });
    return {
      items: data.data.streams,
      pagination: data.data.pagination
    };
  },

  // 获取直播详情
  async getStreamById(streamId: string): Promise<Stream> {
    const { data } = await apiClient.get(`/streams/${streamId}`);
    return data.data;
  }
}; 
