"use client";

import React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) {
  // 如果只有一页，不显示分页
  if (totalPages <= 1) return null;

  // 计算要显示的页码
  const renderPageNumbers = () => {
    const pages = [];
    
    // 始终显示第一页
    pages.push(
      <PaginationButton
        key={1}
        page={1}
        isActive={currentPage === 1}
        onClick={() => onPageChange(1)}
      />
    );

    // 如果当前页大于3，显示省略号
    if (currentPage > 3) {
      pages.push(
        <PaginationEllipsis key="ellipsis-1" />
      );
    }

    // 当前页前后各显示一页
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      if (i === 1 || i === totalPages) continue; // 跳过第一页和最后一页，因为它们已经单独处理
      
      pages.push(
        <PaginationButton
          key={i}
          page={i}
          isActive={currentPage === i}
          onClick={() => onPageChange(i)}
        />
      );
    }

    // 如果当前页小于总页数-2，显示省略号
    if (currentPage < totalPages - 2) {
      pages.push(
        <PaginationEllipsis key="ellipsis-2" />
      );
    }

    // 如果有多于一页，显示最后一页
    if (totalPages > 1) {
      pages.push(
        <PaginationButton
          key={totalPages}
          page={totalPages}
          isActive={currentPage === totalPages}
          onClick={() => onPageChange(totalPages)}
        />
      );
    }

    return pages;
  };

  return (
    <div className={cn("flex items-center justify-center space-x-2", className)}>
      <PaginationPrevButton
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      />
      
      {renderPageNumbers()}
      
      <PaginationNextButton
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      />
    </div>
  );
}

interface PaginationButtonProps {
  page: number;
  isActive?: boolean;
  onClick: () => void;
}

function PaginationButton({ page, isActive, onClick }: PaginationButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium transition-colors",
        isActive
          ? "bg-purple-600 text-white"
          : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
      )}
      onClick={onClick}
    >
      {page}
    </button>
  );
}

function PaginationPrevButton(
  { onClick, disabled }: { onClick: () => void; disabled?: boolean }
) {
  return (
    <button
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium transition-colors",
        disabled
          ? "bg-gray-800 text-gray-500 cursor-not-allowed"
          : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
      )}
      onClick={onClick}
      disabled={disabled}
    >
      <ChevronLeft className="h-4 w-4" />
      <span className="sr-only">上一页</span>
    </button>
  );
}

function PaginationNextButton(
  { onClick, disabled }: { onClick: () => void; disabled?: boolean }
) {
  return (
    <button
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium transition-colors",
        disabled
          ? "bg-gray-800 text-gray-500 cursor-not-allowed"
          : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
      )}
      onClick={onClick}
      disabled={disabled}
    >
      <ChevronRight className="h-4 w-4" />
      <span className="sr-only">下一页</span>
    </button>
  );
}

function PaginationEllipsis() {
  return (
    <div className="inline-flex h-9 w-9 items-center justify-center">
      <MoreHorizontal className="h-4 w-4 text-gray-400" />
      <span className="sr-only">更多页</span>
    </div>
  );
} 
