import Router from 'koa-router';
import { handleSrsHook } from '../controllers/srs.controller';

const router = new Router({ prefix: '/api/srs' });

// 处理来自 SRS 的所有 webhook 事件
router.post('/hooks', handleSrsHook);

export default router; 
