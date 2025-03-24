import { Context } from 'koa';
import Stream from '../models/Stream';
import User from '../models/User';
import { successResponse, errorResponse } from '../utils/apiResponse';

/**
 * 获取推荐频道
 * @route GET /api/recommended-channels
 */
export const getRecommendedChannels = async (ctx: Context) => {
  try {
    const limit = ctx.query.limit ? parseInt(ctx.query.limit as string) : 6;
    
    // 获取当前正在直播且有最多观众的流
    const streams = await Stream.find({ isLive: true })
      .sort({ viewerCount: -1 })
      .limit(limit)
      .populate('user', 'username displayName avatar bio')
      .populate('category', 'name slug');
    
    ctx.body = successResponse(streams, '获取推荐频道成功');
  } catch (err) {
    console.error('获取推荐频道失败:', err);
    ctx.status = 500;
    ctx.body = errorResponse('获取推荐频道失败', 500, err);
  }
}; 
