"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    displayName: ""
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error("两次输入的密码不一致");
      return;
    }
    
    setIsLoading(true);

    try {
      const result = await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        displayName: formData.displayName || formData.username
      });
      
      if (result.success) {
        toast.success(result.message);
        router.push('/');
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("注册失败", error);
      toast.error("注册失败，请稍后再试");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0e0e10]">
      <div className="w-full max-w-md p-8 space-y-8 bg-[#18181b] rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">创建账户</h1>
          <p className="mt-2 text-sm text-gray-400">
            注册账户开始您的直播之旅
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-white">用户名</Label>
            <Input
              id="username"
              name="username"
              type="text"
              placeholder="请输入用户名"
              value={formData.username}
              onChange={handleChange}
              disabled={isLoading}
              required
              className="bg-[#2a2a2d] border-[#3a3a3d] text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-white">邮箱</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="请输入邮箱"
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading}
              required
              className="bg-[#2a2a2d] border-[#3a3a3d] text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="displayName" className="text-white">显示名称</Label>
            <Input
              id="displayName"
              name="displayName"
              type="text"
              placeholder="请输入显示名称（可选）"
              value={formData.displayName}
              onChange={handleChange}
              disabled={isLoading}
              className="bg-[#2a2a2d] border-[#3a3a3d] text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-white">密码</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="请输入密码"
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
              required
              className="bg-[#2a2a2d] border-[#3a3a3d] text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-white">确认密码</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="请再次输入密码"
              value={formData.confirmPassword}
              onChange={handleChange}
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
            {isLoading ? "注册中..." : "注册"}
          </Button>
        </form>

        <div className="text-center mt-6">
          <Link href="/login" className="text-[#a970ff] hover:text-[#bf94ff] text-sm">
            已有账号？立即登录
          </Link>
        </div>
      </div>
    </div>
  );
} 
