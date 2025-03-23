"use client";

import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
}

export function RegisterModal({ isOpen, onClose, onLogin }: RegisterModalProps) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (password !== confirmPassword) {
      setError("两次输入的密码不一致");
      return;
    }

    setIsLoading(true);

    try {
      // 这里将实现注册逻辑
      console.log("注册", { username, email, password });
      
      // 成功注册后关闭模态框
      onClose();
    } catch (error) {
      console.error("注册失败", error);
      setError("注册失败，请稍后重试");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">创建账户</DialogTitle>
          <DialogDescription>
            注册账户即可开始您的直播之旅
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {error && (
            <div className="bg-destructive/15 text-destructive text-sm p-2 rounded-md">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="username">用户名</Label>
            <Input
              id="username"
              placeholder="请输入用户名"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="register-email">邮箱</Label>
            <Input
              id="register-email"
              type="email"
              placeholder="请输入邮箱"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="register-password">密码</Label>
            <Input
              id="register-password"
              type="password"
              placeholder="请输入密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">确认密码</Label>
            <Input
              id="confirm-password"
              type="password"
              placeholder="请再次输入密码"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? "注册中..." : "注册"}
          </Button>
        </form>

        <DialogFooter className="flex justify-center sm:justify-start">
          <Button 
            variant="link" 
            size="sm" 
            onClick={onLogin}
          >
            已有账号？立即登录
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 
