"use client";

import { useState } from "react";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoginModal } from "./login-modal";
import { RegisterModal } from "./register-modal";

export function AuthButton() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

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

  return (
    <>
      <Button 
        onClick={openLoginModal} 
        variant="secondary"
        className="flex items-center gap-x-2 bg-[#2a2a2d] hover:bg-[#3a3a3d] text-[#efeff1] transition-colors"
      >
        <User className="h-5 w-5" />
        <span className="hidden md:block">登录</span>
      </Button>

      <LoginModal 
        isOpen={showLoginModal} 
        onClose={closeLoginModal} 
        onRegister={openRegisterModal} 
      />

      <RegisterModal
        isOpen={showRegisterModal}
        onClose={closeRegisterModal}
        onLogin={openLoginFromRegister}
      />
    </>
  );
} 
