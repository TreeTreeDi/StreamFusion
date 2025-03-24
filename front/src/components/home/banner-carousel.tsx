"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ExternalLink, ChevronRight } from "lucide-react";
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import { fetchBanners } from "@/lib/api-service";
import { Banner } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

// 默认的轮播图数据，当API请求失败时使用
const DEFAULT_BANNERS: Banner[] = [
  {
    _id: "default-1",
    title: "探索直播平台",
    description: "发现您最喜爱的内容",
    imageUrl: "/images/banners/default-1.jpg",
    targetUrl: "/browse",
    isExternal: false,
    priority: 1,
    isActive: true,
  },
  {
    _id: "default-2",
    title: "开始您的直播之旅",
    description: "立即加入我们的社区",
    imageUrl: "/images/banners/default-2.jpg",
    targetUrl: "/dashboard",
    isExternal: false,
    priority: 2,
    isActive: true,
  }
];

export const BannerCarousel = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadBanners = async () => {
      try {
        setIsLoading(true);
        const response = await fetchBanners();
        
        if (response.success && response.data && response.data.length > 0) {
          // 按照优先级排序
          const sortedBanners = response.data.sort((a: Banner, b: Banner) => a.priority - b.priority);
          setBanners(sortedBanners);
        } else {
          // 如果没有数据或请求失败，使用默认轮播图
          setBanners(DEFAULT_BANNERS);
        }
      } catch (error) {
        console.error("加载轮播图数据失败:", error);
        setBanners(DEFAULT_BANNERS);
      } finally {
        setIsLoading(false);
      }
    };

    loadBanners();
  }, []);

  if (isLoading) {
    return (
      <div className="w-full h-[300px] rounded-xl overflow-hidden">
        <Skeleton className="w-full h-full" />
      </div>
    );
  }

  return (
    <Carousel
      opts={{
        align: 'start',
        loop: true,
      }}
      className="w-full"
    >
      <CarouselContent>
        {banners.map((banner) => (
          <CarouselItem key={banner._id} className="md:basis-4/5 lg:basis-3/4">
            {banner.isExternal ? (
              <a
                href={banner.targetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full h-full"
              >
                <BannerCard banner={banner} />
              </a>
            ) : (
              <Link href={banner.targetUrl} className="block w-full h-full">
                <BannerCard banner={banner} />
              </Link>
            )}
          </CarouselItem>
        ))}
      </CarouselContent>
      <div className="flex justify-end gap-2 mt-4 px-4">
        <CarouselPrevious className="static transform-none" />
        <CarouselNext className="static transform-none" />
      </div>
    </Carousel>
  );
};

interface BannerCardProps {
  banner: Banner;
}

const BannerCard = ({ banner }: BannerCardProps) => {
  const { title, description, imageUrl, targetUrl, isExternal } = banner;

  const content = (
    <div className="relative w-full aspect-[21/9] overflow-hidden rounded-xl">
      <Image
        src={imageUrl}
        alt={title}
        fill
        className="object-cover transition-transform duration-300 hover:scale-105"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent flex flex-col justify-end p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">{title}</h2>
        <p className="text-sm text-white/90 max-w-md mb-4">{description}</p>
        <div className="flex items-center">
          <span className="text-sm font-medium mr-2">
            {isExternal ? "访问网站" : "了解更多"}
          </span>
          {isExternal ? <ExternalLink size={16} /> : <ChevronRight size={16} />}
        </div>
      </div>
    </div>
  );

  if (isExternal) {
    return (
      <a
        href={targetUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full"
      >
        {content}
      </a>
    );
  }

  return (
    <Link href={targetUrl} className="block w-full">
      {content}
    </Link>
  );
}; 
