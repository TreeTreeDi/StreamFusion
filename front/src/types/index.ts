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
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
} 
