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

## 环境变量

在`.env`文件中配置以下环境变量：

- `PORT` - 服务器端口
- `MONGO_URI` - MongoDB连接字符串
- `JWT_SECRET` - JWT密钥
- `JWT_EXPIRE` - JWT过期时间
- `NODE_ENV` - 运行环境 
