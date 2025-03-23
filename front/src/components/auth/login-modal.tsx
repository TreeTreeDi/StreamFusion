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

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegister: () => void;
}

export function LoginModal({ isOpen, onClose, onRegister }: LoginModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 这里将实现登录逻辑
      console.log("登录", { email, password });
      
      // 成功登录后关闭模态框
      onClose();
    } catch (error) {
      console.error("登录失败", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">登录账户</DialogTitle>
          <DialogDescription>
            登录即可观看直播、关注主播和参与互动
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="email">邮箱</Label>
            <Input
              id="email"
              type="email"
              placeholder="请输入邮箱"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">密码</Label>
            <Input
              id="password"
              type="password"
              placeholder="请输入密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? "登录中..." : "登录"}
          </Button>
        </form>

        <DialogFooter className="flex flex-col items-center gap-y-2 sm:flex-row sm:justify-between sm:gap-0">
          <Button 
            variant="link" 
            size="sm" 
            className="px-0 sm:px-2"
            onClick={onRegister}
          >
            没有账号？立即注册
          </Button>
          <Button variant="link" size="sm">
            忘记密码？
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 
