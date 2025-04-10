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

/**
 * 获取用户频道信息
 * @route GET /api/users/:userId/channel
 */
export const getUserChannel = async (ctx: Context) => {
  try {
    const { userId } = ctx.params;

    // 查找用户并填充其频道信息（如果有直播的话）
    const user = await User.findById(userId)
      .select('username displayName avatar bio streamKey'); // 选择需要返回的用户字段

    if (!user) {
      ctx.status = 404;
      ctx.body = errorResponse('用户不存在', 404);
      return;
    }

    // 查找该用户的当前直播信息
    const stream = await Stream.findOne({ user: userId, isLive: true })
      .populate('category', 'name slug'); // 填充分类信息

    // 组装频道信息
    const channelData = {
      user: {
        id: user._id,
        username: user.username,
        displayName: user.displayName,
        avatar: user.avatar,
        bio: user.bio,
        // streamKey 只应该返回给用户本人，这里暂时不返回
      },
      stream: stream ? {
        id: stream._id,
        title: stream.title,
        description: stream.description,
        category: stream.category,
        thumbnail: stream.thumbnailUrl,
        viewerCount: stream.viewerCount,
        startedAt: stream.startedAt,
      } : null,
      isLive: !!stream,
    };

    ctx.body = successResponse(channelData, '获取用户频道信息成功');
  } catch (err) {
    console.error('获取用户频道信息失败:', err);
    ctx.status = 500;
    ctx.body = errorResponse('获取用户频道信息失败', 500, err);
  }
}; 
