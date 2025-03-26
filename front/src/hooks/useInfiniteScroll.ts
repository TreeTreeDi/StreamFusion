import { useState, useEffect, useRef, useCallback } from 'react';

interface UseInfiniteScrollOptions {
  // 距离底部多少像素时触发加载
  threshold?: number;
  // 是否有更多数据可加载
  hasMore: boolean;
  // 是否正在加载
  isLoading: boolean;
}

/**
 * 无限滚动钩子
 * @param loadMore 加载更多数据的回调函数
 * @param options 配置选项
 * @returns 包含观察元素ref的对象
 */
export function useInfiniteScroll(
  loadMore: () => void,
  options: UseInfiniteScrollOptions
) {
  const { threshold = 300, hasMore, isLoading } = options;
  
  // 创建一个引用，用于观察的元素（通常是列表底部的元素）
  const observerRef = useRef<HTMLDivElement | null>(null);
  
  // IntersectionObserver回调
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      
      // 如果元素进入视口，并且有更多数据，且当前不在加载状态，则加载更多
      // isIntersecting ：布尔值，表示目标元素是否与根元素（通常是视口）相交。这是最常用的属性，用于判断元素是否可见。
      if (entry.isIntersecting && hasMore && !isLoading) {
        loadMore();
      }
    },
    [loadMore, hasMore, isLoading]
  );

  // 设置观察者
  // 当hasMore 或者 isLoading 发生变化时，重新设置观察者
  useEffect(() => {
    // 当前观察的元素
    const currentElement = observerRef.current;
    
    // 如果没有更多数据或者正在加载，则不需要观察
    if (!hasMore || isLoading || !currentElement) {
      return;
    }

    // 创建IntersectionObserver 浏览器 API
    const observer = new IntersectionObserver(handleObserver, {
      rootMargin: `0px 0px ${threshold}px 0px`, // 底部阈值
    });

    // 开始观察元素
    observer.observe(currentElement);

    // 清理函数
    return () => {
      if (currentElement) {
        observer.unobserve(currentElement);
      }
    };
  }, [handleObserver, hasMore, isLoading, threshold]);

  return { observerRef };
} 
