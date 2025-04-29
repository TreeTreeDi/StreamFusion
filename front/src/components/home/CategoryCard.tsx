// 首页分类卡片组件抽离

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

// 动画变量（与 page.tsx 保持一致）
const cardHover = {
  rest: { scale: 1, boxShadow: "0px 0px 0px rgba(0,0,0,0.1)" },
  hover: { 
    scale: 1.05,
    boxShadow: "0px 10px 20px rgba(0,0,0,0.2), 0 0 15px rgba(147, 51, 234, 0.3)",
    transition: { type: "spring", stiffness: 300, damping: 20 }
  }
};

const imageHover = {
  rest: { y: 0 },
  hover: {
    y: -5,
    transition: { type: "spring", stiffness: 300, damping: 20 }
  }
};

export interface Category {
  id: string;
  name: string;
  viewers: string;
  coverUrl: string;
  tags: string[];
}

interface CategoryCardProps {
  category: Category;
}

export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <motion.div
      whileHover="hover"
      initial="rest"
      animate="rest"
      variants={cardHover}
    >
      <Link href={`/directory/category/${category.id}`} className="group block h-full bg-card rounded-xl overflow-hidden shadow-sm transition-all hover:shadow-lg">
        {/* Wrap Image with motion.div for hover effect */}
        <motion.div
          className="aspect-[3/4] rounded-t-xl overflow-hidden relative"
          variants={imageHover}
        >
          <Image
            src={category.coverUrl}
            alt={`${category.name} 封面`}
            width={150}
            height={200}
            className="object-cover w-full h-full"
          />
          {/* Keep overlays inside the motion div */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md">
            {category.viewers} 名观众
          </div>
        </motion.div>
        {/* Reduce padding */}
        <div className="p-2">
          <h3 className="text-sm font-semibold truncate text-foreground group-hover:text-primary transition-colors">{category.name}</h3>
          <div className="mt-2 flex flex-wrap gap-1">
            {category.tags.map(tag => (
              <span key={tag} className="text-xs bg-muted/70 text-muted-foreground px-1.5 py-0.5 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
