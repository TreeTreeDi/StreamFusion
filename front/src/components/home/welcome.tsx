"use client";

import { useUser } from "@/hooks/use-user";

export const Welcome = () => {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="mb-4">
        <h1 className="text-2xl md:text-3xl font-bold">正在加载...</h1>
      </div>
    );
  }

  return (
    <div className="mb-4">
      <h1 className="text-2xl md:text-3xl font-bold">
        {user ? `欢迎回来, ${user.displayName || user.username}!` : '欢迎来到直播平台!'}
      </h1>
      <p className="text-muted-foreground">
        {user 
          ? '探索最新的直播内容和推荐频道' 
          : '注册或登录以开始您的直播之旅'}
      </p>
    </div>
  );
}; 
