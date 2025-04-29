"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 这里实际应该调用后端API
      // 现在只是模拟发送重置密码邮件
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsSubmitted(true);
      toast.success("重置密码链接已发送到您的邮箱");
    } catch (error) {
      console.error("发送重置密码邮件失败", error);
      toast.error("发送失败，请稍后再试");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0e0e10]">
      <div className="w-full max-w-md p-8 space-y-8 bg-[#18181b] rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">重置密码</h1>
          <p className="mt-2 text-sm text-gray-400">
            {!isSubmitted 
              ? "输入您的邮箱，我们将发送重置密码链接" 
              : "请查看您的邮箱，点击链接重置密码"}
          </p>
        </div>

        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">邮箱地址</Label>
              <Input
                id="email"
                type="email"
                placeholder="请输入您的注册邮箱"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
              {isLoading ? "发送中..." : "发送重置链接"}
            </Button>
          </form>
        ) : (
          <div className="text-center space-y-6">
            <p className="text-white">
              重置链接已发送到 <span className="font-medium">{email}</span>
            </p>
            <p className="text-sm text-gray-400">
              如果您没有收到邮件，请检查垃圾邮件文件夹，或尝试重新发送
            </p>
            <Button
              onClick={() => setIsSubmitted(false)}
              variant="outline"
              className="w-full border-[#3a3a3d] text-white hover:bg-[#2a2a2d]"
            >
              重新发送
            </Button>
          </div>
        )}

        <div className="text-center mt-6">
          <Link href="/login" className="text-[#a970ff] hover:text-[#bf94ff] text-sm">
            返回登录
          </Link>
        </div>
      </div>
    </div>
  );
} 
