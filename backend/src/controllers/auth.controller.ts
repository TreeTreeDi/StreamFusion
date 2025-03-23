import { Context } from 'koa';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { successResponse, errorResponse } from '../utils/apiResponse';

// JWT密钥
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';

/**
 * 生成JWT令牌
 */
const generateToken = (userId: string): string => {
  // @ts-ignore 忽略类型检查错误，实际运行时没有问题
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRE });
};

/**
 * 注册新用户
 * @route POST /api/auth/register
 */
export const register = async (ctx: Context) => {
  try {
    const { username, email, password, displayName } = ctx.request.body as any;
    
    // 验证必填字段
    if (!username || !email || !password) {
      ctx.status = 400;
      ctx.body = errorResponse('请提供用户名、邮箱和密码', 400);
      return;
    }
    
    // 检查用户名是否已存在
    let user = await User.findOne({ username });
    if (user) {
      ctx.status = 400;
      ctx.body = errorResponse('该用户名已被使用', 400);
      return;
    }
    
    // 检查邮箱是否已存在
    user = await User.findOne({ email });
    if (user) {
      ctx.status = 400;
      ctx.body = errorResponse('该邮箱已被注册', 400);
      return;
    }
    
    // 创建新用户
    user = new User({
      username,
      email,
      password,
      displayName: displayName || username
    });
    
    await user.save();
    
    // 生成JWT令牌
    const token = generateToken(user._id.toString());
    
    ctx.status = 201;
    ctx.body = successResponse({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        avatar: user.avatar,
        isStreamer: user.isStreamer,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt
      }
    }, '注册成功');
    
  } catch (error: any) {
    ctx.status = 500;
    ctx.body = errorResponse('服务器错误', 500, error);
  }
};

/**
 * 用户登录
 * @route POST /api/auth/login
 */
export const login = async (ctx: Context) => {
  try {
    const { username, email, password } = ctx.request.body as any;
    
    // 验证必填字段
    if ((!username && !email) || !password) {
      ctx.status = 400;
      ctx.body = errorResponse('请提供用户名/邮箱和密码', 400);
      return;
    }
    
    // 根据用户名或邮箱查找用户
    const user = await User.findOne({
      $or: [
        { username: username },
        { email: email }
      ]
    });
    
    if (!user) {
      ctx.status = 404;
      ctx.body = errorResponse('用户不存在', 404);
      return;
    }
    
    // 验证密码
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      ctx.status = 401;
      ctx.body = errorResponse('密码错误', 401);
      return;
    }
    
    // 生成JWT令牌
    const token = generateToken(user._id.toString());
    
    ctx.status = 200;
    ctx.body = successResponse({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        avatar: user.avatar,
        isStreamer: user.isStreamer,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt
      }
    }, '登录成功');
    
  } catch (error: any) {
    ctx.status = 500;
    ctx.body = errorResponse('服务器错误', 500, error);
  }
};

/**
 * 获取当前用户信息
 * @route GET /api/auth/me
 */
export const getMe = async (ctx: Context) => {
  try {
    const userId = ctx.state.user?.id;
    
    if (!userId) {
      ctx.status = 401;
      ctx.body = errorResponse('未授权访问', 401);
      return;
    }
    
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      ctx.status = 404;
      ctx.body = errorResponse('用户不存在', 404);
      return;
    }
    
    ctx.status = 200;
    ctx.body = successResponse({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        avatar: user.avatar,
        bio: user.bio,
        isStreamer: user.isStreamer,
        isAdmin: user.isAdmin,
        followersCount: user.followers.length,
        followingCount: user.following.length,
        createdAt: user.createdAt
      }
    }, '获取成功');
    
  } catch (error: any) {
    ctx.status = 500;
    ctx.body = errorResponse('服务器错误', 500, error);
  }
}; 
