# 后端模型与API模块

## 用户模型 (User)

用户模型位于 `src/models/User.ts`，管理平台用户数据。

### 数据结构
- **username**: 用户名（唯一）
- **email**: 电子邮箱（唯一）
- **password**: 密码（加密存储）
- **displayName**: 显示名称
- **avatar**: 头像URL
- **bio**: 个人简介
- **isStreamer**: 是否为主播
- **createdAt**: 创建时间

### 相关API
- `POST /api/auth/register`: 用户注册
- `POST /api/auth/login`: 用户登录
- `GET /api/auth/me`: 获取当前用户信息

## 分类模型 (Category)

分类模型位于 `src/models/Category.ts`，管理直播内容分类。

### 数据结构
- **name**: 分类名称
- **slug**: URL友好的标识符（唯一）
- **description**: 分类描述
- **coverImage**: 封面图片URL
- **viewerCount**: 观看人数
- **streamCount**: 直播数量

### 相关API
- `GET /api/categories`: 获取所有分类
- `GET /api/categories/popular`: 获取热门分类
- `GET /api/categories/:id`: 根据ID获取分类
- `GET /api/categories/slug/:slug`: 根据slug获取分类

## 频道API模块

频道API模块位于 `src/controllers/channel.controller.ts`，提供用户直播频道相关功能。

### 相关API
- `GET /api/recommended-channels`: 获取推荐直播频道列表
  - 支持limit参数限制返回数量
  - 返回包含用户信息和直播状态的数据

### 技术特点
- MongoDB与Mongoose ODM集成
- 自动创建索引优化查询性能
- 完整的CRUD操作支持
- 标准化的API响应格式

## 数据初始化
系统提供了数据种子脚本，用于初始化基础分类数据：
```bash
pnpm run seed:categories
```

这将创建基础的内容分类，如游戏、音乐、聊天、户外等，便于系统初始化后立即使用。 
