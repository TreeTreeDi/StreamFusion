import { useState, useEffect } from "react";
import { User } from "@/types";

// 模拟获取用户信息
// 实际项目中应该从API或本地存储获取用户信息
export const useUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // 从localStorage获取用户信息
        const storedUser = localStorage.getItem("user");
        
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("获取用户信息失败:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  return { user, isLoading };
}; 
