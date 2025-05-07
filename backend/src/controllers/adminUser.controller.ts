import { Context } from 'koa';
import User, { IUser } from '../models/User';
import { successResponse, errorResponse } from '../utils/apiResponse';

const DEFAULT_PAGE_SIZE = 10;

/**
 * 列出所有用户 (管理员)
 * 支持分页、按用户名/邮箱搜索、按isStreamer/isAdmin筛选
 * @route GET /api/admin/users
 */
export const listUsers = async (ctx: Context) => {
  try {
    const page = parseInt(ctx.query.page as string) || 1;
    const limit = parseInt(ctx.query.limit as string) || DEFAULT_PAGE_SIZE;
    const searchQuery = ctx.query.search as string;
    const isStreamerQuery = ctx.query.isStreamer as string;
    const isAdminQuery = ctx.query.isAdmin as string;

    const query: any = {};

    if (searchQuery) {
      query.$or = [
        { username: { $regex: searchQuery, $options: 'i' } },
        { email: { $regex: searchQuery, $options: 'i' } },
        { displayName: { $regex: searchQuery, $options: 'i' } }
      ];
    }

    if (isStreamerQuery) {
      query.isStreamer = isStreamerQuery === 'true';
    }

    if (isAdminQuery) {
      query.isAdmin = isAdminQuery === 'true';
    }

    const users = await User.find(query)
      .select('-password') // 不返回密码字段
      .limit(limit)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 }); // 按创建时间降序

    const totalUsers = await User.countDocuments(query);

    ctx.status = 200;
    ctx.body = successResponse({
      users,
      currentPage: page,
      totalPages: Math.ceil(totalUsers / limit),
      totalUsers,
    }, '用户列表获取成功');

  } catch (error: any) {
    console.error('Error listing users:', error);
    ctx.status = 500;
    ctx.body = errorResponse('获取用户列表失败', 500, error.message);
  }
};

/**
 * 获取单个用户详情 (管理员)
 * @route GET /api/admin/users/:userId
 */
export const getUserById = async (ctx: Context) => {
  try {
    const { userId } = ctx.params;
    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      ctx.status = 400;
      ctx.body = errorResponse('无效的用户ID格式', 400);
      return;
    }

    const user = await User.findById(userId).select('-password');

    if (!user) {
      ctx.status = 404;
      ctx.body = errorResponse('用户未找到', 404);
      return;
    }

    ctx.status = 200;
    ctx.body = successResponse(user, '获取用户详情成功');

  } catch (error: any) {
    console.error(`Error getting user by ID ${ctx.params.userId}:`, error);
    ctx.status = 500;
    ctx.body = errorResponse('获取用户详情失败', 500, error.message);
  }
};

/**
 * 创建新用户 (管理员)
 * @route POST /api/admin/users
 */
export const createUser = async (ctx: Context) => {
  try {
    const {
      username,
      email,
      password,
      displayName,
      avatar,
      bio,
      isStreamer,
      isAdmin,
    } = ctx.request.body as Partial<IUser & { password?: string }>; // 添加 password 到类型

    // 基本验证
    if (!username || !email || !password) {
      ctx.status = 400;
      ctx.body = errorResponse('用户名、邮箱和密码是必填项', 400);
      return;
    }

    // 检查用户名或邮箱是否已存在
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      ctx.status = 409; // Conflict
      ctx.body = errorResponse('用户名或邮箱已被使用', 409);
      return;
    }

    const newUser = new User({
      username,
      email,
      password, // 密码将在 pre-save 钩子中哈希
      displayName: displayName || username,
      avatar,
      bio,
      isStreamer: typeof isStreamer === 'boolean' ? isStreamer : false,
      isAdmin: typeof isAdmin === 'boolean' ? isAdmin : false,
    });

    await newUser.save();

    // 从保存后的用户对象中移除密码，再发送响应
    const { password: _, ...userResponse } = newUser.toObject();

    ctx.status = 201;
    ctx.body = successResponse(userResponse, '用户创建成功');

  } catch (error: any) {
    console.error('Error creating user:', error);
    if (error.name === 'ValidationError') {
      ctx.status = 400;
      const messages = Object.values(error.errors).map((val: any) => val.message);
      ctx.body = errorResponse(`创建用户验证失败: ${messages.join(', ')}`, 400);
    } else {
      ctx.status = 500;
      ctx.body = errorResponse('创建用户失败', 500, error.message);
    }
  }
};

/**
 * 更新用户信息 (管理员)
 * @route PUT /api/admin/users/:userId
 */
export const updateUser = async (ctx: Context) => {
  try {
    const { userId } = ctx.params;
    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      ctx.status = 400;
      ctx.body = errorResponse('无效的用户ID格式', 400);
      return;
    }

    const updates = ctx.request.body as Partial<IUser>;

    // 不允许通过此接口更新密码
    if (updates.password) {
      delete updates.password;
    }
    // 也不允许直接修改用户名或邮箱，以避免唯一性冲突问题，除非有特殊处理逻辑
    if (updates.username) {
        delete updates.username;
    }
    if (updates.email) {
        delete updates.email;
    }


    // 确保布尔值被正确处理
    if (updates.hasOwnProperty('isStreamer') && typeof updates.isStreamer !== 'boolean') {
        updates.isStreamer = (updates.isStreamer as any) === 'true';
    }
    if (updates.hasOwnProperty('isAdmin') && typeof updates.isAdmin !== 'boolean') {
        updates.isAdmin = (updates.isAdmin as any) === 'true';
    }


    const updatedUser = await User.findByIdAndUpdate(userId, updates, {
      new: true, // 返回更新后的文档
      runValidators: true, // 运行 Mongoose 验证
    }).select('-password');

    if (!updatedUser) {
      ctx.status = 404;
      ctx.body = errorResponse('用户未找到，无法更新', 404);
      return;
    }

    ctx.status = 200;
    ctx.body = successResponse(updatedUser, '用户信息更新成功');

  } catch (error: any) {
    console.error(`Error updating user ${ctx.params.userId}:`, error);
    if (error.name === 'ValidationError') {
      ctx.status = 400;
      const messages = Object.values(error.errors).map((val: any) => val.message);
      ctx.body = errorResponse(`更新用户验证失败: ${messages.join(', ')}`, 400);
    } else {
      ctx.status = 500;
      ctx.body = errorResponse('更新用户信息失败', 500, error.message);
    }
  }
};

/**
 * 删除用户 (管理员)
 * @route DELETE /api/admin/users/:userId
 */
export const deleteUser = async (ctx: Context) => {
  try {
    const { userId } = ctx.params;
    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      ctx.status = 400;
      ctx.body = errorResponse('无效的用户ID格式', 400);
      return;
    }

    // 防止管理员删除自己
    const currentAdminUser = ctx.state.user as IUser; // 假设isAdminAuthenticated中间件已填充
    if (currentAdminUser && currentAdminUser._id.toString() === userId) {
        ctx.status = 403;
        ctx.body = errorResponse('禁止删除自己的账户', 403);
        return;
    }

    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      ctx.status = 404;
      ctx.body = errorResponse('用户未找到，无法删除', 404);
      return;
    }

    ctx.status = 200;
    // 或者返回 ctx.status = 204; ctx.body = null; 表示无内容但成功
    ctx.body = successResponse(null, '用户删除成功');

  } catch (error: any) {
    console.error(`Error deleting user ${ctx.params.userId}:`, error);
    ctx.status = 500;
    ctx.body = errorResponse('删除用户失败', 500, error.message);
  }
};
