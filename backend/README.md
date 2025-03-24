# TwitchClone 直播平台 - 后端API

这是一个类似Twitch的直播平台后端API服务，使用Koa.js、TypeScript和MongoDB开发。

## 技术栈

- **框架**: Node.js + Koa.js
- **语言**: TypeScript
- **数据库**: MongoDB + Mongoose ODM
- **认证**: JSON Web Tokens (JWT)
- **部署**: Docker

## 开发环境

确保已安装Node.js、pnpm和MongoDB。

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 启动生产服务器
pnpm start
```

## 项目结构

```
src/
├── config/         # 配置文件
├── controllers/    # 控制器
├── middleware/     # 中间件
├── models/         # 数据库模型
├── routes/         # 路由定义
├── utils/          # 工具函数
├── app.ts          # 应用程序主文件
└── index.ts        # 入口文件
```

## API文档

### 认证API

- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/me` - 获取当前用户信息

### 直播API

- `GET /api/streams` - 获取直播列表
- `GET /api/streams/:streamId` - 获取直播详情
- `POST /api/streams` - 创建直播
- `PUT /api/streams/:streamId` - 更新直播信息
- `PUT /api/streams/:streamId/status` - 更新直播状态

### 用户API

- `GET /api/users/:userId` - 获取用户信息
- `PUT /api/users/me` - 更新用户信息
- `GET /api/users/:userId/channel` - 获取用户频道信息
- `POST /api/users/:userId/follow` - 关注用户
- `DELETE /api/users/:userId/follow` - 取消关注用户

### 分类API

- `GET /api/categories` - 获取分类列表
- `GET /api/categories/:categoryId` - 获取分类详情
- `GET /api/categories/popular` - 获取热门分类

## 轮播图模型 (Banner)

轮播图模型位于 `src/models/Banner.ts`，管理首页轮播图数据。

### 数据结构
- **title**: 轮播图标题
- **description**: 轮播图描述
- **imageUrl**: 图片URL
- **targetUrl**: 目标跳转URL
- **isExternal**: 是否为外部链接
- **priority**: 优先级（用于排序）
- **isActive**: 是否激活
- **createdAt**: 创建时间
- **updatedAt**: 更新时间

### 相关API
- `GET /api/banners`: 获取所有激活的轮播图
- `GET /api/banners/:id`: 根据ID获取轮播图
- `POST /api/banners`: 创建轮播图（管理员权限）
- `PUT /api/banners/:id`: 更新轮播图（管理员权限）
- `DELETE /api/banners/:id`: 删除轮播图（管理员权限）

### 数据初始化
系统提供了轮播图种子脚本，用于初始化基础轮播图数据：
```bash
pnpm run seed:banners
```

## 环境变量

在`.env`文件中配置以下环境变量：

- `PORT` - 服务器端口
- `MONGO_URI` - MongoDB连接字符串
- `JWT_SECRET` - JWT密钥
- `JWT_EXPIRE` - JWT过期时间
- `NODE_ENV` - 运行环境 

## 直播模型 (Stream)

直播模型位于 `src/models/Stream.ts`，管理直播间数据。

### 数据结构
- **title**: 直播标题
- **description**: 直播描述
- **thumbnailUrl**: 缩略图URL
- **category**: 所属分类ID（关联Category模型）
- **user**: 所属用户ID（关联User模型）
- **isLive**: 是否在线直播中
- **viewerCount**: 观看人数
- **startedAt**: 开始直播时间
- **endedAt**: 结束直播时间
- **createdAt**: 创建时间
- **updatedAt**: 更新时间

### 索引优化
- **isLive**: 用于快速查询正在直播的内容
- **category**: 用于按分类查询直播
- **user**: 用于查询特定用户的直播
- **viewerCount**: 用于按观看人数排序（热门直播）
