import { Context } from 'koa';
import Stream from '../models/Stream';
import Category from '../models/Category';
import { successResponse, errorResponse } from '../utils/apiResponse';

/**
 * 获取热门直播
 * @route GET /api/streams/popular
 */
export const getPopularStreams = async (ctx: Context) => {
  try {
    const limit = ctx.query.limit ? parseInt(ctx.query.limit as string) : 8;
    
    // 获取热门直播，按观看人数降序排序
    const streams = await Stream.find({ isLive: true })
      .sort({ viewerCount: -1 })
      .limit(limit)
      .populate('user', 'username displayName avatar')
      .populate('category', 'name slug');
    
    ctx.body = successResponse(streams, '获取热门直播成功');
  } catch (err) {
    console.error('获取热门直播失败:', err);
    ctx.status = 500;
    ctx.body = errorResponse('获取热门直播失败', 500, err);
  }
};

/**
 * 按分类获取直播
 * @route GET /api/streams/by-category/:categoryId
 */
export const getStreamsByCategory = async (ctx: Context) => {
  try {
    const { categoryId } = ctx.params;
    const limit = ctx.query.limit ? parseInt(ctx.query.limit as string) : 8;
    
    // 验证分类是否存在
    const category = await Category.findById(categoryId);
    
    if (!category) {
      ctx.status = 404;
      ctx.body = errorResponse('分类不存在', 404);
      return;
    }
    
    // 获取该分类下的直播
    const streams = await Stream.find({ 
      category: categoryId,
      isLive: true 
    })
    .sort({ viewerCount: -1 })
    .limit(limit)
    .populate('user', 'username displayName avatar')
    .populate('category', 'name slug');
    
    ctx.body = successResponse(streams, '获取分类直播成功');
  } catch (err) {
    console.error('获取分类直播失败:', err);
    ctx.status = 500;
    ctx.body = errorResponse('获取分类直播失败', 500, err);
  }
};

/**
 * 获取直播详情
 * @route GET /api/streams/:streamId
 */
export const getStreamById = async (ctx: Context) => {
  try {
    const { streamId } = ctx.params;
    
    const stream = await Stream.findById(streamId)
      .populate('user', 'username displayName avatar bio')
      .populate('category', 'name slug');
    
    if (!stream) {
      ctx.status = 404;
      ctx.body = errorResponse('直播不存在', 404);
      return;
    }
    
    ctx.body = successResponse(stream, '获取直播详情成功');
  } catch (err) {
    console.error('获取直播详情失败:', err);
    ctx.status = 500;
    ctx.body = errorResponse('获取直播详情失败', 500, err);
  }
}; 
