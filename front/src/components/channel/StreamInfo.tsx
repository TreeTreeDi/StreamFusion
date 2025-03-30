import React from 'react';
import { cn } from '@/lib/utils';

interface StreamInfoProps {
  title: string;
  category: string;
  viewerCount: number;
  tags: string[];
  className?: string;
}

const StreamInfo = ({ title, category, viewerCount, tags, className }: StreamInfoProps) => {
  return (
    <div className={cn("bg-gray-800 rounded-md p-4 mb-6", className)}>
      <div className="flex items-start">
        <div className="flex-1">
          <h1 className="text-xl font-bold mb-2">{title}</h1>
          <div className="flex items-center text-gray-400 text-sm mb-4">
            <span className="mr-3">{category}</span>
            <span>{viewerCount.toLocaleString()} 观看</span>
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {tags.map((tag, index) => (
              <span key={index} className="bg-gray-700 px-2 py-1 rounded text-xs">{tag}</span>
            ))}
          </div>
        </div>
        <div className="flex space-x-2">
          <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md flex items-center">
            <i className="fas fa-heart mr-2"></i>关注
          </button>
          <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md flex items-center">
            <i className="fas fa-bell mr-2"></i>订阅
          </button>
        </div>
      </div>
    </div>
  );
};

export default StreamInfo; 
