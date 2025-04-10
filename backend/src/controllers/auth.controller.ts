import { Context } from 'koa';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { successResponse, errorResponse } from '../utils/apiResponse';
import { generateStreamKey } from '../lib/utils'; // 导入密钥生成函数

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
    if (error.code === 11000) { // 处理唯一键冲突
        ctx.status = 400;
        ctx.body = errorResponse('用户名或邮箱已被使用', 400);
    } else if (error.name === 'ValidationError') { // 处理 Mongoose 验证错误
        ctx.status = 400;
        const messages = Object.values(error.errors).map((val: any) => val.message);
        ctx.body = errorResponse(messages.join(', '), 400);
    } else {
        ctx.body = errorResponse('服务器错误', 500, error);
    }
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

/**
 * 获取当前用户的推流密钥
 * @route GET /api/auth/stream-key
 */
export const getStreamKey = async (ctx: Context) => {
  try {
    const userId = ctx.state.user?.id;

    if (!userId) {
      ctx.status = 401;
      ctx.body = errorResponse('未授权访问', 401);
      return;
    }

    const user = await User.findById(userId);

    if (!user) {
      ctx.status = 404;
      ctx.body = errorResponse('用户不存在', 404);
      return;
    }

    // 可以在这里添加检查用户是否为 streamer 的逻辑
    // if (!user.isStreamer) {
    //   ctx.status = 403;
    //   ctx.body = errorResponse('用户无直播权限', 403);
    //   return;
    // }

    // 如果没有密钥，则生成一个
    if (!user.streamKey) {
      user.streamKey = generateStreamKey();
      user.streamKeyGeneratedAt = new Date();
      await user.save();
    }

    ctx.status = 200;
    ctx.body = successResponse({ streamKey: user.streamKey }, '获取推流密钥成功');

  } catch (error: any) {
    ctx.status = 500;
    ctx.body = errorResponse('服务器错误', 500, error);
  }
};

/**
 * 重置当前用户的推流密钥
 * @route POST /api/auth/stream-key/regenerate
 */
export const regenerateStreamKey = async (ctx: Context) => {
  try {
    const userId = ctx.state.user?.id;

    if (!userId) {
      ctx.status = 401;
      ctx.body = errorResponse('未授权访问', 401);
      return;
    }

    const user = await User.findById(userId);

    if (!user) {
      ctx.status = 404;
      ctx.body = errorResponse('用户不存在', 404);
      return;
    }

    // 可以在这里添加检查用户是否为 streamer 的逻辑
    // if (!user.isStreamer) {
    //   ctx.status = 403;
    //   ctx.body = errorResponse('用户无直播权限', 403);
    //   return;
    // }

    user.streamKey = generateStreamKey();
    user.streamKeyGeneratedAt = new Date();
    await user.save();

    ctx.status = 200;
    ctx.body = successResponse({ streamKey: user.streamKey }, '推流密钥已重置');

  } catch (error: any) {
    ctx.status = 500;
    ctx.body = errorResponse('服务器错误', 500, error);
  }
};

/**
 * 为当前用户开启直播功能
 * @route POST /api/auth/enable-streaming
 */
export const enableStreaming = async (ctx: Context) => {
  try {
    const userId = ctx.state.user?.id;

    if (!userId) {
      ctx.status = 401;
      ctx.body = errorResponse('未授权访问', 401);
      return;
    }

    const user = await User.findById(userId);

    if (!user) {
      ctx.status = 404;
      ctx.body = errorResponse('用户不存在', 404);
      return;
    }

    // 如果已经是主播，则无需操作
    if (user.isStreamer) {
      ctx.status = 200;
      ctx.body = successResponse(null, '直播功能已经开启');
      return;
    }

    // 更新用户状态
    user.isStreamer = true;
    await user.save();

    ctx.status = 200;
    // 返回更新后的用户信息（可选，但有助于前端确认）
    ctx.body = successResponse({
        id: user._id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        avatar: user.avatar,
        isStreamer: user.isStreamer,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt
     }, '直播功能已成功开启');

  } catch (error: any) {
    ctx.status = 500;
    ctx.body = errorResponse('开启直播功能时发生服务器错误', 500, error);
  }
}; 
