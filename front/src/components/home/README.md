# 首页组件

此目录包含首页中使用的各种组件。

## 热门分类组件 (popular-categories.tsx)

### 功能概述

热门分类组件用于在首页上展示平台上最受欢迎的内容分类。该组件会自动获取后端API中排序后的热门分类数据，并以网格布局的方式展示给用户。

### 实现细节

- 使用React的`useState`和`useEffect`钩子管理组件状态和数据获取
- 通过`fetchPopularCategories` API获取热门分类数据（默认获取6个）
- 响应式网格布局，在不同设备尺寸下自动调整布局（2列到6列）
- 支持加载状态和空数据状态的显示
- 分类卡片组件具有悬停效果，提升用户交互体验
- 每个分类卡片显示分类名称和观看人数，点击后导航到相应分类页面

### 依赖

- 使用Next.js的`Link`和`Image`组件实现导航和图片优化
- 使用Shadcn UI的`Skeleton`组件实现加载骨架屏
- 依赖`@/lib/api-service`中的API服务封装
- 使用`@/types`中定义的`Category`类型接口

### 使用方式

```tsx
// 在页面组件中导入并使用
import { PopularCategories } from "@/components/home/popular-categories";

export default function HomePage() {
  return (
    <div>
      {/* 其他内容 */}
      <PopularCategories />
      {/* 其他内容 */}
    </div>
  );
}
```

## 其他组件

- categories.tsx: 用于展示所有分类的列表
- welcome.tsx: 首页欢迎组件
- recommended-channels.tsx: 推荐频道组件 
