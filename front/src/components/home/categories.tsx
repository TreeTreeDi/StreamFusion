"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

import { fetchCategories } from "@/lib/api-service";
import { Category } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

export const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setIsLoading(true);
        const response = await fetchCategories();
        if (response) {
          setCategories(response);
        }
      } catch (error) {
        console.error("加载分类失败:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCategories();
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
        {Array(6).fill(0).map((_, i) => (
          <Skeleton key={i} className="aspect-video w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">暂无分类数据</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
      {categories.map((category) => (
        <CategoryCard key={category._id} category={category} />
      ))}
    </div>
  );
};

interface CategoryCardProps {
  category: Category;
}

const CategoryCard = ({ category }: CategoryCardProps) => {
  return (
    <Link href={`/category/${category.slug}`}>
      <div className="group relative aspect-video rounded-lg overflow-hidden border hover:border-primary transition">
        <div className="relative h-4/5 w-full">
          {category.coverImage ? (
            <Image
              src={category.coverImage}
              alt={category.name}
              fill
              className="object-cover group-hover:scale-105 transition duration-300"
            />
          ) : (
            <div className="w-full h-full bg-secondary flex items-center justify-center">
              <span className="text-secondary-foreground">{category.name.charAt(0)}</span>
            </div>
          )}
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-background p-2">
          <h3 className="font-medium text-sm truncate">{category.name}</h3>
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">{category.streamCount} 个直播</p>
            <p className="text-xs text-muted-foreground">{category.viewerCount} 名观众</p>
          </div>
        </div>
      </div>
    </Link>
  );
}; 
