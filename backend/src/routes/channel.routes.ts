import Router from 'koa-router';
import * as channelController from '../controllers/channel.controller';

const router = new Router({ prefix: '/api' });

// 获取推荐频道
router.get('/recommended-channels', channelController.getRecommendedChannels);

// 获取用户频道信息 (按 User ID)
router.get('/users/:userId/channel', channelController.getUserChannel);

// 获取用户频道信息 (按 Username)
router.get('/users/username/:username/channel', channelController.getChannelByUsername);

export default router; 
