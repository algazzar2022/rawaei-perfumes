import React from 'react';
import prisma from '@/lib/prisma';
import HeroBanner from '@/components/home/HeroBanner';
import CategoriesSection from '@/components/home/CategoriesSection';
import GenderSections from '@/components/home/GenderSections';
import FeaturedProductsSection from '@/components/home/FeaturedProductsSection';
import PromotionalBanners from '@/components/home/PromotionalBanners';
import VideoReviewsSection from '@/components/home/VideoReviewsSection';

// Disable full static caching so admin changes appear immediately
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function HomePage() {
  // 1. Fetch Hero Banner with slides
  const heroBanner = await prisma.banner.findFirst({
    where: { type: 'HERO', isActive: true },
    include: {
      slides: {
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      },
    },
  });

  // 2. Fetch the 6 Core Categories
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  });

  // 3. Fetch Featured Products Section
  const featuredEntries = await prisma.featuredProduct.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
    include: {
      product: {
        include: {
          category: true,
          images: { orderBy: { sortOrder: 'asc' } },
          sizes: { orderBy: { sizeMl: 'asc' } },
        },
      },
    },
  });

  const featuredProducts = featuredEntries
    .map((e) => e.product)
    .filter((p) => p && p.isActive);

  // Featured Settings
  const titleAr = await prisma.siteSetting.findUnique({ where: { key: 'featured_section_title_ar' } });
  const titleEn = await prisma.siteSetting.findUnique({ where: { key: 'featured_section_title_en' } });
  const subtitleAr = await prisma.siteSetting.findUnique({ where: { key: 'featured_section_subtitle_ar' } });
  const subtitleEn = await prisma.siteSetting.findUnique({ where: { key: 'featured_section_subtitle_en' } });
  const sectionActive = await prisma.siteSetting.findUnique({ where: { key: 'featured_section_active' } });
  const sectionLimit = await prisma.siteSetting.findUnique({ where: { key: 'featured_products_limit' } });

  // 4. Fetch Promotional Banners
  const promoBanners = await prisma.banner.findMany({
    where: {
      type: { in: ['PROMO_WIDE', 'PROMO_SMALL_1', 'PROMO_SMALL_2'] },
      isActive: true,
    },
    orderBy: { sortOrder: 'asc' },
  });

  // 5. Fetch Influencer Video Reviews
  const videoReviews = await prisma.videoReview.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  });

  return (
    <div className="w-full">
      {/* 1. Hero Banner (Clean, No Text Clutter, Reduced Height) */}
      <HeroBanner initialBanner={heroBanner as any} />

      {/* 2. 6 Core Luxury Categories */}
      <CategoriesSection categories={categories as any} />

      {/* 3. Curated Fragrance Worlds: For Him, For Her, Unisex (Matching Image 2) */}
      <GenderSections />

      {/* 4. Featured Royal Products */}
      <FeaturedProductsSection
        initialProducts={featuredProducts as any}
        initialSettings={{
          titleAr: titleAr?.value || 'المختارات الملكية الأكثر تميزاً',
          titleEn: titleEn?.value || 'Featured Royal Masterpieces',
          subtitleAr: subtitleAr?.value || 'نخبة من أروع المنتجات المصممة لأصحاب الذوق الرفيع والباحثين عن التفرد',
          subtitleEn: subtitleEn?.value || 'Handpicked luxury fragrances for discerning connoisseurs',
          isActive: sectionActive?.value !== 'false',
          limit: sectionLimit ? parseInt(sectionLimit.value) : 8,
        }}
      />

      {/* 5. Promotional Banners (1 Wide + 2 Smaller Banners) */}
      <PromotionalBanners initialBanners={promoBanners as any} />

      {/* 6. Influencers & Real Video Reviews Section (Matching Image 1) - Right before footer */}
      <VideoReviewsSection initialReviews={videoReviews as any} />
    </div>
  );
}
