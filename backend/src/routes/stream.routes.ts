import Router from 'koa-router';
import * as streamController from '../controllers/stream.controller';
import { authenticate, isStreamer, isAdminAuthenticated } from '../middleware/auth';

const router = new Router({ prefix: '/api/streams' });

// 获取直播列表(带筛选和分页)
router.get('/', streamController.getStreams);

// 获取热门直播
router.get('/popular', streamController.getPopularStreams);

// 按分类获取直播
router.get('/by-category/:categoryId', streamController.getStreamsByCategory);

// 获取直播详情
router.get('/:streamId', streamController.getStreamById);

// 用户创建新的直播会话记录
router.post(
  '/session',
  authenticate, // 需要用户认证
  streamController.createStreamSession
);

// 需要认证的路由（后续实现）
// router.post('/', authenticate, isStreamer, streamController.createStream); // 这个可以考虑替换或移除，如果 /session 满足需求
// router.put('/:streamId', authenticate, isStreamer, streamController.updateStream);
// router.put('/:streamId/status', authenticate, isStreamer, streamController.updateStreamStatus);

// 管理员强制关闭直播
router.put(
  '/:streamId/force-close',
  authenticate,
  isAdminAuthenticated,
  streamController.forceCloseStream
);

export default router;
