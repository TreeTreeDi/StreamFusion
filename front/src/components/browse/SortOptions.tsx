"use client";

import { useState } from "react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";

interface SortOptionsProps {
  sortBy: string;
  onSortChange: (sort: string) => void;
}

export default function SortOptions({ sortBy, onSortChange }: SortOptionsProps) {
  const handleValueChange = (value: string) => {
    onSortChange(value);
  };

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-gray-400">排序方式:</span>
      <Select value={sortBy} onValueChange={handleValueChange}>
        <SelectTrigger className="w-[150px] bg-gray-800 border-gray-700">
          <SelectValue placeholder="选择排序方式" />
        </SelectTrigger>
        <SelectContent className="bg-gray-800 border-gray-700 text-white">
          <SelectItem value="viewers">观看人数最多</SelectItem>
          <SelectItem value="newest">最新开播</SelectItem>
          <SelectItem value="trending">热度上升中</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
} 
