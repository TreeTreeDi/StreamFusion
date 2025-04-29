"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 判断用户输入的是邮箱还是用户名
      const isEmail = identifier.includes('@');
      const loginParams = isEmail 
        ? { email: identifier, password } 
        : { username: identifier, password };

      // 调用登录API
      const result = await login(loginParams);
      
      if (result.success) {
        toast.success(result.message);
        router.push('/');
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("登录失败", error);
      toast.error("登录失败，请稍后再试");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0e0e10]">
      <div className="w-full max-w-md p-8 space-y-8 bg-[#18181b] rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">登录账户</h1>
          <p className="mt-2 text-sm text-gray-400">
            登录即可观看直播、关注主播和参与互动
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="identifier" className="text-white">用户名或邮箱</Label>
            <Input
              id="identifier"
              type="text"
              placeholder="请输入用户名或邮箱"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              disabled={isLoading}
              required
              className="bg-[#2a2a2d] border-[#3a3a3d] text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-white">密码</Label>
            <Input
              id="password"
              type="password"
              placeholder="请输入密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
              className="bg-[#2a2a2d] border-[#3a3a3d] text-white"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-[#a970ff] hover:bg-[#772ce8] text-white"
            disabled={isLoading}
          >
            {isLoading ? "登录中..." : "登录"}
          </Button>
        </form>

        <div className="flex flex-col mt-6 space-y-2 text-sm text-center sm:flex-row sm:justify-between sm:space-y-0">
          <Link href="/register" className="text-[#a970ff] hover:text-[#bf94ff]">
            没有账号？立即注册
          </Link>
          <Link href="/forgot-password" className="text-[#a970ff] hover:text-[#bf94ff]">
            忘记密码？
          </Link>
        </div>
      </div>
    </div>
  );
} 
