"use client";

import { useState } from "react";
import { LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoginModal } from "./login-modal";
import { RegisterModal } from "./register-modal";
import { useAuth } from "@/contexts/auth-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";

import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { toast } from "sonner";

export function AuthButton() {
  const { user, isAuthenticated, logout } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const router = useRouter();

  const openLoginModal = () => {
    setShowLoginModal(true);
  };

  const closeLoginModal = () => {
    setShowLoginModal(false);
  };

  const openRegisterModal = () => {
    setShowLoginModal(false);
    setShowRegisterModal(true);
  };

  const closeRegisterModal = () => {
    setShowRegisterModal(false);
  };

  const openLoginFromRegister = () => {
    setShowRegisterModal(false);
    setShowLoginModal(true);
  };

  const handleLogout = () => {
    logout();
    toast.success("已成功登出");
    router.push("/landing");
  };

  // 已登录状态
  if (isAuthenticated && user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            className="relative h-10 w-10 rounded-full"
          >
            <Avatar>
              <AvatarImage src={user.avatar} alt={user.displayName} />
              <AvatarFallback>{user.displayName.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end">
          <DropdownMenuLabel>
            <div className="flex flex-col">
              <span>{user.displayName}</span>
              <span className="text-xs text-muted-foreground">@{user.username}</span>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <Link href={`/profile/${user.id}`}>
            <DropdownMenuItem>
              个人资料
            </DropdownMenuItem>
          </Link>
          {user.isStreamer && (
            <Link href="/dashboard">
              <DropdownMenuItem>
                直播中心
              </DropdownMenuItem>
            </Link>
          )}
          <Link href="/dashboard/streaming/keys">
            <DropdownMenuItem>
              直播设置
            </DropdownMenuItem>
          </Link>
          <Link href="/settings">
            <DropdownMenuItem>
              设置
            </DropdownMenuItem>
          </Link>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            登出
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // 未登录状态
  return (
    <Link href="/login">
      <Button 
        variant="secondary"
        className="flex items-center gap-x-2 bg-[#2a2a2d] hover:bg-[#3a3a3d] text-[#efeff1] transition-colors"
      >
        <User className="h-5 w-5" />
        <span className="hidden md:block">登录</span>
      </Button>
    </Link>
  );
} 
