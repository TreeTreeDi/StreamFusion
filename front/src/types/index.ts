export interface User {
  _id: string;
  username: string;
  email: string;
  displayName?: string;
  avatar?: string;
  bio?: string;
  isStreamer: boolean;
  isAdmin: boolean; // 添加 isAdmin 字段
  createdAt: string;
  followers?: string[];
  following?: string[];
  password?: string; // 添加可选的 password 字段以匹配解构
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

export interface CategoriesResponse {
  items: Category[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
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
  user: User; // 假设后端 populate 后总是对象
  title: string;
  description?: string;
  category: Category; // 假设后端 populate 后总是对象
  tags?: string[];
  thumbnailUrl?: string; // 与后端模型一致
  isLive: boolean;
  viewerCount: number;
  startedAt?: string; // Date string
  endedAt?: string;   // Date string
  createdAt: string; // Date string
  updatedAt: string; // Date string
}

// 为管理员获取直播列表定义响应类型
export interface AdminStreamListResponse {
  streams: Stream[];
  pagination: Pagination;
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
