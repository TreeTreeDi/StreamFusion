import Router from 'koa-router';
import * as channelController from '../controllers/channel.controller';

const router = new Router({ prefix: '/api' });

// 获取推荐频道
router.get('/recommended-channels', channelController.getRecommendedChannels);

export default router; 
