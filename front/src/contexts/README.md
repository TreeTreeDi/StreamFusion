# 认证系统前后端对接

## 功能概述

认证系统实现了前后端完整的用户身份验证流程，包括：

1. 用户注册
2. 用户登录
3. 获取当前用户信息
4. 用户登出
5. 全局认证状态管理

## 技术栈

- React Context API (状态管理)
- Axios (HTTP请求)
- JWT (JSON Web Token)
- React Hooks
- Sonner (Toast通知)

## 前端架构

### API服务层 (`/lib/api.ts`)

- 创建了基于Axios的API服务实例
- 实现了请求拦截器，自动添加认证令牌
- 封装了认证相关API调用方法
  - `register`: 用户注册
  - `login`: 用户登录
  - `getCurrentUser`: 获取当前用户信息

### 认证上下文 (`/contexts/auth-context.tsx`)

- 使用React Context API创建全局认证状态
- 提供认证相关方法：
  - `login`: 用户登录并保存令牌
  - `register`: 用户注册并保存令牌
  - `logout`: 用户登出并清除令牌
  - `refreshUser`: 刷新用户信息
- 自动加载和验证存储的令牌
- 维护用户认证状态和用户数据

### UI组件

- `LoginModal`: 登录模态框，支持用户名/邮箱登录
- `RegisterModal`: 注册模态框，包含表单验证
- `AuthButton`: 根据认证状态显示不同UI
  - 未登录：显示登录按钮
  - 已登录：显示用户头像和下拉菜单

## 前后端对接流程

### 1. 注册流程

1. 用户填写注册表单 (`RegisterModal`)
2. 表单验证（用户名、邮箱、密码）
3. 调用`register` API (`/api/auth/register`)
4. 后端验证、创建用户并返回JWT令牌
5. 前端保存令牌和用户信息
6. 更新认证状态为已登录
7. 显示成功通知

### 2. 登录流程

1. 用户填写登录表单 (`LoginModal`)
2. 判断输入的是用户名还是邮箱
3. 调用`login` API (`/api/auth/login`)
4. 后端验证并返回JWT令牌
5. 前端保存令牌和用户信息
6. 更新认证状态为已登录
7. 显示成功通知

### 3. 自动登录流程

1. 应用程序启动时，检查本地存储中的令牌
2. 如果存在，调用`getCurrentUser` API (`/api/auth/me`)
3. 后端验证令牌并返回用户信息
4. 更新认证状态为已登录
5. 如果令牌无效，清除本地存储

### 4. 登出流程

1. 用户点击登出按钮
2. 清除本地存储中的令牌
3. 重置认证状态为未登录
4. 显示登出成功通知

## 认证状态管理

前端使用React Context API管理全局认证状态：

```typescript
interface AuthContextType {
  user: IUser | null;        // 当前用户信息
  isLoading: boolean;        // 加载状态
  isAuthenticated: boolean;  // 是否已认证
  login: Function;           // 登录方法
  register: Function;        // 注册方法
  logout: Function;          // 登出方法
  refreshUser: Function;     // 刷新用户信息
}
```

## 前端安全措施

1. 令牌存储在localStorage中
2. 请求拦截器自动添加认证头
3. 组件根据认证状态条件渲染
4. 敏感操作前验证认证状态
5. 错误处理和异常捕获

## 后续优化方向

1. 实现令牌刷新机制
2. 添加记住我功能
3. 实现社交媒体登录
4. 添加双因素认证
5. 增强安全性（如使用HttpOnly Cookie存储令牌） 
