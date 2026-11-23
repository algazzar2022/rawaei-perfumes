'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Sparkles,
  Flame,
  Gift,
  Home,
  Droplets,
  HeartHandshake,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import { CategoryDto } from '@/lib/types';
import { useLanguage } from '@/context/LanguageContext';

interface CategoriesSectionProps {
  categories: CategoryDto[];
}

export default function CategoriesSection({ categories }: CategoriesSectionProps) {
  const { language, direction, t } = useLanguage();
  const isRtl = direction === 'rtl';

  // Fallback icon resolver
  const getIcon = (iconName?: string | null) => {
    switch (iconName) {
      case 'Flame':
        return <Flame className="w-6 h-6 text-[#DFC27A]" />;
      case 'Gift':
        return <Gift className="w-6 h-6 text-[#DFC27A]" />;
      case 'Home':
        return <Home className="w-6 h-6 text-[#DFC27A]" />;
      case 'Droplets':
        return <Droplets className="w-6 h-6 text-[#DFC27A]" />;
      case 'HeartHandshake':
        return <HeartHandshake className="w-6 h-6 text-[#DFC27A]" />;
      case 'Sparkles':
      default:
        return <Sparkles className="w-6 h-6 text-[#DFC27A]" />;
    }
  };

  const activeCategories = categories.filter((c) => c.isActive);

  return (
    <section className="py-12 sm:py-20 bg-[#FAF7F2] relative overflow-hidden">
      {/* Decorative Warm Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#C49A45]/8 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-14 space-y-2.5 sm:space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C49A45]/15 border border-[#C49A45]/30 text-[11px] sm:text-xs font-bold text-[#98702B]">
            <Sparkles className="w-3.5 h-3.5 text-[#C49A45]" />
            <span>{t('عالم الروائح الملكية', 'Royal Scent Categories')}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-[#171717]">
            {t('تصنيفات روائع الفاخرة', 'Exquisite Collections')}
          </h2>
          <p className="text-xs sm:text-base text-neutral-600 font-normal leading-relaxed">
            {t(
              'اختر من بين تشكيلاتنا الست المتفردة المصنوعة بعناية لتناسب كل الأذواق والمناسبات',
              'Explore our six distinguished categories crafted with passion for every moment'
            )}
          </p>
        </div>

        {/* 6 Categories Grid: 2-columns on mobile, 2 on tablet, 3 on desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 lg:gap-8">
          {activeCategories.map((category) => {
            const name = language === 'ar' ? category.nameAr : category.nameEn;
            const imgUrl =
              category.image ||
              'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=800';

            return (
              <Link
                key={category.id}
                href={category.slug === 'perfumes' ? '/perfumes' : `/category/${category.slug}`}
                className="group relative rounded-2xl sm:rounded-3xl overflow-hidden border border-[#C49A45]/30 hover:border-[#C49A45] transition-all duration-300 flex flex-col justify-end h-[210px] sm:h-[300px] lg:h-[380px] p-3.5 sm:p-5 lg:p-6 shadow-md hover:shadow-xl"
              >
                {/* Background Image with Hover Scale */}
                <div className="absolute inset-0">
                  <Image
                    src={imgUrl}
                    alt={name}
                    fill
                    className="object-cover object-center group-hover:scale-110 transition-transform duration-700 ease-out"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  {/* Subtle Gradient Overlays */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/15" />
                  <div className="absolute inset-0 bg-[#C49A45]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* Floating Category Icon */}
                <div className="absolute top-2.5 right-2.5 sm:top-5 sm:right-5 w-8 h-8 sm:w-11 sm:h-11 lg:w-12 lg:h-12 rounded-xl sm:rounded-2xl bg-black/55 backdrop-blur-md border border-[#C49A45]/40 flex items-center justify-center group-hover:bg-[#C49A45] group-hover:text-black group-hover:border-transparent transition-all duration-300 shadow-md [&>svg]:w-4 [&>svg]:h-4 sm:[&>svg]:w-5 sm:[&>svg]:h-5 lg:[&>svg]:w-6 lg:[&>svg]:h-6">
                  {getIcon(category.icon)}
                </div>

                {/* Bottom Content Info */}
                <div className="relative z-10 space-y-1 sm:space-y-2.5">
                  <span className="text-[10px] sm:text-xs font-bold tracking-wider text-[#DFC27A] uppercase truncate block">
                    {category.nameEn}
                  </span>
                  <h3 className="text-sm sm:text-xl lg:text-2xl font-black text-white group-hover:text-[#DFC27A] transition-colors leading-tight line-clamp-1">
                    {name}
                  </h3>
                  <div className="pt-0.5 sm:pt-1 hidden sm:flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-bold text-white group-hover:text-[#DFC27A]">
                    <span>{t('تصفح التشكيلة', 'Explore Category')}</span>
                    {isRtl ? (
                      <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:-translate-x-1.5 transition-transform" />
                    ) : (
                      <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1.5 transition-transform" />
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
