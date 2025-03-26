export interface User {
  _id: string;
  username: string;
  email: string;
  displayName?: string;
  avatar?: string;
  bio?: string;
  isStreamer: boolean;
  createdAt: string;
  followers?: string[];
  following?: string[];
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  coverImage?: string;
  viewerCount: number;
  streamCount: number;
}

// 添加分页接口类型
export interface Pagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

// 添加流响应类型
export interface StreamsResponse {
  streams: Stream[];
  pagination: Pagination;
}

export interface Stream {
  _id: string;
  user: User | string;
  title: string;
  description?: string;
  category?: Category | string;
  tags?: string[];
  thumbnail?: string;
  isLive: boolean;
  viewerCount: number;
  startedAt?: string;
  endedAt?: string;
}

export interface Banner {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  targetUrl: string;
  isExternal: boolean;
  priority: number;
  isActive: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
} 
