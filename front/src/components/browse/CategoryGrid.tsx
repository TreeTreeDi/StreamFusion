"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { FixedSizeGrid, GridChildComponentProps } from 'react-window';
import { categoryService } from "@/lib/services/category.service";
import { Pagination } from "@/components/ui/pagination";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";

interface CategoryGridProps {
  selectedCategory: string;
  selectedTags: string[];
  sortBy: string;
  infiniteScroll?: boolean; // 是否使用无限滚动
}

interface Category {
  _id: string;
  name: string;
  slug: string;
  coverImage?: string; // 修改为可选
  viewerCount: number;
  tags?: string[];
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

// 计算网格列数
const getColumnCount = (width: number) => {
  if (width >= 1280) return 5; // xl
  if (width >= 1024) return 4; // lg
  if (width >= 640) return 3;  // sm
  return 2; // 默认
};

// 计算每个卡片的高度
const CARD_HEIGHT = 200; // 卡片高度
const CARD_PADDING = 20; // 卡片间距
const CARD_WIDTH = 300; // 卡片宽度

export default function CategoryGrid({ 
  selectedCategory, 
  selectedTags, 
  sortBy,
  infiniteScroll = false // 默认使用传统分页
}: CategoryGridProps) {
  // 1. 所有的 useState 调用
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 12,
    pages: 0
  });
  const [windowWidth, setWindowWidth] = useState(0);
  const [columnCount, setColumnCount] = useState(2);
  
  
  // 3. 计算派生状态
  const hasMore = pagination.page < pagination.pages;
  const rowCount = Math.ceil(categories.length / columnCount);
  const rowHeight = CARD_HEIGHT + CARD_PADDING;

  // 4. 渲染单个分类卡片
  const CategoryCard = useCallback(({ columnIndex, rowIndex, style }: GridChildComponentProps) => {
    const index = rowIndex * columnCount + columnIndex;
    const category = categories[index];
    
    if (!category) return null;

    return (
      <div style={{
        ...style,
        padding: CARD_PADDING / 2,
      }}>
        <Link 
          href={`/category/${category.slug}`} 
          className="category-card bg-gray-800 rounded-md overflow-hidden transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg block h-full"
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
      </div>
    );
  }, [categories, columnCount]);

  // 5. 加载分类数据
  const fetchCategories = useCallback(async (page = 1) => {
    try {
      if (page === 1) {
        setIsLoading(true);
      }
      
      let data;
      if (selectedCategory === "all") {
        // 获取所有分类
        data = await categoryService.getPopularCategories({
          sort: sortBy,
          tags: selectedTags.length > 0 ? selectedTags.join(",") : undefined,
          page: page,
          limit: pagination.limit
        });
      } else {
        // 获取特定分类
        data = await categoryService.getCategories({
          category: selectedCategory,
          sort: sortBy,
          tags: selectedTags.length > 0 ? selectedTags.join(",") : undefined,
          page: page,
          limit: pagination.limit
        });
      }
      
      // 如果是首页或使用传统分页，则替换数据
      // 如果是无限滚动且不是首页，则追加数据
      if (page === 1 || !infiniteScroll) {
        setCategories(data.items || []);
      } else {
        setCategories(prev => [...prev, ...(data.items || [])]);
      }
      
      // 更新分页信息
      if (data.pagination) {
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("加载分类失败:", error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory, selectedTags, sortBy, pagination.limit, infiniteScroll]);

  // 6. 分页变化处理函数
  const handlePageChange = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, page }));
    fetchCategories(page);
    // 滚动到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [fetchCategories]);

  // 7. 加载更多数据（用于无限滚动）
  const loadMore = useCallback(() => {
    const nextPage = pagination.page + 1;
    if (nextPage <= pagination.pages) {
      setPagination(prev => ({ ...prev, page: nextPage }));
      fetchCategories(nextPage);
    }
  }, [pagination.page, pagination.pages, fetchCategories]);

  // 8. 无限滚动钩子
  const { observerRef } = useInfiniteScroll(loadMore, {
    hasMore,
    isLoading,
    threshold: 200
  });

  // 9. useEffect 调用
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      setColumnCount(getColumnCount(window.innerWidth));
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 当筛选条件变化时，重置到第一页并加载数据
  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchCategories(1);
  }, [selectedCategory, selectedTags, sortBy, fetchCategories]);

  if (isLoading && pagination.page === 1) {
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
    <div  className="space-y-6">
      <FixedSizeGrid
        columnCount={columnCount}
        columnWidth={CARD_WIDTH}
        height={rowCount * rowHeight}
        rowCount={rowCount}
        rowHeight={rowHeight}
        width={windowWidth}
        style={{ overflow: 'hidden' }}
        children={CategoryCard}
      />
      
      {/* 加载更多指示器 - 用于无限滚动 */}
      {infiniteScroll && (
        <div ref={observerRef} className="w-full h-20 flex items-center justify-center">
          {isLoading && hasMore && (
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
          )}
        </div>
      )}
      
      {/* 传统分页组件 */}
      {!infiniteScroll && pagination.pages > 1 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.pages}
          onPageChange={handlePageChange}
          className="pt-4"
        />
      )}
    </div>
  );
} 
