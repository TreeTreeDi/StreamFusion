import { Context } from 'koa';
import mongoose from 'mongoose';
import User from '../models/User';
import Stream from '../models/Stream';
import { errorResponse } from '../utils/apiResponse'; // 假设有这个工具函数

/**
 * 处理来自 SRS 的 HTTP Hook 请求
 * @route POST /api/srs/hooks
 */
export const handleSrsHook = async (ctx: Context) => {
  const body = ctx.request.body as any;
  const action = body?.action;
  const streamKey = body?.stream; // SRS 发送的流名通常就是推流密钥
  const clientIp = body?.ip;

  console.log(`[SRS Hook] Received action: ${action}, streamKey: ${streamKey}, ip: ${clientIp}`);

  if (!action || !streamKey) {
    console.error('[SRS Hook] Invalid request: Missing action or streamKey');
    ctx.status = 400;
    ctx.body = 'Invalid Request';
    return;
  }

  try {
    // 根据推流密钥查找用户
    const user = await User.findOne({ streamKey });

    if (!user) {
      console.warn(`[SRS Hook] User not found for streamKey: ${streamKey}`);
      ctx.status = 404; // 返回 404 让 SRS 断开连接
      ctx.body = 'User not found or stream key invalid';
      return;
    }

    // 检查用户是否有直播权限（如果需要）
    if (!user.isStreamer) {
        console.warn(`[SRS Hook] User ${user.username} is not authorized to stream.`);
        ctx.status = 403; // 返回 403 让 SRS 断开连接
        ctx.body = 'User not authorized to stream';
        return;
    }

    switch (action) {
      case 'on_publish':
        console.log(`[SRS Hook] User ${user.username} started publishing stream: ${streamKey}`);
        // 查找或创建该用户的直播记录
        // 注意：如果希望同一直播流中断后再推能继续之前的记录，需要更复杂的逻辑
        // 这里简化为每次 publish 都更新或创建
        await Stream.findOneAndUpdate(
          { user: user._id }, // 假设一个用户只有一个直播流
          {
            isLive: true,
            startedAt: new Date(),
            endedAt: undefined, // 清除结束时间
            // 可以在这里设置默认标题或从其他地方获取（如 OBS 参数，较复杂）
            title: `${user.displayName} 的直播`, 
            category: new mongoose.Types.ObjectId("609d5f1f9c9d6b001f7b0e3e") // 临时分类ID
          },
          { upsert: true, new: true, setDefaultsOnInsert: true } // upsert: 不存在则创建
        );
        ctx.status = 200; // 允许推流
        ctx.body = '0'; // SRS 期望成功时返回 0 或 200
        break;

      case 'on_unpublish':
        console.log(`[SRS Hook] User ${user.username} stopped publishing stream: ${streamKey}`);
        // 更新直播记录状态
        await Stream.findOneAndUpdate(
          { user: user._id, isLive: true }, // 只更新正在直播的记录
          {
            isLive: false,
            endedAt: new Date(),
            viewerCount: 0 // 可选：重置观众计数
          }
        );
        ctx.status = 200;
        ctx.body = '0';
        break;

      // 可以添加处理 on_connect, on_close 等其他事件
      // case 'on_connect':
      //   console.log(`[SRS Hook] Client connected: ${clientIp}`);
      //   ctx.status = 200;
      //   ctx.body = '0'; 
      //   break;
      // case 'on_close':
      //   console.log(`[SRS Hook] Client disconnected: ${clientIp}`);
      //   ctx.status = 200;
      //   ctx.body = '0'; 
      //   break;

      default:
        console.log(`[SRS Hook] Ignoring action: ${action}`);
        ctx.status = 200;
        ctx.body = '0'; // 忽略未知或不处理的 action
    }

  } catch (error: any) {
    console.error('[SRS Hook] Error processing hook:', error);
    // 即使内部出错，也尽量返回 200 给 SRS，避免 SRS 出问题
    // 但可以根据错误类型决定是否返回错误码给 SRS 以中断操作
    ctx.status = 500; // 可以改为 200，取决于是否想让 SRS 重试或忽略错误
    ctx.body = 'Internal Server Error';
  }
}; 
