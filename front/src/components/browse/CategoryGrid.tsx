"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { categoryService } from "@/lib/services/category.service";

interface CategoryGridProps {
  selectedCategory: string;
  selectedTags: string[];
  sortBy: string;
}

interface Category {
  _id: string;
  name: string;
  slug: string;
  coverImage: string;
  viewerCount: number;
  tags?: string[];
}

export default function CategoryGrid({ selectedCategory, selectedTags, sortBy }: CategoryGridProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        let data;
        if (selectedCategory === "all") {
          // 获取所有分类
          data = await categoryService.getPopularCategories({
            sort: sortBy,
            tags: selectedTags.length > 0 ? selectedTags.join(",") : undefined
          });
        } else {
          // 获取特定分类
          data = await categoryService.getCategories({
            category: selectedCategory,
            sort: sortBy,
            tags: selectedTags.length > 0 ? selectedTags.join(",") : undefined
          });
        }
        setCategories(data);
      } catch (error) {
        console.error("加载分类失败:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, [selectedCategory, selectedTags, sortBy]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="bg-gray-800 rounded-md overflow-hidden">
            <div className="w-full h-40 bg-gray-700 animate-pulse"></div>
            <div className="p-3">
              <div className="h-5 bg-gray-700 rounded animate-pulse mb-2"></div>
              <div className="flex gap-1 mt-2">
                <div className="h-4 w-14 bg-gray-700 rounded animate-pulse"></div>
                <div className="h-4 w-14 bg-gray-700 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-2xl font-bold mb-2">暂无内容</div>
        <p className="text-gray-400">未找到符合当前筛选条件的内容</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
      {categories.map((category) => (
        <Link 
          href={`/category/${category.slug}`} 
          key={category._id}
          className="category-card bg-gray-800 rounded-md overflow-hidden transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg"
        >
          <div className="relative">
            <img 
              src={category.coverImage || "https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"} 
              alt={category.name} 
              className="w-full h-40 object-cover"
            />
            <div className="absolute bottom-2 left-2 bg-red-600 text-white text-xs px-1.5 py-0.5 rounded-md">
              {category.viewerCount.toLocaleString()} 观众
            </div>
          </div>
          <div className="p-3">
            <h3 className="font-medium">{category.name}</h3>
            {category.tags && category.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {category.tags.slice(0, 2).map((tag, index) => (
                  <span key={index} className="bg-gray-700 px-2 py-0.5 rounded text-xs">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
} 
