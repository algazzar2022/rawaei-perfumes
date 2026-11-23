'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowLeft, ArrowRight } from 'lucide-react';
import ProductCard from '@/components/products/ProductCard';
import { ProductDto } from '@/lib/types';
import { useLanguage } from '@/context/LanguageContext';

interface FeaturedSectionProps {
  initialProducts?: ProductDto[];
  initialSettings?: {
    titleAr?: string;
    titleEn?: string;
    subtitleAr?: string;
    subtitleEn?: string;
    isActive?: boolean;
    limit?: number;
  };
}

export default function FeaturedProductsSection({
  initialProducts = [],
  initialSettings,
}: FeaturedSectionProps) {
  const { language, direction, t } = useLanguage();
  const [products, setProducts] = useState<ProductDto[]>(initialProducts);
  const [settings, setSettings] = useState(initialSettings || {
    titleAr: 'المختارات الملكية الأكثر تميزاً',
    titleEn: 'Featured Royal Masterpieces',
    subtitleAr: 'نخبة من أروع المنتجات المصممة لأصحاب الذوق الرفيع والباحثين عن التفرد',
    subtitleEn: 'Handpicked luxury fragrances for discerning connoisseurs',
    isActive: true,
    limit: 8,
  });

  useEffect(() => {
    async function loadFeatured() {
      try {
        const res = await fetch('/api/featured-products');
        const data = await res.json();
        if (data.products) setProducts(data.products);
        if (data.settings) setSettings(data.settings);
      } catch (err) {
        console.error('Failed to load featured products', err);
      }
    }
    if (!initialProducts.length) {
      loadFeatured();
    }
  }, [initialProducts]);

  if (settings.isActive === false) {
    return null;
  }

  const isRtl = direction === 'rtl';
  const displayProducts = products.slice(0, settings.limit || 8);

  if (displayProducts.length === 0) {
    return null;
  }

  return (
    <section id="featured-products" className="py-12 sm:py-24 bg-[#F8F5EF] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-14 gap-4 sm:gap-6">
          <div className="space-y-2.5 sm:space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C49A45]/15 border border-[#C49A45]/30 text-[11px] sm:text-xs font-bold text-[#98702B]">
              <Sparkles className="w-3.5 h-3.5 text-[#C49A45]" />
              <span>{t('مختارات حصرية', 'Exclusive Selection')}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-[#171717]">
              {language === 'ar' ? settings.titleAr : settings.titleEn || settings.titleAr}
            </h2>
            <p className="text-xs sm:text-base text-neutral-600 font-normal leading-relaxed">
              {language === 'ar' ? settings.subtitleAr : settings.subtitleEn || settings.subtitleAr}
            </p>
          </div>

          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 rounded-full border border-[#C49A45]/40 hover:border-[#C49A45] bg-white hover:bg-[#C49A45]/10 text-xs sm:text-sm font-bold text-[#98702B] transition-all shadow-sm self-start md:self-end"
          >
            <span>{t('استكشف المزيد من المنتجات', 'Explore More Products')}</span>
            {isRtl ? <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
          </Link>
        </div>

        {/* Products Grid: 2 columns on mobile, 2-3 on tablet, 4 on desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
          {displayProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
