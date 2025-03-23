import { Context } from 'koa';
import Category from '../models/Category';
import { successResponse, errorResponse } from '../utils/apiResponse';

/**
 * 获取所有分类
 */
export const getAllCategories = async (ctx: Context) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    ctx.body = successResponse(categories, '获取分类列表成功');
  } catch (err) {
    console.error('获取分类列表失败:', err);
    ctx.status = 500;
    ctx.body = errorResponse('获取分类列表失败', 500, err);
  }
};

/**
 * 获取热门分类
 */
export const getPopularCategories = async (ctx: Context) => {
  try {
    const limit = ctx.query.limit ? parseInt(ctx.query.limit as string) : 10;
    
    const categories = await Category.find()
      .sort({ viewerCount: -1 })
      .limit(limit);
    
    ctx.body = successResponse(categories, '获取热门分类成功');
  } catch (err) {
    console.error('获取热门分类失败:', err);
    ctx.status = 500;
    ctx.body = errorResponse('获取热门分类失败', 500, err);
  }
};

/**
 * 根据ID获取分类
 */
export const getCategoryById = async (ctx: Context) => {
  try {
    const category = await Category.findById(ctx.params.id);
    
    if (!category) {
      ctx.status = 404;
      ctx.body = errorResponse('分类不存在', 404);
      return;
    }
    
    ctx.body = successResponse(category, '获取分类详情成功');
  } catch (err) {
    console.error('获取分类详情失败:', err);
    ctx.status = 500;
    ctx.body = errorResponse('获取分类详情失败', 500, err);
  }
};

/**
 * 根据slug获取分类
 */
export const getCategoryBySlug = async (ctx: Context) => {
  try {
    const category = await Category.findOne({ slug: ctx.params.slug });
    
    if (!category) {
      ctx.status = 404;
      ctx.body = errorResponse('分类不存在', 404);
      return;
    }
    
    ctx.body = successResponse(category, '获取分类详情成功');
  } catch (err) {
    console.error('获取分类详情失败:', err);
    ctx.status = 500;
    ctx.body = errorResponse('获取分类详情失败', 500, err);
  }
}; 
