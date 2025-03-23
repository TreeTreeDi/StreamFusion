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
import { useAuth } from "@/contexts/auth-context";
import { toast } from "sonner";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegister: () => void;
}

export function LoginModal({ isOpen, onClose, onRegister }: LoginModalProps) {
  const { login } = useAuth();
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
        onClose();
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
            <Label htmlFor="identifier">用户名或邮箱</Label>
            <Input
              id="identifier"
              type="text"
              placeholder="请输入用户名或邮箱"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
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
