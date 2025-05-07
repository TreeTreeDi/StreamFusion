import { Context, Next } from 'koa';
import jwt from 'jsonwebtoken';
import User from '../models/User'; // 导入User模型
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
      // 注意：这里只存储了id，如果后续中间件需要更多用户信息，可能需要调整
      // 或者依赖像 isAdminAuthenticated 这样的中间件来填充完整的用户信息
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
 * 验证用户是否为管理员并已认证
 * 此中间件处理认证和管理员授权
 */
export const isAdminAuthenticated = async (ctx: Context, next: Next) => {
  try {
    const authHeader = ctx.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      ctx.status = 401;
      ctx.body = errorResponse('未授权访问：缺少认证令牌', 401);
      return;
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      ctx.status = 401;
      ctx.body = errorResponse('未授权访问：无效的认证令牌', 401);
      return;
    }

    let decoded: { id: string };
    try {
      decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    } catch (error) {
      ctx.status = 401;
      ctx.body = errorResponse('未授权访问：认证令牌已过期或无效', 401);
      return;
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      ctx.status = 401;
      ctx.body = errorResponse('未授权访问：用户不存在', 401);
      return;
    }

    if (!user.isAdmin) {
      ctx.status = 403;
      ctx.body = errorResponse('禁止访问：用户不是管理员', 403);
      return;
    }

    // 将完整的用户信息添加到上下文中
    ctx.state.user = user; 
    await next();

  } catch (error: any) {
    // 捕获更广泛的错误，例如数据库查询失败等
    console.error('isAdminAuthenticated error:', error);
    ctx.status = 500;
    ctx.body = errorResponse('服务器认证错误', 500, error.message);
  }
};

/**
 * 验证用户是否为主播
 */
export const isStreamer = async (ctx: Context, next: Next) => {
  try {
    // 首先确保用户已通过基础认证并填充了 ctx.state.user.id
    // 或者，如果 isStreamer 总是和 isAdminAuthenticated 一样需要完整用户对象，
    // 那么它也应该从数据库获取用户。
    // 为简化，假设 authenticate 中间件已运行或此中间件将自行处理用户获取。
    
    // 假设 ctx.state.user 至少包含 id (由 authenticate 设置)
    // 或者，如果此中间件独立使用，需要先进行token验证和用户ID提取
    if (!ctx.state.user || !ctx.state.user.id) {
       // 如果 ctx.state.user.id 不存在，可能需要先进行token验证
       // 或者依赖于 authenticate 中间件已正确填充
      ctx.status = 401;
      ctx.body = errorResponse('未授权访问：用户未认证（isStreamer前置检查）', 401);
      return;
    }
    
    // 为了检查 isStreamer 属性，我们需要完整的用户对象
    // 如果 ctx.state.user 还不是完整的用户对象，需要从数据库获取
    let userToCheck = ctx.state.user;
    if (!userToCheck.isStreamer) { // 检查属性是否存在，如果不存在则可能不是完整对象
        const dbUser = await User.findById(ctx.state.user.id);
        if (!dbUser) {
            ctx.status = 404;
            ctx.body = errorResponse('用户不存在 (isStreamer检查)', 404);
            return;
        }
        userToCheck = dbUser;
    }
    
    if (!userToCheck.isStreamer) {
      ctx.status = 403;
      ctx.body = errorResponse('禁止访问：用户不是主播', 403);
      return;
    }
    
    // 如果需要，确保完整的用户对象在 ctx.state.user 中
    ctx.state.user = userToCheck;
    await next();
  } catch (error: any) {
    console.error('isStreamer error:', error);
    ctx.status = 500;
    ctx.body = errorResponse('服务器错误 (isStreamer)', 500, error.message);
  }
};

