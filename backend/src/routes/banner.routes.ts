import Router from 'koa-router';
import * as bannerController from '../controllers/banner.controller';
import { authenticate, isAdmin } from '../middleware/auth';

const router = new Router({ prefix: '/api/banners' });

// 公开路由 - 获取轮播图
router.get('/', bannerController.getBanners);
router.get('/:id', bannerController.getBanner);

// 管理员路由 - 创建、更新、删除轮播图
router.post('/', authenticate, isAdmin, bannerController.createBanner);
router.put('/:id', authenticate, isAdmin, bannerController.updateBanner);
router.delete('/:id', authenticate, isAdmin, bannerController.deleteBanner);

export default router; 
