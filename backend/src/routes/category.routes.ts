import Router from 'koa-router';
import * as categoryController from '../controllers/category.controller';

const router = new Router({ prefix: '/api/categories' });

// 获取所有分类
router.get('/', categoryController.getAllCategories);

// 获取热门分类
router.get('/popular', categoryController.getPopularCategories);

// 根据ID获取分类
router.get('/:id', categoryController.getCategoryById);

// 根据slug获取分类
router.get('/slug/:slug', categoryController.getCategoryBySlug);

export default router; 
