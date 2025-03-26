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

### 注册用户
- **URL**: `/api/auth/register`
- **方法**: POST
- **请求体**:
  ```json
  {
    "username": "user123",
    "email": "user@example.com",
    "password": "password123",
    "displayName": "User Display Name"
  }
  ```
- **响应**:
  ```json
  {
    "success": true,
    "message": "注册成功",
    "data": {
      "token": "jwt-token",
      "user": {
        "_id": "user-id",
        "username": "user123",
        "email": "user@example.com",
        "displayName": "User Display Name",
        "avatar": null,
        "isStreamer": false,
        "createdAt": "2023-03-22T05:32:14.567Z"
      }
    }
  }
  ```

### 用户登录
- **URL**: `/api/auth/login`
- **方法**: POST
- **请求体**:
  ```json
  {
    "username": "user123",
    "password": "password123"
  }
  ```
- **响应**:
  ```json
  {
    "success": true,
    "message": "登录成功",
    "data": {
      "token": "jwt-token",
      "user": {
        "_id": "user-id",
        "username": "user123",
        "email": "user@example.com",
        "displayName": "User Display Name",
        "avatar": null,
        "isStreamer": false,
        "createdAt": "2023-03-22T05:32:14.567Z"
      }
    }
  }
  ```

### 获取当前用户信息
- **URL**: `/api/auth/me`
- **方法**: GET
- **请求头**: Authorization: Bearer {jwt-token}
- **响应**:
  ```json
  {
    "success": true,
    "message": "获取用户信息成功",
    "data": {
      "user": {
        "_id": "user-id",
        "username": "user123",
        "email": "user@example.com",
        "displayName": "User Display Name",
        "avatar": null,
        "isStreamer": false,
        "followersCount": 0,
        "followingCount": 0,
        "createdAt": "2023-03-22T05:32:14.567Z"
      }
    }
  }
  ```

## 分类接口

### 获取所有分类
- **URL**: `/api/categories`
- **方法**: GET
- **查询参数**:
  - `limit`: 限制返回数量，默认20
- **响应**:
  ```json
  {
    "success": true,
    "message": "获取分类列表成功",
    "data": [
      {
        "_id": "category-id-1",
        "name": "游戏",
        "slug": "games",
        "description": "游戏直播分类",
        "coverImage": "https://example.com/images/games.jpg",
        "viewerCount": 2500,
        "streamCount": 120,
        "createdAt": "2023-03-22T08:15:30.123Z"
      },
      {
        "_id": "category-id-2",
        "name": "音乐",
        "slug": "music",
        "description": "音乐直播分类",
        "coverImage": "https://example.com/images/music.jpg",
        "viewerCount": 1800,
        "streamCount": 95,
        "createdAt": "2023-03-22T09:30:25.789Z"
      }
    ]
  }
  ```

### 获取热门分类
- **URL**: `/api/categories/popular`
- **方法**: GET
- **查询参数**:
  - `limit`: 限制返回数量，默认10
- **响应**:
  ```json
  {
    "success": true,
    "message": "获取热门分类成功",
    "data": [
      {
        "_id": "category-id-1",
        "name": "游戏",
        "slug": "games",
        "description": "游戏直播分类",
        "coverImage": "https://example.com/images/games.jpg",
        "viewerCount": 2500,
        "streamCount": 120,
        "createdAt": "2023-03-22T08:15:30.123Z"
      }
    ]
  }
  ```

### 根据ID获取分类
- **URL**: `/api/categories/:id`
- **方法**: GET
- **响应**:
  ```json
  {
    "success": true,
    "message": "获取分类详情成功",
    "data": {
      "_id": "category-id-1",
      "name": "游戏",
      "slug": "games",
      "description": "游戏直播分类",
      "coverImage": "https://example.com/images/games.jpg",
      "viewerCount": 2500,
      "streamCount": 120,
      "createdAt": "2023-03-22T08:15:30.123Z"
    }
  }
  ```

### 根据Slug获取分类
- **URL**: `/api/categories/slug/:slug`
- **方法**: GET
- **响应**:
  ```json
  {
    "success": true,
    "message": "获取分类详情成功",
    "data": {
      "_id": "category-id-1",
      "name": "游戏",
      "slug": "games",
      "description": "游戏直播分类",
      "coverImage": "https://example.com/images/games.jpg",
      "viewerCount": 2500,
      "streamCount": 120,
      "createdAt": "2023-03-22T08:15:30.123Z"
    }
  }
  ```

## Banner接口

### 获取所有Banner
- **URL**: `/api/banners`
- **方法**: GET
- **响应**:
  ```json
  {
    "success": true,
    "message": "获取Banner列表成功",
    "data": [
      {
        "_id": "banner-id-1",
        "title": "大型游戏比赛",
        "description": "不容错过的游戏赛事",
        "imageUrl": "https://example.com/images/banner1.jpg",
        "linkUrl": "/event/game-tournament",
        "isActive": true,
        "priority": 1,
        "startDate": "2023-03-20T00:00:00.000Z",
        "endDate": "2023-04-05T00:00:00.000Z",
        "createdAt": "2023-03-18T10:45:12.345Z"
      }
    ]
  }
  ```

## 直播接口

### 获取直播列表(带筛选)
- **URL**: `/api/streams`
- **方法**: GET
- **查询参数**:
  - `category`: 分类ID
  - `tags`: 标签ID列表，逗号分隔
  - `sort`: 排序方式 (viewers, newest, trending)
  - `page`: 页码，默认1
  - `limit`: 每页数量，默认12
  - `search`: 搜索关键词
- **响应**:
  ```json
  {
    "success": true,
    "message": "获取直播列表成功",
    "data": {
      "streams": [
        {
          "_id": "stream-id-1",
          "title": "英雄联盟排位赛",
          "description": "钻石局排位",
          "thumbnailUrl": "https://example.com/thumbnails/stream1.jpg",
          "category": {
            "_id": "category-id-1",
            "name": "英雄联盟",
            "slug": "lol"
          },
          "user": {
            "_id": "user-id-1",
            "username": "gamer123",
            "displayName": "职业玩家",
            "avatar": "https://example.com/avatars/user1.jpg"
          },
          "isLive": true,
          "viewerCount": 1250,
          "startedAt": "2023-03-23T14:30:00.000Z",
          "createdAt": "2023-03-23T14:28:35.123Z"
        }
      ],
      "pagination": {
        "total": 45,
        "page": 1,
        "limit": 12,
        "pages": 4
      }
    }
  }
  ```

### 获取热门直播
- **URL**: `/api/streams/popular`
- **方法**: GET
- **查询参数**:
  - `page`: 页码，默认1
  - `limit`: 每页数量，默认8
- **响应**:
  ```json
  {
    "success": true,
    "message": "获取热门直播成功",
    "data": {
      "streams": [
        {
          "_id": "stream-id-1",
          "title": "英雄联盟排位赛",
          "description": "钻石局排位",
          "thumbnailUrl": "https://example.com/thumbnails/stream1.jpg",
          "category": {
            "_id": "category-id-1",
            "name": "英雄联盟",
            "slug": "lol"
          },
          "user": {
            "_id": "user-id-1",
            "username": "gamer123",
            "displayName": "职业玩家",
            "avatar": "https://example.com/avatars/user1.jpg"
          },
          "isLive": true,
          "viewerCount": 1250,
          "startedAt": "2023-03-23T14:30:00.000Z",
          "createdAt": "2023-03-23T14:28:35.123Z"
        }
      ],
      "pagination": {
        "total": 45,
        "page": 1,
        "limit": 8,
        "pages": 6
      }
    }
  }
  ```

### 按分类获取直播
- **URL**: `/api/streams/by-category/:categoryId`
- **方法**: GET
- **查询参数**:
  - `page`: 页码，默认1
  - `limit`: 每页数量，默认8
- **响应**:
  ```json
  {
    "success": true,
    "message": "获取分类直播成功",
    "data": {
      "streams": [
        {
          "_id": "stream-id-1",
          "title": "英雄联盟排位赛",
          "description": "钻石局排位",
          "thumbnailUrl": "https://example.com/thumbnails/stream1.jpg",
          "category": {
            "_id": "category-id-1",
            "name": "英雄联盟",
            "slug": "lol"
          },
          "user": {
            "_id": "user-id-1",
            "username": "gamer123",
            "displayName": "职业玩家",
            "avatar": "https://example.com/avatars/user1.jpg"
          },
          "isLive": true,
          "viewerCount": 1250,
          "startedAt": "2023-03-23T14:30:00.000Z",
          "createdAt": "2023-03-23T14:28:35.123Z"
        }
      ],
      "pagination": {
        "total": 15,
        "page": 1,
        "limit": 8,
        "pages": 2
      }
    }
  }
  ```

### 获取直播详情
- **URL**: `/api/streams/:streamId`
- **方法**: GET
- **响应**:
  ```json
  {
    "success": true,
    "message": "获取直播详情成功",
    "data": {
      "_id": "stream-id-1",
      "title": "英雄联盟排位赛",
      "description": "钻石局排位",
      "thumbnailUrl": "https://example.com/thumbnails/stream1.jpg",
      "category": {
        "_id": "category-id-1",
        "name": "英雄联盟",
        "slug": "lol"
      },
      "user": {
        "_id": "user-id-1",
        "username": "gamer123",
        "displayName": "职业玩家",
        "avatar": "https://example.com/avatars/user1.jpg",
        "bio": "专业游戏玩家，主攻MOBA类游戏"
      },
      "isLive": true,
      "viewerCount": 1250,
      "startedAt": "2023-03-23T14:30:00.000Z",
      "createdAt": "2023-03-23T14:28:35.123Z"
    }
  }
  ```

## 频道接口

### 获取热门频道
- **URL**: `/api/channels/popular`
- **方法**: GET
- **查询参数**:
  - `limit`: 限制返回数量，默认10
- **响应**:
  ```json
  {
    "success": true,
    "message": "获取热门频道成功",
    "data": [
      {
        "_id": "user-id-1",
        "username": "gamer123",
        "displayName": "职业玩家",
        "avatar": "https://example.com/avatars/user1.jpg",
        "isLive": true,
        "viewerCount": 1250,
        "game": "英雄联盟",
        "title": "英雄联盟排位赛"
      }
    ]
  }
  ```

## 标签接口

### 获取所有标签
- **URL**: `/api/tags`
- **方法**: GET
- **查询参数**:
  - `limit`: 限制返回数量，默认20
- **响应**:
  ```json
  {
    "success": true,
    "message": "获取标签列表成功",
    "data": [
      {
        "_id": "tag-id-1",
        "name": "FPS",
        "slug": "fps",
        "description": "第一人称射击游戏",
        "useCount": 450,
        "createdAt": "2023-03-22T08:15:30.123Z"
      },
      {
        "_id": "tag-id-2",
        "name": "MOBA",
        "slug": "moba",
        "description": "多人在线战术竞技游戏",
        "useCount": 780,
        "createdAt": "2023-03-22T09:30:25.789Z"
      }
    ]
  }
  ```

### 获取热门标签
- **URL**: `/api/tags/popular`
- **方法**: GET
- **查询参数**:
  - `limit`: 限制返回数量，默认10
- **响应**:
  ```json
  {
    "success": true,
    "message": "获取热门标签成功",
    "data": [
      {
        "_id": "tag-id-2",
        "name": "MOBA",
        "slug": "moba",
        "description": "多人在线战术竞技游戏",
        "useCount": 780,
        "createdAt": "2023-03-22T09:30:25.789Z"
      }
    ]
  }
  ```

### 根据ID获取标签
- **URL**: `/api/tags/:tagId`
- **方法**: GET
- **响应**:
  ```json
  {
    "success": true,
    "message": "获取标签详情成功",
    "data": {
      "_id": "tag-id-1",
      "name": "FPS",
      "slug": "fps",
      "description": "第一人称射击游戏",
      "useCount": 450,
      "createdAt": "2023-03-22T08:15:30.123Z"
    }
  }
  ```

### 根据分类获取标签
- **URL**: `/api/tags/by-category/:categoryId`
- **方法**: GET
- **响应**:
  ```json
  {
    "success": true,
    "message": "获取分类标签成功",
    "data": [
      {
        "_id": "tag-id-3",
        "name": "多人游戏",
        "slug": "multiplayer",
        "description": "多人在线游戏",
        "useCount": 320,
        "createdAt": "2023-03-22T10:15:48.456Z"
      }
    ]
  }
  ```
