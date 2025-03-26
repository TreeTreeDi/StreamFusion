import { Context } from 'koa';
import Category from '../models/Category';
import { successResponse, errorResponse } from '../utils/apiResponse';

/**
 * 获取所有分类
 */
export const getAllCategories = async (ctx: Context) => {
  try {
    const { category, sort, tags, limit = 20 } = ctx.query;
    
    // 构建查询条件
    const query: any = {};
    
    // 如果传入了category参数，按ID筛选
    if (category) {
      query._id = category;
    }
    
    // 标签筛选逻辑(如果需要)
    if (tags) {
      // 假设有一个标签关联字段
      // query.tags = { $in: (tags as string).split(',') };
    }
    
    // 确定排序方式
    let sortOption = {};
    if (sort === 'viewers') {
      sortOption = { viewerCount: -1 };
    } else if (sort === 'newest') {
      sortOption = { createdAt: -1 };
    } else {
      // 默认排序
      sortOption = { name: 1 };
    }
    
    // 执行查询
    const categories = await Category.find(query)
      .sort(sortOption)
      .limit(parseInt(limit as string));
    
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
