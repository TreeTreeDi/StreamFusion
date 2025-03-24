import Router from 'koa-router';
import * as streamController from '../controllers/stream.controller';
import { authenticate, isStreamer } from '../middleware/auth';

const router = new Router({ prefix: '/api/streams' });

// 公开路由
router.get('/popular', streamController.getPopularStreams);
router.get('/by-category/:categoryId', streamController.getStreamsByCategory);
router.get('/:streamId', streamController.getStreamById);

// 需要认证的路由（后续实现）
// router.post('/', authenticate, isStreamer, streamController.createStream);
// router.put('/:streamId', authenticate, isStreamer, streamController.updateStream);
// router.put('/:streamId/status', authenticate, isStreamer, streamController.updateStreamStatus);

export default router; 
