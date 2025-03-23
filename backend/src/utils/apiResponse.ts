// API响应标准格式
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  status?: number;
  error?: any;
  timestamp?: number;
}

/**
 * 创建成功响应
 * @param data 响应数据
 * @param message 成功消息
 * @returns 标准响应对象
 */
export const successResponse = <T>(data: T, message = '操作成功'): ApiResponse<T> => {
  return {
    success: true,
    message,
    data,
    timestamp: Date.now(),
  };
};

/**
 * 创建错误响应
 * @param message 错误消息
 * @param status HTTP状态码
 * @param error 错误详情
 * @returns 标准响应对象
 */
export const errorResponse = (message = '操作失败', status = 400, error?: any): ApiResponse => {
  return {
    success: false,
    message,
    status,
    error,
    timestamp: Date.now(),
  };
};

/**
 * 创建分页响应
 * @param data 数据列表
 * @param total 总记录数
 * @param page 当前页码
 * @param limit 每页记录数
 * @param message 成功消息
 * @returns 分页响应对象
 */
export const paginatedResponse = <T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
  message = '获取成功'
): ApiResponse<{
  items: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}> => {
  const totalPages = Math.ceil(total / limit);
  
  return {
    success: true,
    message,
    data: {
      items: data,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    },
    timestamp: Date.now(),
  };
};
