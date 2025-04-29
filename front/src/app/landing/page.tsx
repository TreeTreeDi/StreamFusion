"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowDown } from "lucide-react";
import FloatingLoginForm from "@/components/auth/floating-login-form"; // 引入组件

export default function LandingPage() {
  const [isFormVisible, setIsFormVisible] = useState(false);

  const handleShowForm = () => {
    setIsFormVisible(true);
    // 平滑滚动到顶部，确保表单可见
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden"> {/* overflow-x-hidden 防止水平滚动条 */}
      {/* 背景图 */}
      <div 
        className="absolute inset-0 bg-cover bg-center z-[-1]" 
        style={{ 
          backgroundImage: "url('/landing-bg.jpg')", // 替换为你的背景图 URL
          minHeight: '100vh' // 确保背景至少覆盖整个视口
        }} 
      >
        <div className="absolute inset-0 bg-black bg-opacity-60"></div> {/* 增加遮罩不透明度 */}
      </div>

      {/* 浮动登录表单 */}
      <FloatingLoginForm isVisible={isFormVisible} onClose={() => setIsFormVisible(false)} />

      {/* 页面内容 */}
      <div className="relative z-10 flex flex-col items-center justify-between min-h-screen text-center text-white px-4">
        {/* 顶部占位符，防止内容被固定表单遮挡 */}
        <div className="h-24"></div> {/* 高度大约等于表单高度 */} 

        {/* 主要内容区 */}
        <div className="flex-grow flex flex-col items-center justify-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 shadow-text">
            New for Spring 2025
          </h1>
          <p className="text-xl md:text-2xl mb-10 max-w-3xl shadow-text">
            Shop new Arc'teryx, The North Face and more. Discover the latest gear for your next adventure and login to start streaming or watching.
          </p>
        </div>
        
        {/* 底部按钮 */}
        <div className="pb-20"> {/* 增加底部 padding */}
          <Button 
            onClick={handleShowForm}
            size="lg" 
            className="bg-white text-black hover:bg-gray-200 px-10 py-4 text-lg font-semibold rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300"
          >
            登录以继续
          </Button>
          {/* 可选：添加向下箭头提示 */}
          {!isFormVisible && (
             <div className="mt-6 animate-bounce opacity-75">
               <ArrowDown className="h-8 w-8 mx-auto" />
            </div>
          )}
        </div>
      </div>
       {/* 辅助添加文字阴影效果 */}
      <style jsx global>{`
        .shadow-text {
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);
        }
      `}</style>
    </div>
  );
} 
