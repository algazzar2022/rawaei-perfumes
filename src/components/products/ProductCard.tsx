'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, Star, Eye, Check } from 'lucide-react';
import { ProductDto } from '@/lib/types';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { formatPrice } from '@/lib/utils';

interface ProductCardProps {
  product: ProductDto;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const { language, t } = useLanguage();
  const [isAdded, setIsAdded] = useState(false);

  const mainImage =
    product.images?.find((img) => img.isMain)?.url ||
    product.images?.[0]?.url ||
    '/logo.png';

  const title = language === 'ar' ? product.nameAr : product.nameEn;
  const defaultSize = product.sizes?.find((s) => s.isDefault) || product.sizes?.[0];
  const currentPrice = defaultSize ? defaultSize.price : product.price;
  const comparePrice = defaultSize?.comparePrice || product.compareAtPrice;

  const discountPercent =
    comparePrice && comparePrice > currentPrice
      ? Math.round(((comparePrice - currentPrice) / comparePrice) * 100)
      : null;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, defaultSize?.sizeMl || product.volumeMl, 1, currentPrice);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1600);
  };

  return (
    <div className="group relative rounded-2xl sm:rounded-[28px] overflow-hidden backdrop-blur-xl bg-gradient-to-b from-white/95 via-white/85 to-[#FAF7F2]/90 border border-[#C49A45]/30 hover:border-[#C49A45] transition-all duration-500 flex flex-col justify-between p-2.5 sm:p-4 shadow-[0_8px_30px_rgba(152,112,43,0.06)] hover:shadow-[0_20px_50px_rgba(196,154,69,0.22)]">
      {/* Subtle Glass Reflection Light Streak */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#C49A45]/10 rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-transform duration-700" />

      {/* Top Image Container */}
      <Link href={`/product/${product.slug}`} className="block relative w-full aspect-[4/5] rounded-xl sm:rounded-2xl overflow-hidden bg-[#FAF7F2] mb-2 sm:mb-4">
        {/* Main Image */}
        <Image
          src={mainImage}
          alt={title}
          fill
          className="object-cover object-center group-hover:scale-106 transition-all duration-700 ease-out"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />

        {/* Badges */}
        <div className="absolute top-2 right-2 sm:top-3 sm:right-3 flex flex-col gap-1 z-10">
          {discountPercent && (
            <span className="px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-red-600/90 backdrop-blur-md text-white text-[9px] sm:text-[11px] font-black tracking-wide shadow-md">
              -{discountPercent}%
            </span>
          )}
          {product.isFeatured && (
            <span className="px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-[#C49A45]/90 backdrop-blur-md text-white text-[9px] sm:text-[11px] font-bold shadow-md">
              {t('ملكي', 'Royal')}
            </span>
          )}
        </div>

        {/* Category or Gender Badge */}
        <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 z-10">
          <span className="px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[8px] sm:text-[10px] font-bold text-white uppercase shadow-sm">
            {product.category && product.category.slug !== 'perfumes'
              ? (language === 'ar' ? product.category.nameAr : product.category.nameEn)
              : (product.gender === 'HIM'
                ? t('رجالي', 'For Him')
                : product.gender === 'HER'
                ? t('نسائي', 'For Her')
                : t('للجنسين', 'Unisex'))}
          </span>
        </div>

        {/* Quick View Overlay Button */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <span className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/95 backdrop-blur-md text-[#171717] flex items-center justify-center shadow-lg transform translate-y-3 group-hover:translate-y-0 transition-transform">
            <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-[#98702B]" />
          </span>
        </div>
      </Link>

      {/* Details */}
      <div className="space-y-1.5 sm:space-y-2.5 flex-1 flex flex-col justify-between">
        <div>
          {/* Scent Family / Category */}
          <div className="flex items-center justify-between text-[10px] sm:text-xs text-neutral-500">
            <span className="truncate max-w-[90px] sm:max-w-none">{product.scentFamily || product.category?.nameAr || 'عطر فاخر'}</span>
            <div className="flex items-center gap-0.5 sm:gap-1 text-[#98702B]">
              <Star className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 fill-[#C49A45] text-[#C49A45]" />
              <span className="font-bold text-[#171717] text-[10px] sm:text-xs">{product.rating.toFixed(1)}</span>
            </div>
          </div>

          {/* Title */}
          <Link href={`/product/${product.slug}`} className="block mt-0.5 sm:mt-1">
            <h3 className="text-xs sm:text-base font-bold text-[#171717] group-hover:text-[#98702B] transition-colors line-clamp-1 leading-snug">
              {title}
            </h3>
          </Link>
        </div>

        {/* Price & Action */}
        <div className="pt-1.5 sm:pt-2 border-t border-[#C49A45]/20 flex items-center justify-between gap-1.5 sm:gap-2">
          <div>
            <div className="flex items-baseline gap-1 sm:gap-2">
              <span className="text-xs sm:text-base font-black text-[#98702B]">
                {formatPrice(currentPrice, language)}
              </span>
              {comparePrice && comparePrice > currentPrice && (
                <span className="text-[9px] sm:text-xs text-neutral-400 line-through">
                  {formatPrice(comparePrice, language)}
                </span>
              )}
            </div>
            <span className="text-[9px] sm:text-[11px] text-neutral-500 block">
              {defaultSize?.sizeMl || product.volumeMl || 100} {t('مل', 'ml')}
            </span>
          </div>

          {/* Quick Add Button */}
          <button
            onClick={handleQuickAdd}
            disabled={product.stock <= 0}
            className={`w-7 h-7 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all shadow-md flex-shrink-0 [&>svg]:w-3.5 [&>svg]:h-3.5 sm:[&>svg]:w-5 sm:[&>svg]:h-5 ${
              isAdded
                ? 'bg-emerald-600 text-white'
                : 'bg-[#C49A45] hover:bg-[#98702B] text-white hover:scale-105 active:scale-95'
            }`}
            title={t('إضافة سريعة للسلة', 'Add to Bag')}
          >
            {isAdded ? <Check /> : <ShoppingBag />}
          </button>
        </div>
      </div>
    </div>
  );
}
