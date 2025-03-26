import Router from 'koa-router';
import { getTags, getPopularTags, getTagById, getTagsByCategory } from '../controllers/tag.controller';

const router = new Router({
  prefix: '/api/tags'
});

// 获取所有标签
router.get('/', getTags);

// 获取热门标签
router.get('/popular', getPopularTags);

// 获取标签详情
router.get('/:tagId', getTagById);

// 根据分类获取标签
router.get('/by-category/:categoryId', getTagsByCategory);

export default router; 
