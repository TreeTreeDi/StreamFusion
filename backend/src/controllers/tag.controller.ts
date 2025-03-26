import { Context } from 'koa';
import Tag from '../models/Tag';
import Category from '../models/Category';
import { successResponse, errorResponse } from '../utils/apiResponse';

/**
 * 获取所有标签
 * @route GET /api/tags
 */
export const getTags = async (ctx: Context) => {
  try {
    const limit = ctx.query.limit ? parseInt(ctx.query.limit as string) : 20;
    
    // 根据使用次数排序获取所有标签
    const tags = await Tag.find()
      .sort({ useCount: -1 })
      .limit(limit);
    
    ctx.body = successResponse(tags, '获取标签列表成功');
  } catch (err) {
    console.error('获取标签列表失败:', err);
    ctx.status = 500;
    ctx.body = errorResponse('获取标签列表失败', 500, err);
  }
};

/**
 * 获取热门标签
 * @route GET /api/tags/popular
 */
export const getPopularTags = async (ctx: Context) => {
  try {
    const limit = ctx.query.limit ? parseInt(ctx.query.limit as string) : 10;
    
    // 根据使用次数获取热门标签
    const tags = await Tag.find()
      .sort({ useCount: -1 })
      .limit(limit);
    
    ctx.body = successResponse(tags, '获取热门标签成功');
  } catch (err) {
    console.error('获取热门标签失败:', err);
    ctx.status = 500;
    ctx.body = errorResponse('获取热门标签失败', 500, err);
  }
};

/**
 * 根据ID获取标签
 * @route GET /api/tags/:tagId
 */
export const getTagById = async (ctx: Context) => {
  try {
    const { tagId } = ctx.params;
    
    const tag = await Tag.findById(tagId);
    
    if (!tag) {
      ctx.status = 404;
      ctx.body = errorResponse('标签不存在', 404);
      return;
    }
    
    ctx.body = successResponse(tag, '获取标签详情成功');
  } catch (err) {
    console.error('获取标签详情失败:', err);
    ctx.status = 500;
    ctx.body = errorResponse('获取标签详情失败', 500, err);
  }
};

/**
 * 根据分类获取标签
 * @route GET /api/tags/by-category/:categoryId
 */
export const getTagsByCategory = async (ctx: Context) => {
  try {
    const { categoryId } = ctx.params;
    
    // 验证分类是否存在
    const category = await Category.findById(categoryId);
    
    if (!category) {
      ctx.status = 404;
      ctx.body = errorResponse('分类不存在', 404);
      return;
    }
    
    // 获取与该分类关联的标签
    const tags = await Tag.find({ categories: categoryId })
      .sort({ useCount: -1 });
    
    ctx.body = successResponse(tags, '获取分类标签成功');
  } catch (err) {
    console.error('获取分类标签失败:', err);
    ctx.status = 500;
    ctx.body = errorResponse('获取分类标签失败', 500, err);
  }
}; 
