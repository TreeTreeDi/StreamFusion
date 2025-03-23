# 后端认证系统

## 功能概述

后端认证系统实现了基于JWT(JSON Web Token)的用户身份验证机制，包括：

1. 用户注册
2. 用户登录
3. 获取当前登录用户信息
4. 中间件验证用户身份

## 技术栈

- Node.js + Koa.js
- MongoDB + Mongoose
- JWT (jsonwebtoken)
- bcryptjs (密码加密)

## 数据模型

### 用户模型 (User)

```typescript
const UserSchema = new mongoose.Schema<IUser>({
  username: { 
    type: String, 
    required: [true, '用户名是必填的'],
    unique: true,
    // 其他验证...
  },
  email: { 
    type: String, 
    required: [true, '邮箱是必填的'], 
    unique: true,
    // 其他验证...
  },
  password: { 
    type: String, 
    required: [true, '密码是必填的'],
    // 其他验证...
  },
  displayName: { type: String, default: function(this: any) { return this.username; } },
  avatar: { type: String, default: 'https://via.placeholder.com/150' },
  bio: { type: String, maxlength: [200, '个人简介最多200个字符'] },
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isStreamer: { type: Boolean, default: false },
  streamKey: { type: String, unique: true, sparse: true },
  isAdmin: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});
```

## API接口

### 1. 用户注册

- **接口**: `POST /api/auth/register`
- **描述**: 注册新用户
- **参数**:
  - `username`: 用户名 (必填)
  - `email`: 邮箱 (必填)
  - `password`: 密码 (必填)
  - `displayName`: 显示名称 (选填)
- **返回**:
  - 成功: 状态码201，返回用户信息和JWT令牌
  - 失败: 状态码400，返回错误信息

### 2. 用户登录

- **接口**: `POST /api/auth/login`
- **描述**: 用户登录
- **参数**:
  - `username`或`email`: 用户名或邮箱 (必填其一)
  - `password`: 密码 (必填)
- **返回**:
  - 成功: 状态码200，返回用户信息和JWT令牌
  - 失败: 状态码401或404，返回错误信息

### 3. 获取当前用户信息

- **接口**: `GET /api/auth/me`
- **描述**: 获取当前登录用户信息
- **认证**: 需要JWT令牌
- **返回**:
  - 成功: 状态码200，返回用户信息
  - 失败: 状态码401或404，返回错误信息

## 中间件

### 认证中间件

提供了三个中间件函数：

1. `authenticate`: 验证用户是否已登录
2. `isStreamer`: 验证用户是否为主播
3. `isAdmin`: 验证用户是否为管理员

## 前端对接指南

### 注册用户

```javascript
const registerUser = async (userData) => {
  const response = await fetch('http://localhost:5000/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });
  const data = await response.json();
  return data;
};
```

### 用户登录

```javascript
const loginUser = async (credentials) => {
  const response = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });
  const data = await response.json();
  return data;
};
```

### 获取用户信息

```javascript
const getUserProfile = async (token) => {
  const response = await fetch('http://localhost:5000/api/auth/me', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  const data = await response.json();
  return data;
};
``` 
