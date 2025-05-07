"use client";

import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { SidebarItem } from '@/components/sidebar/sidebar'; // 导入导出的 SidebarItem
import { HomeIcon, UsersIcon } from 'lucide-react'; // 示例图标

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated || !user?.isAdmin) {
        router.push('/'); // 如果未认证或不是管理员，则重定向到首页
      }
    }
  }, [user, isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated || !user?.isAdmin) {
    // 可以在这里显示加载指示器或骨架屏
    return (
      <div className="flex justify-center items-center h-screen">
        <p>正在加载或验证权限...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100 text-black"> {/* 移除 dark:bg-gray-900 */}
      {/* 简化的侧边栏 */}
      <aside className="w-64 bg-white p-4 border-r border-gray-200 flex flex-col"> {/* 移除 dark:bg-gray-800 和 dark:border-gray-700, 使用明确的浅色边框 */}
        <div className="mb-8">
          <Link href="/admin" className="text-2xl font-bold text-gray-800"> {/* 移除 dark:text-white */}
            管理后台
          </Link>
        </div>
        <nav className="flex flex-col space-y-2">
          <SidebarItem
            href="/admin/user-management"
            label="用户管理"
            icon={<UsersIcon className="h-5 w-5" />}
          />
          <SidebarItem
            href="/"
            label="返回主站"
            icon={<HomeIcon className="h-5 w-5" />}
          />
          {/* 未来可以添加更多管理模块链接 */}
        </nav>
      </aside>
      <main className="flex-1 p-6 overflow-auto">
        {children}
      </main>
    </div>
  );
}
