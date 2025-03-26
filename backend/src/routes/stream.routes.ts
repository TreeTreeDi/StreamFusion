import Router from 'koa-router';
import * as streamController from '../controllers/stream.controller';
import { authenticate, isStreamer } from '../middleware/auth';

const router = new Router({ prefix: '/api/streams' });

// 获取直播列表(带筛选和分页)
router.get('/', streamController.getStreams);

// 获取热门直播
router.get('/popular', streamController.getPopularStreams);

// 按分类获取直播
router.get('/by-category/:categoryId', streamController.getStreamsByCategory);

// 获取直播详情
router.get('/:streamId', streamController.getStreamById);

// 需要认证的路由（后续实现）
// router.post('/', authenticate, isStreamer, streamController.createStream);
// router.put('/:streamId', authenticate, isStreamer, streamController.updateStream);
// router.put('/:streamId/status', authenticate, isStreamer, streamController.updateStreamStatus);

export default router; 
