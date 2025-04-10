import Router from 'koa-router';
import * as channelController from '../controllers/channel.controller';

const router = new Router({ prefix: '/api' });

// 获取推荐频道
router.get('/recommended-channels', channelController.getRecommendedChannels);

// 获取用户频道信息
router.get('/users/:userId/channel', channelController.getUserChannel);

export default router; 
