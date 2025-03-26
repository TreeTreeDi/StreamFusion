"use client";

import { useEffect, useState } from "react";
import { tagService } from "@/lib/services/tag.service";

interface TagFilterProps {
  selectedTags: string[];
  onToggleTag: (tag: string) => void;
}

interface Tag {
  _id: string;
  name: string;
  slug: string;
}

export default function TagFilter({ selectedTags, onToggleTag }: TagFilterProps) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        setIsLoading(true);
        const data = await tagService.getTags();
        setTags(data);
      } catch (error) {
        console.error("加载标签失败:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTags();
  }, []);

  return (
    <div className="flex flex-wrap gap-2">
      {isLoading ? (
        <div className="flex flex-wrap gap-2">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="bg-gray-700 h-7 w-20 rounded-full animate-pulse"></div>
          ))}
        </div>
      ) : (
        tags.map((tag) => (
          <button
            key={tag._id}
            onClick={() => onToggleTag(tag._id)}
            className={`tag ${
              selectedTags.includes(tag._id)
                ? "bg-purple-500"
                : "bg-gray-700 hover:bg-gray-600"
            } px-3 py-1 rounded-full text-sm cursor-pointer transition-colors`}
          >
            {tag.name}
          </button>
        ))
      )}
    </div>
  );
} 
