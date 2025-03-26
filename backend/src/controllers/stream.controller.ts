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
    const page = ctx.query.page ? parseInt(ctx.query.page as string) : 1;
    const skip = (page - 1) * limit;
    
    // 获取热门直播，按观看人数降序排序
    const streams = await Stream.find({ isLive: true })
      .sort({ viewerCount: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'username displayName avatar')
      .populate('category', 'name slug');
    
    // 获取总数以便前端分页
    const total = await Stream.countDocuments({ isLive: true });
    
    ctx.body = successResponse(
      { 
        streams, 
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        } 
      }, 
      '获取热门直播成功'
    );
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
    const page = ctx.query.page ? parseInt(ctx.query.page as string) : 1;
    const skip = (page - 1) * limit;
    
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
    .skip(skip)
    .limit(limit)
    .populate('user', 'username displayName avatar')
    .populate('category', 'name slug');
    
    // 获取总数以便前端分页
    const total = await Stream.countDocuments({ 
      category: categoryId,
      isLive: true 
    });
    
    ctx.body = successResponse(
      { 
        streams, 
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        } 
      }, 
      '获取分类直播成功'
    );
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

/**
 * 获取直播列表(带筛选和分页)
 * @route GET /api/streams
 */
export const getStreams = async (ctx: Context) => {
  try {
    const { 
      category, 
      tags, 
      sort = 'viewers',
      search 
    } = ctx.query;
    
    const limit = ctx.query.limit ? parseInt(ctx.query.limit as string) : 12;
    const page = ctx.query.page ? parseInt(ctx.query.page as string) : 1;
    const skip = (page - 1) * limit;
    
    // 构建查询条件
    const query: any = { isLive: true };
    
    // 分类筛选
    if (category) {
      query.category = category;
    }
    
    // 标签筛选(待实现)
    // TODO: 添加标签筛选逻辑
    
    // 搜索
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // 排序方式
    let sortOption = {};
    switch(sort) {
      case 'newest':
        sortOption = { startedAt: -1 };
        break;
      case 'trending':
        // 实际应用中可能需要更复杂的算法
        sortOption = { viewerCount: -1, startedAt: -1 };
        break;
      case 'viewers':
      default:
        sortOption = { viewerCount: -1 };
    }
    
    // 执行查询
    const streams = await Stream.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .populate('user', 'username displayName avatar')
      .populate('category', 'name slug');
    
    // 获取总数以便前端分页
    const total = await Stream.countDocuments(query);
    
    ctx.body = successResponse(
      { 
        streams, 
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        } 
      }, 
      '获取直播列表成功'
    );
  } catch (err) {
    console.error('获取直播列表失败:', err);
    ctx.status = 500;
    ctx.body = errorResponse('获取直播列表失败', 500, err);
  }
}; 
