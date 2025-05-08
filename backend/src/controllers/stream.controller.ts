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
    console.log('[Admin Streams] Received query params:', JSON.stringify(ctx.query, null, 2)); // 添加日志
    const {
      category,
      tags,
      sort = 'viewers',
      search,
      status // 'live', 'ended', 'all'
    } = ctx.query as { category?: string; tags?: string; sort?: string; search?: string; status?: 'live' | 'ended' | 'all'; limit?: string; page?: string };
    
    const limit = ctx.query.limit ? parseInt(ctx.query.limit as string) : 12;
    const page = ctx.query.page ? parseInt(ctx.query.page as string) : 1;
    const skip = (page - 1) * limit;
    
    // 构建查询条件
    const query: any = {};
    
    // 状态筛选
    if (status === 'live') {
      query.isLive = true;
    } else if (status === 'ended') {
      query.isLive = false;
    }
    // 如果 status 是 'all' 或未提供，则不按 isLive 筛选
    
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
    
    console.log(`[Admin Streams] Query object:`, JSON.stringify(query, null, 2)); // 添加日志
    console.log(`[Admin Streams] Found ${streams.length} streams from DB before filtering for admin page.`); // 添加日志
    // 打印部分查询结果，例如ID和isLive状态
    if (streams.length > 0) {
      console.log('[Admin Streams] Sample of fetched streams (first 3):', JSON.stringify(streams.slice(0, 3).map(s => ({ _id: s._id, title: s.title, isLive: s.isLive })), null, 2));
    }

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

/**
 * 管理员强制关闭直播
 * @route PUT /api/streams/:streamId/force-close
 */
export const forceCloseStream = async (ctx: Context) => {
  try {
    const { streamId } = ctx.params;
    const stream = await Stream.findById(streamId);

    if (!stream) {
      ctx.status = 404;
      ctx.body = errorResponse('直播不存在', 404);
      return;
    }

    if (!stream.isLive) {
      ctx.body = successResponse(stream, '直播已结束，无需重复操作');
      return;
    }

    stream.isLive = false;
    stream.endedAt = new Date();
    await stream.save();

    ctx.body = successResponse(stream, '直播已强制关闭');
  } catch (err) {
    console.error('强制关闭直播失败:', err);
    ctx.status = 500;
    ctx.body = errorResponse('强制关闭直播失败', 500, err);
  }
};

/**
 * 用户开始新的直播会话时创建或更新 Stream 记录
 * @route POST /api/streams/session
 */
export const createStreamSession = async (ctx: Context) => {
  console.log(ctx); // 添加日志
  console.log('[Stream Session] ctx.state.user:', JSON.stringify(ctx.state.user, null, 2)); // 添加日志
  try {
    const { title, categoryName, description } = ctx.request.body as { title: string, categoryName: string, description?: string };
    const userId = ctx.state.user?.id; // 从认证中间件获取用户ID (改为 .id)

    if (!userId) {
      ctx.status = 401;
      ctx.body = errorResponse('用户未认证', 401);
      return;
    }

    if (!title || !categoryName) {
      ctx.status = 400;
      ctx.body = errorResponse('缺少直播标题或分类名称', 400);
      return;
    }

    // 1. 根据 categoryName 查找 Category ID，如果不存在则创建
    let category = await Category.findOne({ name: categoryName });
    if (!category) {
      console.log(`[Stream Session] Category "${categoryName}" not found. Creating new category.`);
      const slug = categoryName.toLowerCase().replace(/\s+/g, '-'); // 简单的 slug 生成
      category = new Category({
        name: categoryName,
        slug: slug,
        // description: `自动创建的分类: ${categoryName}`, // 可选
        // coverImage: '默认封面图片URL', // 可选
      });
      await category.save();
      console.log(`[Stream Session] New category "${categoryName}" created with ID: ${category._id}`);
    }

    // 2. (可选) 检查用户是否已有正在进行的直播，如果有，则先结束它
    // 这种逻辑取决于业务需求：是允许用户同时有多个直播，还是只允许一个
    // 这里假设一个用户同时只能有一个活跃直播
    const existingLiveStream = await Stream.findOne({ user: userId, isLive: true });
    if (existingLiveStream) {
      console.log(`[Stream Session] User ${userId} has an existing live stream ${existingLiveStream._id}. Ending it first.`);
      existingLiveStream.isLive = false;
      existingLiveStream.endedAt = new Date();
      await existingLiveStream.save();
    }
    
    // 3. 创建新的 Stream 记录
    const newStream = new Stream({
      user: userId,
      title,
      description: description || '',
      category: category._id,
      isLive: true,
      startedAt: new Date(),
      viewerCount: 0, // 初始观众为0
      // thumbnailUrl: '默认缩略图URL或后续更新'
    });

    await newStream.save();

    // 填充用户信息和分类信息以便返回给前端
    const populatedStream = await Stream.findById(newStream._id)
      .populate('user', 'username displayName avatar')
      .populate('category', 'name slug');

    ctx.status = 201; // 201 Created
    ctx.body = successResponse(populatedStream, '直播会话已成功创建');

  } catch (err: any) {
    console.error('创建直播会话失败:', err);
    if (err.name === 'ValidationError') {
      ctx.status = 400;
      ctx.body = errorResponse('创建直播失败，验证错误', 400, err.errors);
    } else {
      ctx.status = 500;
      ctx.body = errorResponse('创建直播会话失败', 500, err);
    }
  }
};
