import { Context } from 'koa';
import User from '../models/User';
import { successResponse, errorResponse } from '../utils/apiResponse';

/**
 * 获取推荐频道列表
 */
export const getRecommendedChannels = async (ctx: Context) => {
  try {
    const limit = ctx.query.limit ? parseInt(ctx.query.limit as string) : 5;
    
    // 获取有直播资格的用户，后期可根据算法进行推荐
    const recommendedUsers = await User.find({ isStreamer: true })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('-password');
    
    // 构造返回数据，模拟直播状态
    const mockStreams = recommendedUsers.map(user => {
      const isLive = Math.random() > 0.5; // 随机生成直播状态，实际项目中应该从Stream模型中查询
      return {
        _id: user._id.toString() + '-stream',
        user: user,
        title: `${user.username}的直播间`,
        isLive,
        viewerCount: isLive ? Math.floor(Math.random() * 10000) : 0,
        startedAt: isLive ? new Date().toISOString() : null,
      };
    });
    
    ctx.body = successResponse(mockStreams, '获取推荐频道成功');
  } catch (err) {
    console.error('获取推荐频道失败:', err);
    ctx.status = 500;
    ctx.body = errorResponse('获取推荐频道失败', 500, err);
  }
}; 
