import Router from 'koa-router';
import * as bannerController from '../controllers/banner.controller';
import { authenticate, isAdminAuthenticated } from '../middleware/auth';

const router = new Router({ prefix: '/api/banners' });

// 公开路由 - 获取轮播图
router.get('/', bannerController.getBanners);
router.get('/:id', bannerController.getBanner);

// 管理员路由 - 创建、更新、删除轮播图
router.post('/', authenticate, isAdminAuthenticated, bannerController.createBanner);
router.put('/:id', authenticate, isAdminAuthenticated, bannerController.updateBanner);
router.delete('/:id', authenticate, isAdminAuthenticated, bannerController.deleteBanner);

export default router; 
