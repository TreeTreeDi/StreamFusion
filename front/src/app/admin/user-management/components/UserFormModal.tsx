"use client";

import { useEffect, useState } from 'react';
import { User } from '@/types';
import adminApi from '@/lib/admin-api-service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch'; // 假设有 Switch 组件
// import { Textarea } from '@/components/ui/textarea'; // Textarea 组件暂未找到，暂时注释
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"; // 假设有 Dialog 组件

interface UserFormModalProps {
  user: User | null; // null 表示创建新用户，否则为编辑
  onClose: () => void;
  onSave: (savedUser: User) => void;
}

const UserFormModal = ({ user, onClose, onSave }: UserFormModalProps) => {
  const [formData, setFormData] = useState<Partial<User & { password?: string }>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!user;

  useEffect(() => {
    if (user) {
      setFormData({ ...user });
    } else {
      // 新建用户的默认值
      setFormData({
        username: '',
        email: '',
        password: '',
        displayName: '',
        avatar: '',
        bio: '',
        isStreamer: false,
        isAdmin: false,
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    // 修正类型检查，确保 e.target 是 HTMLInputElement 实例再访问 checked
    if (type === 'checkbox' && e.target instanceof HTMLInputElement) {
      setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSwitchChange = (name: 'isStreamer' | 'isAdmin') => (checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      let savedUser: User;
      if (isEditing && user?._id) {
        // 更新用户时，不应发送密码、用户名和邮箱（除非后端允许并有特殊处理）
        const { password, username, email, ...updateData } = formData;
        savedUser = await adminApi.updateUser(user._id, updateData);
      } else {
        // 创建用户时需要密码
        if (!formData.password) {
            setError("创建新用户时密码是必填的。");
            setIsLoading(false);
            return;
        }
        savedUser = await adminApi.createUser(formData);
      }
      onSave(savedUser);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || (isEditing ? '更新用户失败' : '创建用户失败');
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? '编辑用户' : '创建新用户'}</DialogTitle>
          <DialogDescription>
            {isEditing ? `修改用户 ${user?.username} 的信息。` : '填写以下信息以创建新用户。'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div>
            <Label htmlFor="username">用户名</Label>
            <Input id="username" name="username" value={formData.username || ''} onChange={handleChange} required disabled={isEditing} />
            {isEditing && <p className="text-xs text-muted-foreground mt-1">用户名不可修改。</p>}
          </div>
          <div>
            <Label htmlFor="email">邮箱</Label>
            <Input id="email" name="email" type="email" value={formData.email || ''} onChange={handleChange} required disabled={isEditing} />
            {isEditing && <p className="text-xs text-muted-foreground mt-1">邮箱不可修改。</p>}
          </div>
          {!isEditing && (
            <div>
              <Label htmlFor="password">密码 {isEditing ? '(留空则不修改)' : ''}</Label>
              <Input id="password" name="password" type="password" value={formData.password || ''} onChange={handleChange} required={!isEditing} />
            </div>
          )}
          <div>
            <Label htmlFor="displayName">显示名称</Label>
            <Input id="displayName" name="displayName" value={formData.displayName || ''} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="avatar">头像 URL</Label>
            <Input id="avatar" name="avatar" value={formData.avatar || ''} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="bio">简介</Label>
            {/* 使用 Input 替代 Textarea，或您可以后续添加 Textarea 组件 */}
            <Input id="bio" name="bio" value={formData.bio || ''} onChange={handleChange} />
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="isStreamer" name="isStreamer" checked={!!formData.isStreamer} onCheckedChange={handleSwitchChange('isStreamer')} />
            <Label htmlFor="isStreamer">是主播 (Is Streamer)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="isAdmin" name="isAdmin" checked={!!formData.isAdmin} onCheckedChange={handleSwitchChange('isAdmin')} />
            <Label htmlFor="isAdmin">是管理员 (Is Admin)</Label>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" onClick={onClose}>取消</Button>
            </DialogClose>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (isEditing ? '正在保存...' : '正在创建...') : (isEditing ? '保存更改' : '创建用户')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UserFormModal;
