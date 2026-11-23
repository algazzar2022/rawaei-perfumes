'use client';

import React, { useState, useMemo } from 'react';
import { SlidersHorizontal, ArrowUpDown, RotateCcw, Sparkles } from 'lucide-react';
import ProductCard from './ProductCard';
import { ProductDto } from '@/lib/types';
import { useLanguage } from '@/context/LanguageContext';

interface CatalogProps {
  titleAr: string;
  titleEn: string;
  subtitleAr: string;
  subtitleEn: string;
  badgeAr?: string;
  badgeEn?: string;
  initialProducts: ProductDto[];
  fixedGender?: 'HIM' | 'HER' | 'UNISEX';
}

export default function ProductCatalogView({
  titleAr,
  titleEn,
  subtitleAr,
  subtitleEn,
  badgeAr,
  badgeEn,
  initialProducts,
  fixedGender,
}: CatalogProps) {
  const { language, t } = useLanguage();

  // Filter States
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<number | 'ALL'>('ALL');
  const [selectedSort, setSelectedSort] = useState<string>('latest');
  const [selectedGender, setSelectedGender] = useState<string>(fixedGender || 'ALL');

  // Bottle sizes available
  const availableSizes = [50, 75, 100, 150, 200];

  // Filtering & Sorting Logic
  const filteredProducts = useMemo(() => {
    let result = [...initialProducts];

    // Filter by Gender if not fixed
    if (fixedGender) {
      result = result.filter((p) => p.gender === fixedGender);
    } else if (selectedGender !== 'ALL') {
      result = result.filter((p) => p.gender === selectedGender);
    }

    // Filter by Price
    if (minPrice !== '') {
      const min = parseFloat(minPrice);
      if (!isNaN(min)) {
        result = result.filter((p) => p.price >= min);
      }
    }
    if (maxPrice !== '') {
      const max = parseFloat(maxPrice);
      if (!isNaN(max)) {
        result = result.filter((p) => p.price <= max);
      }
    }

    // Filter by Size (ml)
    if (selectedSize !== 'ALL') {
      result = result.filter((p) => {
        const hasSize = p.sizes?.some((s) => s.sizeMl === selectedSize);
        return hasSize || p.volumeMl === selectedSize;
      });
    }

    // Sort
    if (selectedSort === 'price_asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (selectedSort === 'price_desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (selectedSort === 'best_seller') {
      result.sort((a, b) => b.rating - a.rating);
    } else {
      // Latest
      result.sort(
        (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
    }

    return result;
  }, [initialProducts, fixedGender, selectedGender, minPrice, maxPrice, selectedSize, selectedSort]);

  const resetFilters = () => {
    setMinPrice('');
    setMaxPrice('');
    setSelectedSize('ALL');
    setSelectedSort('latest');
    if (!fixedGender) setSelectedGender('ALL');
  };

  const isFiltered =
    minPrice !== '' ||
    maxPrice !== '' ||
    selectedSize !== 'ALL' ||
    selectedSort !== 'latest' ||
    (!fixedGender && selectedGender !== 'ALL');

  return (
    <div className="min-h-screen py-6 sm:py-12 bg-[#F8F5EF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden p-5 sm:p-10 lg:p-12 mb-6 sm:mb-12 bg-white/90 border border-[#C49A45]/30 text-center shadow-sm">
          <div className="relative z-10 max-w-2xl mx-auto space-y-2.5 sm:space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C49A45]/15 border border-[#C49A45]/30 text-[11px] sm:text-xs font-bold text-[#98702B]">
              <Sparkles className="w-3.5 h-3.5 text-[#C49A45]" />
              <span>{t(badgeAr || 'مجموعة روائع الحصرية', badgeEn || 'Exclusive Collection')}</span>
            </div>
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#171717]">
              {t(titleAr, titleEn)}
            </h1>
            <p className="text-xs sm:text-base text-neutral-600 leading-relaxed">
              {t(subtitleAr, subtitleEn)}
            </p>
          </div>
          {/* Subtle background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-40 bg-[#C49A45]/10 blur-[90px] pointer-events-none" />
        </div>

        {/* Filter & Sort Bar */}
        <div className="bg-white/95 rounded-xl sm:rounded-2xl p-3.5 sm:p-5 mb-6 sm:mb-10 border border-[#C49A45]/25 shadow-sm space-y-3 sm:space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-2 text-[#171717] font-bold text-xs sm:text-sm">
              <SlidersHorizontal className="w-4 h-4 text-[#C49A45]" />
              <span>{t('تصفية وترتيب النتائج', 'Filter & Sort')}</span>
              <span className="text-[11px] sm:text-xs text-neutral-500 font-normal">
                ({filteredProducts.length} {t('منتج', 'products')})
              </span>
            </div>

            {isFiltered && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 font-semibold transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t('إعادة تعيين الفلاتر', 'Reset filters')}</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-3 border-t border-[#C49A45]/15">
            {/* 1. Sort Options */}
            <div className="space-y-1.5">
              <label className="text-xs text-neutral-700 font-semibold flex items-center gap-1">
                <ArrowUpDown className="w-3 h-3 text-[#C49A45]" />
                {t('ترتيب حسب:', 'Sort By:')}
              </label>
              <select
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
                className="w-full bg-[#FAF7F2] border border-[#C49A45]/30 rounded-xl px-3 py-2 text-xs text-[#171717] focus:outline-none focus:border-[#C49A45]"
              >
                <option value="latest">{t('الأحدث أولاً', 'Latest')}</option>
                <option value="price_asc">{t('السعر: من الأقل للأعلى', 'Price: Low to High')}</option>
                <option value="price_desc">{t('السعر: من الأعلى للأقل', 'Price: High to Low')}</option>
                <option value="best_seller">{t('الأعلى تقييماً / الأكثر طلباً', 'Best Sellers / Top Rated')}</option>
              </select>
            </div>

            {/* 2. Bottle Size Filter (ml) */}
            <div className="space-y-1.5">
              <label className="text-xs text-neutral-700 font-semibold">
                {t('حجم الزجاجة (مل):', 'Bottle Size (ml):')}
              </label>
              <select
                value={selectedSize}
                onChange={(e) =>
                  setSelectedSize(e.target.value === 'ALL' ? 'ALL' : parseInt(e.target.value))
                }
                className="w-full bg-[#FAF7F2] border border-[#C49A45]/30 rounded-xl px-3 py-2 text-xs text-[#171717] focus:outline-none focus:border-[#C49A45]"
              >
                <option value="ALL">{t('جميع الأحجام', 'All Sizes')}</option>
                {availableSizes.map((s) => (
                  <option key={s} value={s}>
                    {s} {t('مل', 'ml')}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Price Range From & To */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs text-neutral-700 font-semibold">
                {t('نطاق السعر (ج.م):', 'Price Range (EGP):')}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder={t('من (الحد الأدنى)', 'Min')}
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-1/2 bg-[#FAF7F2] border border-[#C49A45]/30 rounded-xl px-3 py-2 text-xs text-[#171717] focus:outline-none focus:border-[#C49A45]"
                />
                <span className="text-neutral-400 text-xs">-</span>
                <input
                  type="number"
                  placeholder={t('إلى (الحد الأقصى)', 'Max')}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-1/2 bg-[#FAF7F2] border border-[#C49A45]/30 rounded-xl px-3 py-2 text-xs text-[#171717] focus:outline-none focus:border-[#C49A45]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center max-w-md mx-auto my-12 space-y-4 border border-[#C49A45]/30 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-[#C49A45]/10 border border-[#C49A45]/30 mx-auto flex items-center justify-center text-[#C49A45]">
              <SlidersHorizontal className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-[#171717]">
              {t('لا توجد منتجات مطابقة للفلاتر', 'No products matched your filters')}
            </h3>
            <p className="text-xs text-neutral-500">
              {t(
                'يرجى تجربة تعديل معايير البحث أو تصفير الفلاتر لعرض كافة المنتجات.',
                'Try adjusting your search criteria or reset filters to view all products.'
              )}
            </p>
            <button
              onClick={resetFilters}
              className="gold-button px-6 py-2 rounded-full text-xs font-bold shadow-md"
            >
              {t('إعادة تعيين الفلاتر', 'Reset filters')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
