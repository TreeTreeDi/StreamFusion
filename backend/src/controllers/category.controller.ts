import { Context } from 'koa';
import Category from '../models/Category';
import { successResponse, errorResponse } from '../utils/apiResponse';

/**
 * 获取所有分类
 * @route GET /api/categories
 */
export const getAllCategories = async (ctx: Context) => {
  try {
    const { 
      category, 
      sort = 'name',
      tags,
      page = 1, 
      limit = 12 
    } = ctx.query;
    
    // 解析分页参数
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;
    
    // 构建查询条件
    const query: any = {};
    
    // 如果有分类ID筛选
    if (category) {
      query._id = category;
    }
    
    // 如果有标签筛选
    if (tags) {
      // 假设Category模型中有与Tag的关联，例如通过引用tag ID
      // query.tags = { $in: (tags as string).split(',') };
    }
    
    // 确定排序方式
    let sortOption: any = {};
    if (sort === 'viewers') {
      sortOption = { viewerCount: -1 };
    } else if (sort === 'streams') {
      sortOption = { streamCount: -1 };
    } else if (sort === 'newest') {
      sortOption = { createdAt: -1 };
    } else {
      // 默认按名称排序
      sortOption = { name: 1 };
    }
    
    // 获取总数
    const total = await Category.countDocuments(query);
    
    // 获取分页数据
    const categories = await Category.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum);
      
    // 返回格式化的结果，包含分页信息
    ctx.body = successResponse({
      items: categories,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum)
      }
    }, '获取分类列表成功');
  } catch (err) {
    console.error('获取分类列表失败:', err);
    ctx.status = 500;
    ctx.body = errorResponse('获取分类列表失败', 500, err);
  }
};

/**
 * 获取热门分类
 * @route GET /api/categories/popular
 */
export const getPopularCategories = async (ctx: Context) => {
  try {
    const { 
      tags,
      page = 1, 
      limit = 10 
    } = ctx.query;
    
    // 解析分页参数
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;
    
    // 构建查询条件
    const query: any = {};
    
    // 如果有标签筛选
    if (tags) {
      // 实现标签筛选逻辑
    }
    
    // 获取总数
    const total = await Category.countDocuments(query);
    
    // 获取分页数据，按观看人数排序
    const categories = await Category.find(query)
      .sort({ viewerCount: -1 })
      .skip(skip)
      .limit(limitNum);
    
    // 返回格式化的结果，包含分页信息
    ctx.body = successResponse({
      items: categories,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum)
      }
    }, '获取热门分类成功');
  } catch (err) {
    console.error('获取热门分类失败:', err);
    ctx.status = 500;
    ctx.body = errorResponse('获取热门分类失败', 500, err);
  }
};

/**
 * 根据ID获取分类
 * @route GET /api/categories/:id
 */
export const getCategoryById = async (ctx: Context) => {
  try {
    const { id } = ctx.params;
    
    const category = await Category.findById(id);
    
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
 * @route GET /api/categories/slug/:slug
 */
export const getCategoryBySlug = async (ctx: Context) => {
  try {
    const { slug } = ctx.params;
    
    const category = await Category.findOne({ slug });
    
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
