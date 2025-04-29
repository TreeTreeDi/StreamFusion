"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "sonner";
import Link from "next/link";

interface FloatingLoginFormProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function FloatingLoginForm({ isVisible, onClose }: FloatingLoginFormProps) {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const isEmail = identifier.includes('@');
      const loginParams = isEmail 
        ? { email: identifier, password } 
        : { username: identifier, password };

      const result = await login(loginParams);
      
      if (result.success) {
        toast.success(result.message);
        onClose(); // 登录成功后关闭表单
        // 可以在这里添加跳转逻辑，例如 router.push('/')，如果需要的话
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
    <div 
      className={`fixed top-0 left-0 right-0 bg-[#18181b] border-b border-[#3a3a3d] shadow-lg transition-transform duration-500 ease-in-out z-50 transform ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">登录账户</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="h-5 w-5" />
          </Button>
        </div>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div className="space-y-1">
            <Label htmlFor="float-identifier" className="text-sm text-gray-300">用户名或邮箱</Label>
            <Input
              id="float-identifier"
              type="text"
              placeholder="请输入用户名或邮箱"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              disabled={isLoading}
              required
              className="bg-[#2a2a2d] border-[#3a3a3d] text-white text-sm h-10"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="float-password" className="text-sm text-gray-300">密码</Label>
            <Input
              id="float-password"
              type="password"
              placeholder="请输入密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
              className="bg-[#2a2a2d] border-[#3a3a3d] text-white text-sm h-10"
            />
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
            <Button
              type="submit"
              className="w-full sm:w-auto bg-[#a970ff] hover:bg-[#772ce8] text-white text-sm h-10 px-6"
              disabled={isLoading}
            >
              {isLoading ? "登录中..." : "登录"}
            </Button>
             <div className="flex gap-x-2 text-xs mt-2 sm:mt-0">
                <Link href="/register" className="text-[#a970ff] hover:text-[#bf94ff]">
                  注册
                </Link>
                <Link href="/forgot-password" className="text-[#a970ff] hover:text-[#bf94ff]">
                  忘记密码？
                </Link>
              </div>
          </div>
        </form>
      </div>
    </div>
  );
} 
