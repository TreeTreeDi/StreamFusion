import { Context } from 'koa';
import Banner from '../models/Banner';

// 获取所有激活的轮播图
export const getBanners = async (ctx: Context) => {
  try {
    const limit = parseInt(ctx.query.limit as string) || 10;
    
    // 只返回激活的轮播图，按优先级降序排列
    const banners = await Banner.find({ isActive: true })
      .sort({ priority: -1 })
      .limit(limit);
    
    ctx.body = {
      success: true,
      data: banners,
      message: '轮播图获取成功',
    };
  } catch (error) {
    console.error('获取轮播图失败:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      error: '获取轮播图失败',
    };
  }
};

// 获取单个轮播图
export const getBanner = async (ctx: Context) => {
  try {
    const { id } = ctx.params;
    const banner = await Banner.findById(id);
    
    if (!banner) {
      ctx.status = 404;
      ctx.body = {
        success: false,
        error: '轮播图不存在',
      };
      return;
    }
    
    ctx.body = {
      success: true,
      data: banner,
      message: '轮播图获取成功',
    };
  } catch (error) {
    console.error('获取轮播图失败:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      error: '获取轮播图失败',
    };
  }
};

// 创建轮播图
export const createBanner = async (ctx: Context) => {
  try {
    const reqBody = ctx.request.body as {
      title?: string;
      description?: string;
      imageUrl?: string;
      targetUrl?: string;
      isExternal?: boolean;
      priority?: number;
      isActive?: boolean;
    };
    
    const {
      title,
      description,
      imageUrl,
      targetUrl,
      isExternal,
      priority,
      isActive,
    } = reqBody;
    
    // 基本验证
    if (!title || !imageUrl || !targetUrl) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        error: '标题、图片URL和目标URL为必填字段',
      };
      return;
    }
    
    const banner = new Banner({
      title,
      description,
      imageUrl,
      targetUrl,
      isExternal: isExternal !== undefined ? isExternal : false,
      priority: priority !== undefined ? priority : 0,
      isActive: isActive !== undefined ? isActive : true,
    });
    
    await banner.save();
    
    ctx.status = 201;
    ctx.body = {
      success: true,
      data: banner,
      message: '轮播图创建成功',
    };
  } catch (error) {
    console.error('创建轮播图失败:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      error: '创建轮播图失败',
    };
  }
};

// 更新轮播图
export const updateBanner = async (ctx: Context) => {
  try {
    const { id } = ctx.params;
    const updateData = ctx.request.body as {
      title?: string;
      description?: string;
      imageUrl?: string;
      targetUrl?: string;
      isExternal?: boolean;
      priority?: number;
      isActive?: boolean;
    };
    
    const banner = await Banner.findByIdAndUpdate(id, updateData, { new: true });
    
    if (!banner) {
      ctx.status = 404;
      ctx.body = {
        success: false,
        error: '轮播图不存在',
      };
      return;
    }
    
    ctx.body = {
      success: true,
      data: banner,
      message: '轮播图更新成功',
    };
  } catch (error) {
    console.error('更新轮播图失败:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      error: '更新轮播图失败',
    };
  }
};

// 删除轮播图
export const deleteBanner = async (ctx: Context) => {
  try {
    const { id } = ctx.params;
    const banner = await Banner.findByIdAndDelete(id);
    
    if (!banner) {
      ctx.status = 404;
      ctx.body = {
        success: false,
        error: '轮播图不存在',
      };
      return;
    }
    
    ctx.body = {
      success: true,
      message: '轮播图删除成功',
    };
  } catch (error) {
    console.error('删除轮播图失败:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      error: '删除轮播图失败',
    };
  }
}; 
