import Router from 'koa-router';
import { LiveKitController } from '../controllers/livekit.controller';
import { authenticate } from '../middleware/auth';

const router = new Router({ prefix: '/api/livekit' });
const livekitController = new LiveKitController();

// 生成 LiveKit Token 的路由
// 需要认证，确保用户已登录
router.post('/token', authenticate, livekitController.generateToken);

export default router; 
