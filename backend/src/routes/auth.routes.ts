import Router from 'koa-router';
import { register, login, getMe, getStreamKey, regenerateStreamKey, enableStreaming } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';

const router = new Router({ prefix: '/api/auth' });

// 注册新用户
router.post('/register', register);

// 用户登录
router.post('/login', login);

// 获取当前用户信息
router.get('/me', authenticate, getMe);

// 获取推流密钥
router.get('/stream-key', authenticate, getStreamKey);

// 重置推流密钥
router.post('/stream-key/regenerate', authenticate, regenerateStreamKey);

// 开启直播功能
router.post('/enable-streaming', authenticate, enableStreaming);

export default router; 
