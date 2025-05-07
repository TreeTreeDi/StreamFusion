"use client";

import { useEffect, useState } from 'react';
import adminApi, { UserListResponse, UserQueryParams } from '@/lib/admin-api-service';
import { User } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";
import { PlusCircle, Edit, Trash2 } from 'lucide-react';

import UserFormModal from './components/UserFormModal'; 

export default function UserManagementPage() {
  const [userListResponse, setUserListResponse] = useState<UserListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [queryParams, setQueryParams] = useState<UserQueryParams>({ page: 1, limit: 10 });
  const [searchTerm, setSearchTerm] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const fetchUsers = async (params: UserQueryParams) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await adminApi.listUsers(params);
      setUserListResponse(data);
    } catch (err: any) {
      setError(err.message || '获取用户列表失败');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(queryParams);
  }, [queryParams]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setQueryParams(prev => ({ ...prev, page: 1, search: searchTerm || undefined }));
  };

  const handlePageChange = (newPage: number) => {
    setQueryParams(prev => ({ ...prev, page: newPage }));
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('确定要删除该用户吗？此操作不可撤销。')) {
      try {
        await adminApi.deleteUser(userId);
        fetchUsers(queryParams); 
        alert('用户删除成功！'); 
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.message || '删除用户失败';
        setError(errorMessage); 
        alert(`删除用户失败: ${errorMessage}`); 
      }
    }
  };
  
  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const handleModalSave = (savedUser: User) => {
    alert(`用户 ${savedUser.username} ${editingUser ? '更新' : '创建'}成功!`);
    handleModalClose();
    fetchUsers(queryParams); 
  };


  if (isLoading && !userListResponse) { 
    return <div className="p-4">正在加载用户数据...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">错误: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">用户管理</h1>

      <div className="flex justify-between items-center mb-6">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <Input
            type="text"
            placeholder="搜索用户 (用户名, 邮箱, 昵称)"
            value={searchTerm}
            onChange={handleSearchChange}
            className="max-w-xs"
          />
          <Button type="submit">搜索</Button>
        </form>
        <Button onClick={openCreateModal} >
          <PlusCircle className="mr-2 h-4 w-4" /> 新增用户
        </Button>
      </div>
      
      {isLoading && <p>正在刷新...</p>}

      {userListResponse && userListResponse.users.length > 0 ? (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>用户名</TableHead>
                <TableHead>邮箱</TableHead>
                <TableHead>昵称</TableHead>
                <TableHead>主播?</TableHead>
                <TableHead>管理员?</TableHead>
                <TableHead>注册时间</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userListResponse.users.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.displayName || '-'}</TableCell>
                  <TableCell>{user.isStreamer ? '是' : '否'}</TableCell>
                  <TableCell>{user.isAdmin ? '是' : '否'}</TableCell>
                  <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm" onClick={() => openEditModal(user)} >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteUser(user._id)} >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {userListResponse.totalPages > 1 && (
            <div className="mt-6 flex justify-center">
              <Pagination
                currentPage={queryParams.page || 1}
                totalPages={userListResponse.totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      ) : (
        !isLoading && <p>未找到用户。</p>
      )}

      {isModalOpen && (
        <UserFormModal
          user={editingUser}
          onClose={handleModalClose}
          onSave={handleModalSave}
        />
      )}
    </div>
  );
}
