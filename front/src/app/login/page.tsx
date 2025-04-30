"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginPage() {
  const { login, register } = useAuth();
  const router = useRouter();
  const [isLoginForm, setIsLoginForm] = useState(true);
  
  // 登录表单状态
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  
  // 注册表单状态
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    displayName: ""
  });
  
  const [isLoading, setIsLoading] = useState(false);

  // 动画变量
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.5,
        ease: "easeOut" 
      }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  // 表单切换动画
  const formAnimation = {
    initial: { x: 300, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -300, opacity: 0 },
    transition: { type: "spring", stiffness: 100, damping: 15 }
  };

  // 注册表单处理
  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
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
  
  const handleRegisterSubmit = async (e: React.FormEvent) => {
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
  
  // 切换表单
  const toggleForm = () => {
    setIsLoading(false); // 重置加载状态
    setIsLoginForm(!isLoginForm);
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      {/* 左侧表单区域 */}
      <motion.div 
        className="w-full md:w-1/2 flex items-center justify-center p-8"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg relative overflow-hidden">
          {/* Logo占位符 */}
          <motion.div variants={fadeInUp} className="w-12 h-12 mx-auto mb-6 bg-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">SF</span>
          </motion.div>
          
          <AnimatePresence mode="wait">
            {isLoginForm ? (
              <motion.div
                key="login-form"
                initial="initial"
                animate="animate"
                exit="exit"
                variants={formAnimation}
              >
                {/* 标题与副标题 */}
                <div className="text-center space-y-2 mb-6">
                  <h1 className="text-2xl font-bold text-gray-900">欢迎回来</h1>
                  <p className="text-sm text-gray-500">登录以继续访问精彩内容</p>
                </div>
    
                <form onSubmit={handleLoginSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="identifier" className="text-gray-700">用户名或邮箱</Label>
                    <Input
                      id="identifier"
                      type="text"
                      placeholder="请输入用户名或邮箱"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      disabled={isLoading}
                      required
                      className="border-gray-300 focus:border-purple-500 focus:ring-purple-500 rounded-md"
                    />
                  </div>
    
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-gray-700">密码</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="请输入密码"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                      required
                      className="border-gray-300 focus:border-purple-500 focus:ring-purple-500 rounded-md"
                    />
                  </div>
    
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        id="remember-me"
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 border-gray-300 rounded text-purple-600 focus:ring-purple-500"
                      />
                      <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                        记住我
                      </label>
                    </div>
                    <Link href="/forgot-password" className="text-sm text-gray-500 hover:text-purple-600 hover:underline">
                      忘记密码?
                    </Link>
                  </div>
    
                  <Button
                    type="submit"
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-md transition-colors"
                    disabled={isLoading}
                  >
                    {isLoading ? "登录中..." : "登录"}
                  </Button>
                </form>
    
                <div className="text-center mt-6">
                  <p className="text-sm text-gray-500">
                    还没有账号？
                    <button onClick={toggleForm} className="ml-1 text-purple-600 hover:underline">
                      立即注册
                    </button>
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="register-form"
                initial="initial"
                animate="animate"
                exit="exit"
                variants={formAnimation}
              >
                {/* 注册表单标题 */}
                <div className="text-center space-y-2 mb-6">
                  <h1 className="text-2xl font-bold text-gray-900">创建账户</h1>
                  <p className="text-sm text-gray-500">注册账户开始您的直播之旅</p>
                </div>
    
                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-gray-700">用户名</Label>
                    <Input
                      id="username"
                      name="username"
                      type="text"
                      placeholder="请输入用户名"
                      value={formData.username}
                      onChange={handleRegisterChange}
                      disabled={isLoading}
                      required
                      className="border-gray-300 focus:border-purple-500 focus:ring-purple-500 rounded-md"
                    />
                  </div>
    
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-700">邮箱</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="请输入邮箱"
                      value={formData.email}
                      onChange={handleRegisterChange}
                      disabled={isLoading}
                      required
                      className="border-gray-300 focus:border-purple-500 focus:ring-purple-500 rounded-md"
                    />
                  </div>
    
                  <div className="space-y-2">
                    <Label htmlFor="displayName" className="text-gray-700">显示名称</Label>
                    <Input
                      id="displayName"
                      name="displayName"
                      type="text"
                      placeholder="请输入显示名称（可选）"
                      value={formData.displayName}
                      onChange={handleRegisterChange}
                      disabled={isLoading}
                      className="border-gray-300 focus:border-purple-500 focus:ring-purple-500 rounded-md"
                    />
                  </div>
    
                  <div className="space-y-2">
                    <Label htmlFor="registerPassword" className="text-gray-700">密码</Label>
                    <Input
                      id="registerPassword"
                      name="password"
                      type="password"
                      placeholder="请输入密码"
                      value={formData.password}
                      onChange={handleRegisterChange}
                      disabled={isLoading}
                      required
                      className="border-gray-300 focus:border-purple-500 focus:ring-purple-500 rounded-md"
                    />
                  </div>
    
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-gray-700">确认密码</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="请再次输入密码"
                      value={formData.confirmPassword}
                      onChange={handleRegisterChange}
                      disabled={isLoading}
                      required
                      className="border-gray-300 focus:border-purple-500 focus:ring-purple-500 rounded-md"
                    />
                  </div>
    
                  <Button
                    type="submit"
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-md transition-colors"
                    disabled={isLoading}
                  >
                    {isLoading ? "注册中..." : "注册"}
                  </Button>
                </form>
    
                <div className="text-center mt-6">
                  <p className="text-sm text-gray-500">
                    已有账号？
                    <button onClick={toggleForm} className="ml-1 text-purple-600 hover:underline">
                      立即登录
                    </button>
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* 右侧插画区域 - 在中等屏幕以上显示 */}
      <motion.div 
        className="hidden md:flex w-1/2 items-center justify-center p-12"
        style={{
          backgroundImage: "url('/login.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <div className="text-center text-white">
          <motion.div 
            className="w-64 h-64 mx-auto mb-8 rounded-full bg-white/10 flex items-center justify-center"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ 
              duration: 0.8, 
              type: "spring",
              stiffness: 100 
            }}
          >
            <span className="text-3xl font-bold">StreamFusion</span>
          </motion.div>
          <h2 className="text-2xl font-bold mb-4">实时互动直播新纪元</h2>
          <p className="text-lg opacity-80">
            基于WebRTC构建，为您带来前所未有的超低延迟、高并发、强互动直播体验
          </p>
        </div>
      </motion.div>
    </div>
  );
} 
