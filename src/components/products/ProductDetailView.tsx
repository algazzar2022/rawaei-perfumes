'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShoppingBag,
  Star,
  Check,
  ShieldCheck,
  Truck,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Clock,
  Wind,
  Layers,
  Heart,
  Share2,
  Droplets,
} from 'lucide-react';
import { ProductDto } from '@/lib/types';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { formatPrice } from '@/lib/utils';
import ProductCard from './ProductCard';

interface DetailProps {
  product: ProductDto;
  relatedProducts: ProductDto[];
}

export default function ProductDetailView({ product, relatedProducts }: DetailProps) {
  const { addItem, setIsCartOpen } = useCart();
  const { language, direction, t } = useLanguage();
  const router = useRouter();

  // Images state
  const images = product.images?.length
    ? product.images
    : [
        {
          id: '1',
          url: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=1000',
          isMain: true,
          sortOrder: 0,
        },
      ];
  const [selectedImage, setSelectedImage] = useState(images[0].url);

  // Sizes & Pricing state
  const sizes = product.sizes?.length
    ? product.sizes
    : [{ id: '1', sizeMl: product.volumeMl || 100, price: product.price, stock: product.stock, isDefault: true }];
  const defaultSize = sizes.find((s) => s.isDefault) || sizes[0];
  const [selectedSize, setSelectedSize] = useState(defaultSize);

  // Quantity state
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  const title = language === 'ar' ? product.nameAr : product.nameEn;
  const description = language === 'ar' ? product.descriptionAr : product.descriptionEn;

  const currentPrice = selectedSize.price;
  const comparePrice =
    selectedSize.comparePrice !== undefined && selectedSize.comparePrice !== null
      ? selectedSize.comparePrice
      : selectedSize.isDefault || sizes.length === 1
      ? product.compareAtPrice
      : null;
  const discountPercent =
    comparePrice && comparePrice > currentPrice
      ? Math.round(((comparePrice - currentPrice) / comparePrice) * 100)
      : null;

  const handleAddToCart = () => {
    addItem(product, selectedSize.sizeMl, quantity, currentPrice);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleBuyNow = () => {
    addItem(product, selectedSize.sizeMl, quantity, currentPrice);
    setIsCartOpen(false);
    router.push('/checkout');
  };

  const isRtl = direction === 'rtl';

  return (
    <div className="min-h-screen py-6 sm:py-12 bg-[#F8F5EF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[11px] sm:text-xs text-neutral-500 mb-4 sm:mb-8 overflow-x-auto whitespace-nowrap">
          <Link href="/" className="hover:text-[#98702B] transition-colors">
            {t('الرئيسية', 'Home')}
          </Link>
          <span>/</span>
          <Link href="/perfumes" className="hover:text-[#98702B] transition-colors">
            {t('العطور', 'Perfumes')}
          </Link>
          {product.category && (
            <>
              <span>/</span>
              <Link
                href={`/category/${product.category.slug}`}
                className="hover:text-[#98702B] transition-colors"
              >
                {language === 'ar' ? product.category.nameAr : product.category.nameEn}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-[#98702B] font-bold">{title}</span>
        </nav>

        {/* Main Product Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-16 items-start">
          {/* Left / Right: Image Gallery */}
          <div className="space-y-3 sm:space-y-4">
            {/* Big Active Image */}
            <div className="relative aspect-square w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-white border border-[#C49A45]/30 shadow-md">
              <Image
                src={selectedImage}
                alt={title}
                fill
                priority
                className="object-cover object-center"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />

              {discountPercent && (
                <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-red-600 text-white text-[11px] sm:text-xs font-black shadow-lg">
                  -{discountPercent}%
                </div>
              )}

              <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 z-10">
                <span className="px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[10px] sm:text-xs font-bold text-white uppercase">
                  {product.gender === 'HIM' ? t('رجالي', 'For Him') : product.gender === 'HER' ? t('نسائي', 'For Her') : t('للجنسين', 'Unisex')}
                </span>
              </div>
            </div>

            {/* Thumbnail Selector */}
            {images.length > 1 && (
              <div className="flex gap-2.5 sm:gap-3 overflow-x-auto pb-2">
                {images.map((img) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImage(img.url)}
                    className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl overflow-hidden flex-shrink-0 border-2 transition-all bg-white ${
                      selectedImage === img.url
                        ? 'border-[#C49A45] shadow-md scale-95'
                        : 'border-[#C49A45]/20 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <Image
                      src={img.url}
                      alt={title}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info & Purchase Controls */}
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#98702B] tracking-wider uppercase">
                  {product.scentFamily || product.category?.nameAr || 'عطر ملكي'}
                </span>
                <span className="text-xs text-neutral-500">SKU: {product.sku || 'RW-001'}</span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-black text-[#171717] leading-tight">
                {title}
              </h1>

              {/* Rating & Stock */}
              <div className="flex items-center gap-4 pt-1">
                <div className="flex items-center gap-1.5 bg-[#C49A45]/15 border border-[#C49A45]/30 px-3 py-1 rounded-full text-xs font-bold text-[#98702B]">
                  <Star className="w-3.5 h-3.5 fill-[#C49A45] text-[#C49A45]" />
                  <span className="text-[#171717]">{product.rating.toFixed(1)}</span>
                  <span className="text-neutral-500 font-normal">
                    ({product.reviewCount || 24} {t('تقييم', 'reviews')})
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-emerald-700 font-bold">
                    {product.stock > 0
                      ? t(`متوفر في المخزون (${product.stock} قطع)`, `In Stock (${product.stock} available)`)
                      : t('نفذت الكمية مؤقتاً', 'Out of Stock')}
                  </span>
                </div>
              </div>
            </div>

            {/* Price Block */}
            <div className="p-5 rounded-2xl bg-white border border-[#C49A45]/25 flex items-center flex-wrap gap-4 shadow-sm">
              <span className="text-3xl sm:text-4xl font-black text-[#98702B]">
                {formatPrice(currentPrice, language)}
              </span>
              {comparePrice && comparePrice > currentPrice && (
                <>
                  <span className="text-base text-neutral-400 line-through">
                    {formatPrice(comparePrice, language)}
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-xs font-black bg-red-50 text-red-700 border border-red-200">
                    {t(`وفر ${discountPercent}%`, `Save ${discountPercent}%`)}
                  </span>
                </>
              )}
            </div>

            {/* Bottle Sizes Selection */}
            {sizes.length > 0 && (
              <div className="space-y-2.5">
                <label className="text-xs font-bold text-neutral-800 block">
                  {t('اختر حجم الزجاجة:', 'Select Bottle Size:')}
                </label>
                <div className="flex flex-wrap gap-3">
                  {sizes.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setSelectedSize(s)}
                      className={`px-5 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 ${
                        selectedSize.id === s.id
                          ? 'bg-[#C49A45] text-white border-[#C49A45] shadow-md'
                          : 'bg-white text-[#171717] border-[#C49A45]/30 hover:border-[#C49A45]'
                      }`}
                    >
                      <span>{s.sizeMl} {t('مل', 'ml')}</span>
                      <span className="opacity-80">({formatPrice(s.price, language)})</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-[#171717]">
                {t('عن العطر وصفاته:', 'Fragrance Profile:')}
              </h3>
              <p className="text-sm text-neutral-700 leading-relaxed">
                {description}
              </p>
            </div>

            {/* Quantity & CTA Buttons */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-4">
                {/* Quantity */}
                <div className="flex items-center border border-[#C49A45]/30 rounded-xl bg-white px-3 py-2 shadow-sm">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-8 h-8 flex items-center justify-center text-neutral-700 hover:text-black font-bold"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-sm font-bold text-[#171717]">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-8 h-8 flex items-center justify-center text-neutral-700 hover:text-black font-bold"
                  >
                    +
                  </button>
                </div>

                {/* Add to Cart */}
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0}
                  className={`flex-1 py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md ${
                    isAdded
                      ? 'bg-emerald-600 text-white'
                      : 'gold-button'
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{t('تمت الإضافة بنجاح!', 'Added to Bag!')}</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>{t('إضافة لحقيبة التسوق', 'Add to Shopping Bag')}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Buy Now Button */}
              <button
                onClick={handleBuyNow}
                disabled={product.stock <= 0}
                className="w-full py-3.5 rounded-xl border-2 border-[#C49A45] hover:bg-[#C49A45]/15 bg-white text-[#98702B] text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <span>{t('شراء مباشر الآن (Checkout)', 'Instant Checkout')}</span>
                {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </button>
            </div>

            {/* Authentic Luxury Fragrance Pyramid (الهرم العطري الملكي) */}
            {(() => {
              // Extract notes from relation
              const topRelNotes = product.fragranceNotes?.filter((fn) => fn.type === 'TOP').map((fn) => fn.note) || [];
              const heartRelNotes = product.fragranceNotes?.filter((fn) => fn.type === 'HEART').map((fn) => fn.note) || [];
              const baseRelNotes = product.fragranceNotes?.filter((fn) => fn.type === 'BASE').map((fn) => fn.note) || [];

              // Fallback from text strings if no relation notes
              const parseFallback = (text?: string | null) => {
                if (!text) return [];
                return text
                  .split(/[,،]/)
                  .map((t) => t.trim())
                  .filter(Boolean)
                  .map((name, i) => ({
                    id: `fallback-${name}-${i}`,
                    nameAr: name,
                    nameEn: name,
                    image: null,
                    category: null,
                  }));
              };

              const topNotes = topRelNotes.length > 0 ? topRelNotes : parseFallback(product.topNotes);
              const heartNotes = heartRelNotes.length > 0 ? heartRelNotes : parseFallback(product.heartNotes);
              const baseNotes = baseRelNotes.length > 0 ? baseRelNotes : parseFallback(product.baseNotes);

              const hasPyramidNotes = topNotes.length > 0 || heartNotes.length > 0 || baseNotes.length > 0;
              if (!hasPyramidNotes && !product.longevity && !product.sillage) return null;

              return (
                <div className="mt-8 rounded-3xl bg-gradient-to-b from-white via-[#FCFBF8] to-[#F8F5EE] border-2 border-[#C49A45]/30 p-5 sm:p-7 shadow-lg relative overflow-hidden">
                  {/* Subtle luxury watermark / ambient glow */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-[#C49A45]/5 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#C49A45]/5 rounded-full blur-3xl pointer-events-none" />

                  {/* Header */}
                  <div className="text-center mb-6 relative">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FAF7F2] border border-[#C49A45]/40 text-[#98702B] text-xs font-black shadow-xs mb-2">
                      <Sparkles className="w-3.5 h-3.5 text-[#C49A45]" />
                      <span>{t('الهرم العطري الملكي', 'Royal Fragrance Pyramid')}</span>
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-black">
                      {t('التدرج والنوتات العطرية', 'Olfactory Architecture & Notes')}
                    </h3>
                    <p className="text-xs font-bold text-neutral-500 mt-1 max-w-md mx-auto">
                      {t(
                        'رحلة حسية تبدأ بعبق النفحات الافتتاحية وتتعمق في قلب العطر لتستقر على قاعدة أصيلة تدوم طويلاً',
                        'A sensory journey unfolding from vibrant top notes to a rich heart, resting upon an enduring royal base.'
                      )}
                    </p>
                  </div>

                  {/* Visual Stepped Pyramid Structure */}
                  <div className="space-y-4 relative">
                    {/* TIER 1: TOP NOTES (Apex - Narrow Width) */}
                    {topNotes.length > 0 && (
                      <div className="max-w-md mx-auto">
                        <div className="bg-white/95 rounded-2xl border border-[#DFC27A]/60 shadow-sm p-4 relative hover:border-[#C49A45] transition-all">
                          {/* Tier Header */}
                          <div className="flex items-center justify-between border-b border-[#DFC27A]/30 pb-2 mb-3">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-[#C49A45]" />
                              <span className="text-xs font-black text-black">
                                {t('الافتتاحية (Top Notes)', 'Top Notes')}
                              </span>
                            </div>
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-50 text-[#98702B] border border-amber-200">
                              {t('أول 15 دقيقة', 'First 15 mins')}
                            </span>
                          </div>

                          {/* Notes Circle Cards */}
                          <div className="flex flex-wrap items-center justify-center gap-4">
                            {topNotes.map((note) => {
                              const noteName = language === 'ar' ? note.nameAr : (note.nameEn || note.nameAr);
                              const subName = language === 'ar' ? note.nameEn : note.nameAr;
                              return (
                                <div key={note.id} className="flex flex-col items-center text-center w-20 sm:w-24 group">
                                  <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full p-[2px] bg-gradient-to-tr from-[#C49A45] via-[#F3E5AB] to-[#98702B] shadow-md group-hover:scale-105 group-hover:shadow-[0_0_15px_rgba(196,154,69,0.4)] transition-all duration-300">
                                    <div className="w-full h-full rounded-full overflow-hidden bg-[#FAF7F2] relative flex items-center justify-center">
                                      {note.image ? (
                                        <Image
                                          src={note.image}
                                          alt={note.nameAr}
                                          fill
                                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                                          sizes="64px"
                                        />
                                      ) : (
                                        <Droplets className="w-6 h-6 text-[#C49A45]" />
                                      )}
                                    </div>
                                  </div>
                                  <span className="mt-1.5 text-xs font-black text-black line-clamp-1 group-hover:text-[#98702B] transition-colors">
                                    {noteName}
                                  </span>
                                  {subName && (
                                    <span className="text-[10px] font-bold text-neutral-400 line-clamp-1">
                                      {subName}
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Pyramid Connector */}
                        <div className="w-0.5 h-3 bg-gradient-to-b from-[#C49A45] to-transparent mx-auto" />
                      </div>
                    )}

                    {/* TIER 2: HEART NOTES (Middle Width) */}
                    {heartNotes.length > 0 && (
                      <div className="max-w-xl mx-auto">
                        <div className="bg-white/95 rounded-2xl border border-[#DFC27A]/60 shadow-sm p-4 relative hover:border-[#C49A45] transition-all">
                          {/* Tier Header */}
                          <div className="flex items-center justify-between border-b border-[#DFC27A]/30 pb-2 mb-3">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-[#C49A45]" />
                              <span className="text-xs font-black text-black">
                                {t('قلب العطر (Heart Notes)', 'Heart Notes')}
                              </span>
                            </div>
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-50 text-[#98702B] border border-amber-200">
                              {t('2 إلى 4 ساعات', '2 to 4 hours')}
                            </span>
                          </div>

                          {/* Notes Circle Cards */}
                          <div className="flex flex-wrap items-center justify-center gap-4">
                            {heartNotes.map((note) => {
                              const noteName = language === 'ar' ? note.nameAr : (note.nameEn || note.nameAr);
                              const subName = language === 'ar' ? note.nameEn : note.nameAr;
                              return (
                                <div key={note.id} className="flex flex-col items-center text-center w-20 sm:w-24 group">
                                  <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full p-[2px] bg-gradient-to-tr from-[#C49A45] via-[#F3E5AB] to-[#98702B] shadow-md group-hover:scale-105 group-hover:shadow-[0_0_15px_rgba(196,154,69,0.4)] transition-all duration-300">
                                    <div className="w-full h-full rounded-full overflow-hidden bg-[#FAF7F2] relative flex items-center justify-center">
                                      {note.image ? (
                                        <Image
                                          src={note.image}
                                          alt={note.nameAr}
                                          fill
                                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                                          sizes="64px"
                                        />
                                      ) : (
                                        <Droplets className="w-6 h-6 text-[#C49A45]" />
                                      )}
                                    </div>
                                  </div>
                                  <span className="mt-1.5 text-xs font-black text-black line-clamp-1 group-hover:text-[#98702B] transition-colors">
                                    {noteName}
                                  </span>
                                  {subName && (
                                    <span className="text-[10px] font-bold text-neutral-400 line-clamp-1">
                                      {subName}
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Pyramid Connector */}
                        <div className="w-0.5 h-3 bg-gradient-to-b from-[#C49A45] to-transparent mx-auto" />
                      </div>
                    )}

                    {/* TIER 3: BASE NOTES (Wide Foundation) */}
                    {baseNotes.length > 0 && (
                      <div className="w-full">
                        <div className="bg-white/95 rounded-2xl border-2 border-[#DFC27A]/80 shadow-md p-4 relative hover:border-[#C49A45] transition-all">
                          {/* Tier Header */}
                          <div className="flex items-center justify-between border-b border-[#DFC27A]/30 pb-2 mb-3">
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full bg-[#98702B]" />
                              <span className="text-xs font-black text-black">
                                {t('قاعدة العطر (Base Notes)', 'Base Notes')}
                              </span>
                            </div>
                            <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-100 to-amber-200 text-amber-950 border border-amber-300 shadow-xs">
                              {t('ثبات عميق +12 ساعة', '+12 Hours Deep Longevity')}
                            </span>
                          </div>

                          {/* Notes Circle Cards */}
                          <div className="flex flex-wrap items-center justify-center gap-4">
                            {baseNotes.map((note) => {
                              const noteName = language === 'ar' ? note.nameAr : (note.nameEn || note.nameAr);
                              const subName = language === 'ar' ? note.nameEn : note.nameAr;
                              return (
                                <div key={note.id} className="flex flex-col items-center text-center w-20 sm:w-24 group">
                                  <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full p-[2px] bg-gradient-to-tr from-[#98702B] via-[#DFC27A] to-[#98702B] shadow-md group-hover:scale-105 group-hover:shadow-[0_0_15px_rgba(152,112,43,0.4)] transition-all duration-300">
                                    <div className="w-full h-full rounded-full overflow-hidden bg-[#FAF7F2] relative flex items-center justify-center">
                                      {note.image ? (
                                        <Image
                                          src={note.image}
                                          alt={note.nameAr}
                                          fill
                                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                                          sizes="64px"
                                        />
                                      ) : (
                                        <Droplets className="w-6 h-6 text-[#C49A45]" />
                                      )}
                                    </div>
                                  </div>
                                  <span className="mt-1.5 text-xs font-black text-black line-clamp-1 group-hover:text-[#98702B] transition-colors">
                                    {noteName}
                                  </span>
                                  {subName && (
                                    <span className="text-[10px] font-bold text-neutral-400 line-clamp-1">
                                      {subName}
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Performance Specs Row */}
                  {(product.longevity || product.sillage || product.scentFamily) && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-5 mt-5 border-t border-[#C49A45]/20 text-xs font-bold text-neutral-800">
                      {product.longevity && (
                        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-[#DFC27A]/30">
                          <Clock className="w-4 h-4 text-[#C49A45] flex-shrink-0" />
                          <div className="leading-tight">
                            <span className="text-[10px] text-neutral-400 block">{t('الثبات', 'Longevity')}</span>
                            <span className="text-black font-black">{product.longevity}</span>
                          </div>
                        </div>
                      )}
                      {product.sillage && (
                        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-[#DFC27A]/30">
                          <Wind className="w-4 h-4 text-[#C49A45] flex-shrink-0" />
                          <div className="leading-tight">
                            <span className="text-[10px] text-neutral-400 block">{t('الفوحان', 'Sillage')}</span>
                            <span className="text-black font-black">{product.sillage}</span>
                          </div>
                        </div>
                      )}
                      {product.scentFamily && (
                        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-[#DFC27A]/30">
                          <Droplets className="w-4 h-4 text-[#C49A45] flex-shrink-0" />
                          <div className="leading-tight">
                            <span className="text-[10px] text-neutral-400 block">{t('العائلة العطرية', 'Scent Family')}</span>
                            <span className="text-black font-black">{product.scentFamily}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-12 sm:mt-24 pt-8 sm:pt-12 border-t border-[#C49A45]/20 space-y-6 sm:space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-[#171717]">
                  {t('عطور قد تعجبك أيضاً', 'You May Also Like')}
                </h3>
                <p className="text-xs text-neutral-600 mt-0.5 sm:mt-1">
                  {t('اقتراحات مختارة من نفس الطابع العطري الفاخر', 'Curated suggestions sharing the same olfactory elegance')}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
