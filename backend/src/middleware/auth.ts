import { Context, Next } from 'koa';
import jwt from 'jsonwebtoken';
import { errorResponse } from '../utils/apiResponse';

// JWT密钥
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

/**
 * 验证用户是否已认证
 */
export const authenticate = async (ctx: Context, next: Next) => {
  try {
    // 从头部获取token
    const authHeader = ctx.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      ctx.status = 401;
      ctx.body = errorResponse('未授权访问：缺少认证令牌', 401);
      return;
    }
    
    // 提取token
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      ctx.status = 401;
      ctx.body = errorResponse('未授权访问：无效的认证令牌', 401);
      return;
    }
    
    // 验证token
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string; };
      
      // 将用户ID添加到上下文中
      ctx.state.user = {
        id: decoded.id
      };
      
      await next();
    } catch (error) {
      ctx.status = 401;
      ctx.body = errorResponse('未授权访问：认证令牌已过期或无效', 401);
    }
  } catch (error) {
    ctx.status = 500;
    ctx.body = errorResponse('服务器错误', 500, error);
  }
};

/**
 * 验证用户是否为主播
 */
export const isStreamer = async (ctx: Context, next: Next) => {
  try {
    // 验证用户是否已认证
    if (!ctx.state.user) {
      ctx.status = 401;
      ctx.body = errorResponse('未授权访问：用户未认证', 401);
      return;
    }
    
    // 验证用户是否为主播
    // 此处将在实现User模型后完善逻辑
    const isUserStreamer = true; // 临时设置为true
    
    if (!isUserStreamer) {
      ctx.status = 403;
      ctx.body = errorResponse('禁止访问：用户不是主播', 403);
      return;
    }
    
    await next();
  } catch (error) {
    ctx.status = 500;
    ctx.body = errorResponse('服务器错误', 500, error);
  }
};

/**
 * 验证用户是否为管理员
 */
export const isAdmin = async (ctx: Context, next: Next) => {
  try {
    // 验证用户是否已认证
    if (!ctx.state.user) {
      ctx.status = 401;
      ctx.body = errorResponse('未授权访问：用户未认证', 401);
      return;
    }
    
    // 验证用户是否为管理员
    // 此处将在实现User模型后完善逻辑
    const isUserAdmin = false; // 临时设置为false
    
    if (!isUserAdmin) {
      ctx.status = 403;
      ctx.body = errorResponse('禁止访问：用户不是管理员', 403);
      return;
    }
    
    await next();
  } catch (error) {
    ctx.status = 500;
    ctx.body = errorResponse('服务器错误', 500, error);
  }
}; 
