'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function GenderSections() {
  const { direction, t } = useLanguage();
  const isRtl = direction === 'rtl';

  // The 3 curated fragrance worlds matching Image 2
  const collections = [
    {
      id: 'for-him',
      num: '01',
      titleAr: 'For Him',
      titleEn: 'For Him',
      tagAr: 'تشكيلة رجالية',
      tagEn: 'COLLECTION',
      scentsAr: '111 عطر فاخر',
      scentsEn: '111 SCENTS',
      link: '/perfumes/for-him',
      // High-resolution portrait of a handsome gentleman in beige knit polo holding luxury perfume bottle
      image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1200&auto=format&fit=crop',
    },
    {
      id: 'for-her',
      num: '02',
      titleAr: 'For Her',
      titleEn: 'For Her',
      tagAr: 'تشكيلة نسائية',
      tagEn: 'COLLECTION',
      scentsAr: '80 عطر فاخر',
      scentsEn: '80 SCENTS',
      link: '/perfumes/for-her',
      // High-resolution portrait of an elegant woman in black attire holding luxury perfume bottle
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1200&auto=format&fit=crop',
    },
    {
      id: 'unisex',
      num: '03',
      titleAr: 'Unisex',
      titleEn: 'Unisex',
      tagAr: 'تشكيلة للجنسين',
      tagEn: 'COLLECTION',
      scentsAr: '62 عطر فاخر',
      scentsEn: '62 SCENTS',
      link: '/perfumes/unisex',
      // High-resolution portrait of the couple together, holding their luxury perfume bottles in an affectionate, respectful pose
      image: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=1200&auto=format&fit=crop',
    },
  ];

  return (
    <section className="py-12 sm:py-20 bg-[#FAF7F2] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header matching Image 2 */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-14 space-y-2.5 sm:space-y-3">
          <div className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-bold text-[#98702B] uppercase tracking-[0.2em] sm:tracking-[0.25em]">
            <span className="w-5 sm:w-6 h-[1.5px] bg-[#C49A45]" />
            <span>{t('عوالم عطرية متفردة', 'CURATED FRAGRANCE WORLDS')}</span>
          </div>

          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-[#171717] tracking-tight">
            {t('استكشف تشكيلاتنا', 'Explore our collections')}
          </h2>

          <p className="text-xs sm:text-base text-neutral-600 font-normal max-w-xl mx-auto leading-relaxed">
            {t(
              'حكايات عطرية متفردة، صُممت لتجعل اختيار بصمتك العطرية تجربة استثنائية.',
              'Distinct scent stories, designed to make finding your signature feel effortless.'
            )}
          </p>

          <div className="pt-0.5 sm:pt-1 flex items-center justify-center gap-1.5 text-[10px] sm:text-[11px] font-bold text-[#98702B] uppercase tracking-widest">
            <span className="font-mono text-xs sm:text-sm font-black text-[#171717]">03</span>
            <span>{t('تشكيلات', 'COLLECTIONS')}</span>
          </div>
        </div>

        {/* 3 Luxury Cards: Horizontal touch-scroll snap on mobile, 3-column grid on tablet & desktop */}
        <div className="flex md:grid md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 overflow-x-auto md:overflow-visible pb-4 md:pb-0 snap-x snap-mandatory scrollbar-none no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
          {collections.map((item) => (
            <Link
              key={item.id}
              href={item.link}
              className="group relative w-[80vw] max-w-[320px] flex-shrink-0 md:w-auto md:flex-shrink md:max-w-none snap-center h-[420px] sm:h-[480px] lg:h-[560px] rounded-[24px] sm:rounded-[32px] overflow-hidden bg-[#EFECE6] border border-[#C49A45]/30 hover:border-[#C49A45] transition-all duration-500 shadow-md hover:shadow-2xl flex flex-col justify-between p-5 sm:p-7"
            >
              {/* Background Model Photo */}
              <div className="absolute inset-0">
                <Image
                  src={item.image}
                  alt={item.titleAr}
                  fill
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                  sizes="(max-width: 768px) 80vw, 33vw"
                />

                {/* Layered Gradient for Contrast and High Readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/10" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-transparent" />
              </div>

              {/* Top Badge: Number Indicator (01, 02, 03) */}
              <div className="relative z-10 flex items-center justify-between">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white flex items-center justify-center text-[11px] sm:text-xs font-black shadow-sm">
                  {item.num}
                </div>
              </div>

              {/* Bottom Overlay Content */}
              <div className="relative z-10 space-y-2 sm:space-y-3">
                {/* Collection subtitle */}
                <div className="flex items-center gap-2 text-[10px] sm:text-xs font-bold text-[#DFC27A] uppercase tracking-wider">
                  <span className="w-2.5 sm:w-3 h-[1px] bg-[#DFC27A]" />
                  <span>{t(item.tagAr, item.tagEn)}</span>
                </div>

                {/* Big bold Title */}
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white group-hover:text-[#DFC27A] transition-colors drop-shadow-md">
                  {item.titleAr}
                </h3>

                {/* Bottom Row: Scents Count + Pill Button */}
                <div className="pt-2 flex items-center justify-between gap-2 sm:gap-3 border-t border-white/15">
                  <span className="text-[10px] sm:text-xs font-bold text-[#DFC27A] uppercase tracking-wider">
                    {t(item.scentsAr, item.scentsEn)}
                  </span>

                  <span className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white/15 hover:bg-[#C49A45] text-white hover:text-black backdrop-blur-md border border-white/25 hover:border-[#C49A45] text-[11px] sm:text-xs font-bold transition-all shadow-md group-hover:scale-105">
                    <span>{t('استكشف التشكيلة', 'Explore collection')}</span>
                    {isRtl ? (
                      <ArrowLeft className="w-3 h-3 sm:w-3.5 sm:h-3.5 group-hover:-translate-x-1 transition-transform" />
                    ) : (
                      <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 group-hover:translate-x-1 transition-transform" />
                    )}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
