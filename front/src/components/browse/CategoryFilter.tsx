"use client";

import { useEffect, useState } from "react";
import { categoryService } from "@/lib/services/category.service";

interface CategoryFilterProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

interface Category {
  _id: string;
  name: string;
  slug: string;
  icon?: string;
}

export default function CategoryFilter({ selectedCategory, onSelectCategory }: CategoryFilterProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        const data = await categoryService.getCategories();
        setCategories(data.items);
      } catch (error) {
        console.error("加载分类失败:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className="mb-8">
      <div className="flex overflow-x-auto pb-3 space-x-4 scrollbar-hidden">
        <button
          onClick={() => onSelectCategory("all")}
          className={`flex-shrink-0 ${
            selectedCategory === "all"
              ? "bg-purple-600"
              : "bg-gray-800 hover:bg-gray-700"
          } text-white px-4 py-2 rounded-md flex items-center`}
        >
          <i className="fas fa-th-large mr-2"></i>全部
        </button>
        
        {isLoading ? (
          <div className="flex space-x-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex-shrink-0 bg-gray-800 h-10 w-24 rounded-md animate-pulse"></div>
            ))}
          </div>
        ) : (
          categories.map((category) => (
            <button
              key={category._id}
              onClick={() => onSelectCategory(category._id)}
              className={`flex-shrink-0 ${
                selectedCategory === category._id
                  ? "bg-purple-600"
                  : "bg-gray-800 hover:bg-gray-700"
              } text-white px-4 py-2 rounded-md flex items-center`}
            >
              {category.icon && <i className={`${category.icon} mr-2`}></i>}
              {category.name}
            </button>
          ))
        )}
      </div>
    </div>
  );
} 
