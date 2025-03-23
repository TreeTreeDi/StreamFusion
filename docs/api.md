# TwitchClone API 文档

## 基础信息

- 基础URL: `http://localhost:5000/api`
- 所有响应格式统一为:
```json
{
  "success": true|false,
  "message": "操作描述",
  "data": {...} | [...],
  "timestamp": 1616161616161
}
```

## 认证接口

### 用户注册

- 请求: `POST /auth/register`
- 描述: 创建新用户
- 请求体:
```json
{
  "username": "用户名",
  "email": "邮箱地址",
  "password": "密码"
}
```
- 成功响应 (200):
```json
{
  "success": true,
  "message": "注册成功",
  "data": {
    "user": {
      "_id": "用户ID",
      "username": "用户名",
      "email": "邮箱地址",
      "avatar": "头像地址",
      "isStreamer": false,
      "createdAt": "创建时间"
    },
    "token": "JWT令牌"
  }
}
```

### 用户登录

- 请求: `POST /auth/login`
- 描述: 用户登录并获取令牌
- 请求体:
```json
{
  "email": "邮箱地址",
  "password": "密码"
}
```
- 成功响应 (200):
```json
{
  "success": true,
  "message": "登录成功",
  "data": {
    "user": {
      "_id": "用户ID",
      "username": "用户名",
      "email": "邮箱地址",
      "avatar": "头像地址",
      "isStreamer": false,
      "createdAt": "创建时间"
    },
    "token": "JWT令牌"
  }
}
```

### 获取当前用户信息

- 请求: `GET /auth/me`
- 描述: 获取当前登录用户信息
- 请求头: 
```
Authorization: Bearer {token}
```
- 成功响应 (200):
```json
{
  "success": true,
  "message": "获取用户信息成功",
  "data": {
    "_id": "用户ID",
    "username": "用户名",
    "email": "邮箱地址",
    "displayName": "显示名称",
    "avatar": "头像地址",
    "bio": "个人简介",
    "isStreamer": false,
    "createdAt": "创建时间"
  }
}
```

## 分类接口

### 获取所有分类

- 请求: `GET /categories`
- 描述: 获取所有内容分类
- 成功响应 (200):
```json
{
  "success": true,
  "message": "获取分类列表成功",
  "data": [
    {
      "_id": "分类ID",
      "name": "分类名称",
      "slug": "分类标识",
      "description": "分类描述",
      "coverImage": "封面图片",
      "viewerCount": 1000,
      "streamCount": 50
    },
    // ...更多分类
  ]
}
```

### 获取热门分类

- 请求: `GET /categories/popular`
- 描述: 获取热门内容分类
- 参数: 
  - `limit`: 返回数量限制 (默认10)
- 成功响应 (200):
```json
{
  "success": true,
  "message": "获取热门分类成功",
  "data": [
    {
      "_id": "分类ID",
      "name": "分类名称",
      "slug": "分类标识",
      "description": "分类描述",
      "coverImage": "封面图片",
      "viewerCount": 5000,
      "streamCount": 100
    },
    // ...更多热门分类
  ]
}
```

### 根据ID获取分类

- 请求: `GET /categories/:id`
- 描述: 获取指定ID的分类详情
- 成功响应 (200):
```json
{
  "success": true,
  "message": "获取分类详情成功",
  "data": {
    "_id": "分类ID",
    "name": "分类名称",
    "slug": "分类标识",
    "description": "分类描述",
    "coverImage": "封面图片",
    "viewerCount": 1000,
    "streamCount": 50
  }
}
```

### 根据slug获取分类

- 请求: `GET /categories/slug/:slug`
- 描述: 根据slug获取分类详情
- 成功响应 (200):
```json
{
  "success": true,
  "message": "获取分类详情成功",
  "data": {
    "_id": "分类ID",
    "name": "分类名称",
    "slug": "分类标识",
    "description": "分类描述",
    "coverImage": "封面图片",
    "viewerCount": 1000,
    "streamCount": 50
  }
}
```

## 频道接口

### 获取推荐频道

- 请求: `GET /recommended-channels`
- 描述: 获取推荐直播频道列表
- 参数:
  - `limit`: 返回数量限制 (默认5)
- 成功响应 (200):
```json
{
  "success": true,
  "message": "获取推荐频道成功",
  "data": [
    {
      "_id": "直播ID",
      "user": {
        "_id": "用户ID",
        "username": "主播用户名",
        "avatar": "主播头像"
      },
      "title": "直播标题",
      "isLive": true,
      "viewerCount": 1200,
      "startedAt": "开始时间"
    },
    // ...更多推荐频道
  ]
}
```
