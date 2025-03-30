import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface AboutStreamerProps {
  user: {
    id: string;
    username: string;
    avatarUrl: string;
    bio: string;
    isVerified: boolean;
    followerCount: number;
  };
  className?: string;
}

const AboutStreamer = ({ user, className }: AboutStreamerProps) => {
  return (
    <div className={cn("bg-gray-800 rounded-md p-4 mb-6", className)}>
      <div className="flex items-center">
        <div className="w-12 h-12 rounded-full overflow-hidden relative mr-4">
          <Image 
            src={`${user.avatarUrl}?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80`}
            alt={`${user.username}的头像`} 
            className="object-cover"
            fill
            sizes="48px"
          />
        </div>
        <div className="flex-1">
          <div className="flex items-center">
            <h2 className="font-bold text-lg mr-2">{user.username}</h2>
            {user.isVerified && (
              <span className="bg-purple-600 text-white text-xs px-1.5 py-0.5 rounded">认证主播</span>
            )}
          </div>
          <p className="text-gray-400 text-sm mt-1">{user.followerCount.toLocaleString()} 粉丝</p>
        </div>
        <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md">
          关注
        </button>
      </div>
      {user.bio && (
        <div className="mt-4">
          <p className="text-sm text-gray-300">{user.bio}</p>
        </div>
      )}
    </div>
  );
};

export default AboutStreamer; 
