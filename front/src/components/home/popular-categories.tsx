"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

import { fetchPopularCategories } from "@/lib/api-service";
import { Category } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

export const PopularCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setIsLoading(true);
        const response = await fetchPopularCategories(6); // 获取6个热门分类
        if (response) {
          setCategories(response);
        }
      } catch (error) {
        console.error("加载热门分类失败:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCategories();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">热门分类</h2>
          <Link href="/browse" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            查看全部
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array(6).fill(0).map((_, i) => (
            <Skeleton key={i} className="aspect-video w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">热门分类</h2>
          <Link href="/browse" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            查看全部
          </Link>
        </div>
        <div className="text-center py-10">
          <p className="text-muted-foreground">暂无热门分类数据</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">热门分类</h2>
        <Link href="/browse" className="text-sm text-muted-foreground hover:text-primary transition-colors">
          查看全部
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {categories.map((category) => (
          <CategoryCard key={category._id} category={category} />
        ))}
      </div>
    </div>
  );
};

interface CategoryCardProps {
  category: Category;
}

const CategoryCard = ({ category }: CategoryCardProps) => {
  return (
    <Link href={`/category/${category.slug}`}>
      <div className="category-card bg-card rounded-md overflow-hidden transition-all duration-300 hover:scale-105 border border-border hover:border-primary group">
        <div className="relative h-32 w-full">
          {category.coverImage ? (
            <Image
              src={category.coverImage}
              alt={category.name}
              fill
              className="object-cover group-hover:scale-105 transition duration-300"
            />
          ) : (
            <div className="w-full h-full bg-secondary flex items-center justify-center">
              <span className="text-secondary-foreground text-xl font-bold">{category.name.charAt(0)}</span>
            </div>
          )}
        </div>
        <div className="p-2">
          <h3 className="font-medium text-sm truncate">{category.name}</h3>
          <p className="text-xs text-muted-foreground">{category.viewerCount.toLocaleString('zh-CN')} 观众</p>
        </div>
      </div>
    </Link>
  );
}; 
