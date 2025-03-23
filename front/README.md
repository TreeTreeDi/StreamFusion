# TwitchClone 直播平台 - 前端

这是一个类似Twitch的直播平台前端项目，使用Next.js 15、TypeScript、Tailwind CSS和Shadcn UI开发。

## 技术栈

- **框架**: Next.js 15 (App Router)
- **语言**: TypeScript
- **UI组件库**: Shadcn UI, Radix UI
- **样式**: Tailwind CSS
- **状态管理**: React Hooks, URL状态管理(nuqs)

## 开发环境

确保已安装Node.js和pnpm。

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
├── app/             # Next.js应用路由
├── components/      # UI组件
├── hooks/           # 自定义Hooks
└── lib/             # 工具函数和类型定义
```

## 功能

1. **首页(/)**：展示推荐直播、热门分类和关注的主播
2. **浏览页(/browse)**：按照分类筛选查看直播内容
3. **直播间页面(/channel/[channelId])**：观看直播并参与聊天互动
4. **关注页面(/following)**：查看关注的主播和推荐关注
5. **个人资料页面(/profile/[userId])**：展示用户个人信息及上传的视频 
