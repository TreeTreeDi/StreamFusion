import { Suspense } from "react";

import { Welcome } from "@/components/home/welcome";
import { Categories } from "@/components/home/categories";
import { RecommendedChannels } from "@/components/home/recommended-channels";
import { Skeleton } from "@/components/ui/skeleton";

export default function HomePage() {
  return (
    <div className="h-full p-8 max-w-screen-2xl mx-auto">
      <Welcome />

      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4">为您推荐</h2>
        <Suspense fallback={<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{Array(3).fill(0).map((_, i) => <Skeleton key={i} className="aspect-video w-full rounded-xl" />)}</div>}>
          <RecommendedChannels />
        </Suspense>
      </div>
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4">浏览分类</h2>
        <Suspense fallback={<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">{Array(6).fill(0).map((_, i) => <Skeleton key={i} className="aspect-video w-full rounded-xl" />)}</div>}>
          <Categories />
        </Suspense>
      </div>
    </div>
  );
} 
