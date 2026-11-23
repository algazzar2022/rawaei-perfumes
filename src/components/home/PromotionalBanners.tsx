'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { BannerDto } from '@/lib/types';
import { useLanguage } from '@/context/LanguageContext';

interface PromoBannersProps {
  initialBanners?: BannerDto[];
}

export default function PromotionalBanners({ initialBanners }: PromoBannersProps) {
  const { language, direction, t } = useLanguage();
  const [banners, setBanners] = useState<BannerDto[]>(initialBanners || []);

  useEffect(() => {
    async function fetchBanners() {
      try {
        const res = await fetch('/api/banners');
        const data = await res.json();
        if (data.banners) setBanners(data.banners);
      } catch (err) {
        console.error('Failed to load promotional banners', err);
      }
    }
    if (!initialBanners) {
      fetchBanners();
    }
  }, [initialBanners]);

  const wideBanner = banners.find((b) => b.type === 'PROMO_WIDE' && b.isActive);
  const smallBanner1 = banners.find((b) => b.type === 'PROMO_SMALL_1' && b.isActive);
  const smallBanner2 = banners.find((b) => b.type === 'PROMO_SMALL_2' && b.isActive);

  if (!wideBanner && !smallBanner1 && !smallBanner2) {
    return null;
  }

  const isRtl = direction === 'rtl';

  return (
    <section className="py-12 sm:py-20 bg-[#FAF7F2] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 items-stretch">
          {/* 1. Main Wide Banner */}
          {wideBanner && (
            <Link
              href={wideBanner.link || '/category/sets-gifts'}
              className="group relative rounded-2xl sm:rounded-3xl overflow-hidden border border-[#C49A45]/30 hover:border-[#C49A45] transition-all duration-500 shadow-md hover:shadow-xl min-h-[300px] sm:min-h-[400px] lg:min-h-full flex flex-col justify-end p-5 sm:p-8 lg:p-10"
            >
              <div className="absolute inset-0">
                <Image
                  src={wideBanner.desktopImage || 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=1200'}
                  alt={wideBanner.titleAr || 'عرض روائع'}
                  fill
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
                <div className="absolute inset-0 bg-[#C49A45]/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              <div className="relative z-10 space-y-2.5 sm:space-y-4">
                <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 rounded-full bg-[#C49A45] text-black text-[11px] sm:text-xs font-black tracking-wide">
                  <Sparkles className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                  <span>{t('عرض الموسم الحصري', 'Exclusive Season Offer')}</span>
                </div>

                <h3 className="text-xl sm:text-3xl lg:text-4xl font-black text-white group-hover:text-[#DFC27A] transition-colors leading-tight">
                  {language === 'ar' ? wideBanner.titleAr : wideBanner.titleEn || wideBanner.titleAr}
                </h3>

                {wideBanner.subtitleAr && (
                  <p className="text-xs sm:text-base text-neutral-200 max-w-md leading-relaxed line-clamp-2 sm:line-clamp-none">
                    {language === 'ar' ? wideBanner.subtitleAr : wideBanner.subtitleEn || wideBanner.subtitleAr}
                  </p>
                )}

                <div className="pt-1 sm:pt-2">
                  <span className="gold-button inline-flex items-center gap-2 px-5 sm:px-7 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-bold shadow-lg">
                    <span>{language === 'ar' ? wideBanner.buttonTextAr || 'احصل على العرض' : wideBanner.buttonTextEn || 'Claim Offer'}</span>
                    {isRtl ? <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                  </span>
                </div>
              </div>
            </Link>
          )}

          {/* 2. Two Smaller Banners (Grid 2 cols on tablet, column on mobile/desktop) */}
          <div className="flex flex-col sm:grid sm:grid-cols-2 lg:flex lg:flex-col gap-4 sm:gap-6">
            {smallBanner1 && (
              <Link
                href={smallBanner1.link || '/category/makhmariyat'}
                className="group relative rounded-2xl sm:rounded-3xl overflow-hidden border border-[#C49A45]/25 hover:border-[#C49A45] transition-all duration-500 shadow-md hover:shadow-xl h-[190px] sm:h-[240px] lg:h-[260px] flex flex-col justify-end p-4 sm:p-6 lg:p-7"
              >
                <div className="absolute inset-0">
                  <Image
                    src={smallBanner1.desktopImage || 'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?q=80&w=800'}
                    alt={smallBanner1.titleAr || 'مخمريات روائع'}
                    fill
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/65 to-black/20" />
                </div>

                <div className="relative z-10 space-y-1.5 sm:space-y-2">
                  <span className="text-[10px] sm:text-[11px] font-bold tracking-wider text-[#DFC27A] uppercase truncate block">
                    {smallBanner1.titleEn}
                  </span>
                  <h4 className="text-lg sm:text-2xl font-black text-white group-hover:text-[#DFC27A] transition-colors leading-tight">
                    {language === 'ar' ? smallBanner1.titleAr : smallBanner1.titleEn}
                  </h4>
                  {smallBanner1.subtitleAr && (
                    <p className="text-[11px] sm:text-xs text-neutral-200 line-clamp-1">
                      {language === 'ar' ? smallBanner1.subtitleAr : smallBanner1.subtitleEn}
                    </p>
                  )}
                  <div className="pt-0.5 sm:pt-1 inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-[#DFC27A] group-hover:text-white">
                    <span>{language === 'ar' ? smallBanner1.buttonTextAr || 'تسوق الآن' : smallBanner1.buttonTextEn || 'Shop Now'}</span>
                    {isRtl ? <ArrowLeft className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> : <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
                  </div>
                </div>
              </Link>
            )}

            {smallBanner2 && (
              <Link
                href={smallBanner2.link || '/category/home-fragrances'}
                className="group relative rounded-2xl sm:rounded-3xl overflow-hidden border border-[#C49A45]/25 hover:border-[#C49A45] transition-all duration-500 shadow-md hover:shadow-xl h-[190px] sm:h-[240px] lg:h-[260px] flex flex-col justify-end p-4 sm:p-6 lg:p-7"
              >
                <div className="absolute inset-0">
                  <Image
                    src={smallBanner2.desktopImage || 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?q=80&w=800'}
                    alt={smallBanner2.titleAr || 'معطرات روائع'}
                    fill
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/65 to-black/20" />
                </div>

                <div className="relative z-10 space-y-1.5 sm:space-y-2">
                  <span className="text-[10px] sm:text-[11px] font-bold tracking-wider text-[#DFC27A] uppercase truncate block">
                    {smallBanner2.titleEn}
                  </span>
                  <h4 className="text-lg sm:text-2xl font-black text-white group-hover:text-[#DFC27A] transition-colors leading-tight">
                    {language === 'ar' ? smallBanner2.titleAr : smallBanner2.titleEn}
                  </h4>
                  {smallBanner2.subtitleAr && (
                    <p className="text-[11px] sm:text-xs text-neutral-200 line-clamp-1">
                      {language === 'ar' ? smallBanner2.subtitleAr : smallBanner2.subtitleEn}
                    </p>
                  )}
                  <div className="pt-0.5 sm:pt-1 inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-[#DFC27A] group-hover:text-white">
                    <span>{language === 'ar' ? smallBanner2.buttonTextAr || 'استكشف الروائح' : smallBanner2.buttonTextEn || 'Explore Scents'}</span>
                    {isRtl ? <ArrowLeft className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> : <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
                  </div>
                </div>
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
