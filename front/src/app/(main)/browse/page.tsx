"use client";

import React, { useState } from "react";
import { Metadata } from "next";
import CategoryFilter from "@/components/browse/CategoryFilter";
import TagFilter from "@/components/browse/TagFilter";
import CategoryGrid from "@/components/browse/CategoryGrid";
import SortOptions from "@/components/browse/SortOptions";


export default function BrowsePage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>("viewers");

  // 处理分类选择
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  // 处理标签选择
  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : [...prev, tag]
    );
  };

  // 处理排序方式变更
  const handleSortChange = (sort: string) => {
    setSortBy(sort);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* 分类导航 */}
      <CategoryFilter 
        selectedCategory={selectedCategory} 
        onSelectCategory={handleCategoryChange}
      />
      
      {/* 标签筛选 */}
      <div className="mb-8">
        <h2 className="text-lg font-bold mb-4">热门标签</h2>
        <TagFilter 
          selectedTags={selectedTags} 
          onToggleTag={handleTagToggle}
        />
      </div>
      
      {/* 排序选项 */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">热门游戏分类</h2>
        <SortOptions sortBy={sortBy} onSortChange={handleSortChange} />
      </div>
      
      {/* 分类网格 */}
      <CategoryGrid 
        selectedCategory={selectedCategory} 
        selectedTags={selectedTags} 
        sortBy={sortBy}
      />
    </div>
  );
} 
