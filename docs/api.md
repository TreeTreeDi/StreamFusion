# API接口文档

## 基础信息

- 基础URL: `/api`
- 所有API响应格式统一如下:
  ```json
  {
    "success": true/false,
    "message": "响应消息",
    "data": {} // 响应数据，成功时返回
    "error": {} // 错误详情，失败时返回
  }
  ```

## 认证相关接口

### 用户注册

**接口地址**: `POST /api/auth/register`

**请求参数**:

| 参数名      | 类型   | 必填 | 描述                 |
|-------------|--------|------|---------------------|
| username    | string | 是   | 用户名 (唯一)        |
| email       | string | 是   | 邮箱地址 (唯一)      |
| password    | string | 是   | 密码                 |
| displayName | string | 否   | 显示名称，默认同用户名 |

**请求示例**:
```json
{
  "username": "example_user",
  "email": "user@example.com",
  "password": "securePassword123",
  "displayName": "Example User"
}
```

**成功响应** (状态码: 201):
```json
{
  "success": true,
  "message": "注册成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsIn...",
    "user": {
      "id": "5f8a4b5e9c2b1d3a7e6f8c9d",
      "username": "example_user",
      "email": "user@example.com",
      "displayName": "Example User",
      "avatar": null,
      "isStreamer": false,
      "isAdmin": false,
      "createdAt": "2023-06-20T12:00:00.000Z"
    }
  }
}
```

**错误响应**:
- 400: 用户名/邮箱已被使用或缺少必要参数
- 500: 服务器内部错误

### 用户登录

**接口地址**: `POST /api/auth/login`

**请求参数**:

| 参数名      | 类型   | 必填 | 描述                 |
|-------------|--------|------|---------------------|
| username    | string | 条件性 | 用户名 (用户名和邮箱必须提供一个) |
| email       | string | 条件性 | 邮箱地址 (用户名和邮箱必须提供一个) |
| password    | string | 是   | 密码                 |

**请求示例**:
```json
{
  "username": "example_user",
  "password": "securePassword123"
}
```
或
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**成功响应** (状态码: 200):
```json
{
  "success": true,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsIn...",
    "user": {
      "id": "5f8a4b5e9c2b1d3a7e6f8c9d",
      "username": "example_user",
      "email": "user@example.com",
      "displayName": "Example User",
      "avatar": null,
      "isStreamer": false,
      "isAdmin": false,
      "createdAt": "2023-06-20T12:00:00.000Z"
    }
  }
}
```

**错误响应**:
- 400: 缺少必要参数
- 401: 密码错误
- 404: 用户不存在
- 500: 服务器内部错误

### 获取当前用户信息

**接口地址**: `GET /api/auth/me`

**请求头**:
```
Authorization: Bearer {token}
```

**成功响应** (状态码: 200):
```json
{
  "success": true,
  "message": "获取成功",
  "data": {
    "user": {
      "id": "5f8a4b5e9c2b1d3a7e6f8c9d",
      "username": "example_user",
      "email": "user@example.com",
      "displayName": "Example User",
      "avatar": null,
      "bio": "用户简介",
      "isStreamer": false,
      "isAdmin": false,
      "followersCount": 0,
      "followingCount": 0,
      "createdAt": "2023-06-20T12:00:00.000Z"
    }
  }
}
```

**错误响应**:
- 401: 未授权访问或令牌过期
- 404: 用户不存在
- 500: 服务器内部错误

## 认证中间件

对于需要身份验证的API，请在请求头中添加以下信息:

```
Authorization: Bearer {token}
```

其中 `{token}` 是通过登录或注册接口获取的JWT令牌。如果令牌无效或过期，API将返回401错误。
