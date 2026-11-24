'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  ChevronRight,
  ChevronLeft,
  Award,
  Zap,
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

  // Images state & Auto-Slider logic
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
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  // Auto transition every 3.8s when multiple images exist and not paused
  useEffect(() => {
    if (images.length <= 1 || isPaused) return;
    const interval = setInterval(() => {
      setActiveImageIndex((prev) => (prev + 1) % images.length);
    }, 3800);
    return () => clearInterval(interval);
  }, [images.length, isPaused]);

  const handleNextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    setIsPaused(true);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        // Swiped left
        handleNextImage();
      } else {
        // Swiped right
        handlePrevImage();
      }
    }
    touchStartX.current = null;
    setIsPaused(false);
  };

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

        {/* Main Product Layout: 2 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-start">
          {/* Column 1: Image Gallery (Desktop Side-Thumbnails & Mobile Slideshow) */}
          <div className="w-full">
            {/* Desktop View: Side Thumbnails & Main Active Slide with Auto-Transition */}
            <div className="hidden lg:flex gap-4 items-start">
              {/* Side Thumbnails Strip */}
              {images.length > 1 && (
                <div
                  className="flex flex-col gap-3 max-h-[560px] overflow-y-auto scrollbar-none py-1 flex-shrink-0"
                  onMouseEnter={() => setIsPaused(true)}
                  onMouseLeave={() => setIsPaused(false)}
                >
                  {images.map((img, idx) => (
                    <button
                      key={img.id || idx}
                      type="button"
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all duration-300 bg-white cursor-pointer ${
                        activeImageIndex === idx
                          ? 'border-[#C49A45] ring-2 ring-[#C49A45]/40 shadow-md scale-102'
                          : 'border-[#DFC27A]/30 opacity-60 hover:opacity-100 hover:border-[#C49A45]'
                      }`}
                    >
                      <Image src={img.url} alt={title} fill className="object-cover" sizes="80px" />
                    </button>
                  ))}
                </div>
              )}

              {/* Main Display with Crossfade, Badges, and Hover Controls */}
              <div
                className="flex-1 relative aspect-square rounded-3xl overflow-hidden bg-white border border-[#C49A45]/30 shadow-lg group select-none"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
              >
                {images.map((img, idx) => (
                  <div
                    key={img.id || idx}
                    className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                      activeImageIndex === idx ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                    }`}
                  >
                    <Image
                      src={img.url}
                      alt={title}
                      fill
                      priority={idx === 0}
                      className="object-cover object-center group-hover:scale-102 transition-transform duration-700"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                  </div>
                ))}

                {/* Badges */}
                {discountPercent && (
                  <div className="absolute top-4 right-4 z-20 px-3 py-1 rounded-full bg-red-600 text-white text-xs font-black shadow-lg">
                    -{discountPercent}%
                  </div>
                )}

                <div className="absolute bottom-4 right-4 z-20">
                  <span className="px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-xs font-bold text-white uppercase shadow-md">
                    {product.gender === 'HIM' ? t('رجالي', 'For Him') : product.gender === 'HER' ? t('نسائي', 'For Her') : t('للجنسين', 'Unisex')}
                  </span>
                </div>

                {images.length > 1 && (
                  <div className="absolute bottom-4 left-4 z-20 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md text-[11px] font-bold text-white border border-white/20">
                    {activeImageIndex + 1} / {images.length}
                  </div>
                )}

                {/* Arrow Controls on Hover */}
                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={handlePrevImage}
                      className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/85 hover:bg-white text-black border border-[#C49A45]/30 shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      title={t('السابق', 'Previous')}
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={handleNextImage}
                      className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/85 hover:bg-white text-black border border-[#C49A45]/30 shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      title={t('التالي', 'Next')}
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Mobile View: Swipeable Slideshow / Carousel */}
            <div className="lg:hidden space-y-3">
              <div
                className="relative aspect-square w-full rounded-2xl overflow-hidden bg-white border border-[#C49A45]/30 shadow-md touch-pan-y select-none"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                {images.map((img, idx) => (
                  <div
                    key={img.id || idx}
                    className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
                      activeImageIndex === idx ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                    }`}
                  >
                    <Image
                      src={img.url}
                      alt={title}
                      fill
                      priority={idx === 0}
                      className="object-cover object-center"
                      sizes="100vw"
                    />
                  </div>
                ))}

                {/* Badges */}
                {discountPercent && (
                  <div className="absolute top-3 right-3 z-20 px-2.5 py-1 rounded-full bg-red-600 text-white text-[11px] font-black shadow-md">
                    -{discountPercent}%
                  </div>
                )}

                <div className="absolute bottom-3 right-3 z-20">
                  <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[10px] font-bold text-white uppercase">
                    {product.gender === 'HIM' ? t('رجالي', 'For Him') : product.gender === 'HER' ? t('نسائي', 'For Her') : t('للجنسين', 'Unisex')}
                  </span>
                </div>

                {/* Arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={handlePrevImage}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/90 text-black border border-[#C49A45]/40 shadow-sm flex items-center justify-center cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={handleNextImage}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/90 text-black border border-[#C49A45]/40 shadow-sm flex items-center justify-center cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                )}

                {/* Pagination Dots */}
                {images.length > 1 && (
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-black/40 backdrop-blur-xs px-2.5 py-1 rounded-full">
                    {images.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveImageIndex(idx)}
                        className={`transition-all duration-300 rounded-full ${
                          activeImageIndex === idx ? 'w-5 h-1.5 bg-[#D4AF37]' : 'w-1.5 h-1.5 bg-white/60'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Thumbnails Strip */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none justify-center">
                  {images.map((img, idx) => (
                    <button
                      key={img.id || idx}
                      type="button"
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-14 h-14 rounded-xl overflow-hidden border-2 bg-white flex-shrink-0 transition-all ${
                        activeImageIndex === idx
                          ? 'border-[#C49A45] ring-2 ring-[#C49A45]/30'
                          : 'border-[#DFC27A]/30 opacity-60'
                      }`}
                    >
                      <Image src={img.url} alt={title} fill className="object-cover" sizes="56px" />
                    </button>
                  ))}
                </div>
              )}
            </div>
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

            {/* Store Guarantee & Trust Badges (Balances column height perfectly) */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[#C49A45]/20 text-xs font-bold text-neutral-800">
              <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white border border-[#DFC27A]/35 shadow-xs">
                <Truck className="w-5 h-5 text-[#C49A45] flex-shrink-0" />
                <div>
                  <span className="text-black font-black block">{t('شحن سريع ومجاني', 'Fast Shipping')}</span>
                  <span className="text-[11px] text-neutral-500 font-normal">{t('توصيل لباب المنزل', 'Doorstep delivery')}</span>
                </div>
              </div>
              <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white border border-[#DFC27A]/35 shadow-xs">
                <ShieldCheck className="w-5 h-5 text-[#C49A45] flex-shrink-0" />
                <div>
                  <span className="text-black font-black block">{t('عطر أصلي 100%', '100% Authentic')}</span>
                  <span className="text-[11px] text-neutral-500 font-normal">{t('تركيز وزيوت فاخرة', 'Pure luxury oils')}</span>
                </div>
              </div>
              <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white border border-[#DFC27A]/35 shadow-xs">
                <Check className="w-5 h-5 text-[#C49A45] flex-shrink-0" />
                <div>
                  <span className="text-black font-black block">{t('معاينة قبل الاستلام', 'Inspect on Delivery')}</span>
                  <span className="text-[11px] text-neutral-500 font-normal">{t('حق المعاينة متاح', 'Inspection allowed')}</span>
                </div>
              </div>
              <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white border border-[#DFC27A]/35 shadow-xs">
                <Sparkles className="w-5 h-5 text-[#C49A45] flex-shrink-0" />
                <div>
                  <span className="text-black font-black block">{t('تغليف إهداء راقي', 'Luxury Gift Packaging')}</span>
                  <span className="text-[11px] text-neutral-500 font-normal">{t('صندوق ملكي مميز', 'Royal unboxing')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* FULL-WIDTH ROYAL FRAGRANCE PYRAMID SUITE (TRIANGLE SHAPE & NO EMPTY VOIDS)*/}
        {/* ========================================================================= */}
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
            <div className="mt-14 sm:mt-20 space-y-6">
              {/* Section Header */}
              <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FAF7F2] border border-[#C49A45]/40 text-[#98702B] text-xs font-black shadow-xs">
                  <Sparkles className="w-3.5 h-3.5 text-[#C49A45]" />
                  <span>{t('الهرم العطري الملكي', 'Royal Fragrance Pyramid')}</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-[#171717]">
                  {t('الهرم العطري وتدرج النوتات', 'Olfactory Pyramid & Note Architecture')}
                </h2>
                <p className="text-xs sm:text-sm font-bold text-neutral-500 max-w-xl mx-auto">
                  {t(
                    'هندسة وتدرج النوتات العطرية على شكل هرم عطري متقن يبدأ بالقمة المنعشة ويتعمق في القلب ويستقر على القاعدة الراسخة',
                    'An authentic fragrance pyramid unfolding from the fresh apex to the rich heart, anchoring into a timeless base.'
                  )}
                </p>
              </div>

              {/* Panoramic 3-Column Suite (Filling all surrounding spaces) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                {/* Flank Card 1 (Performance & Olfactory Profile) */}
                <div className="lg:col-span-3 bg-white rounded-3xl border border-[#DFC27A]/40 p-6 shadow-sm flex flex-col justify-between space-y-5">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2.5 pb-3 border-b border-[#DFC27A]/30">
                      <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-[#C49A45]">
                        <Award className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-black">{t('البصمة العطرية', 'Sillage Profile')}</h4>
                        <span className="text-[10px] text-[#98702B] font-bold">{t('مواصفات الأداء الملكي', 'Royal Performance')}</span>
                      </div>
                    </div>

                    {product.longevity && (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs font-black text-black">
                          <Clock className="w-4 h-4 text-[#C49A45]" />
                          <span>{t('الثبات والدوام:', 'Longevity:')} {product.longevity}</span>
                        </div>
                        <p className="text-[11px] font-bold text-neutral-500 leading-relaxed">
                          {t('ثبات عميق واستثنائي يدوم طوال اليوم على البشرة والملابس.', 'Long-lasting depth that lingers beautifully throughout the day.')}
                        </p>
                      </div>
                    )}

                    {product.sillage && (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs font-black text-black">
                          <Wind className="w-4 h-4 text-[#C49A45]" />
                          <span>{t('الفوحان والانتشار:', 'Sillage:')} {product.sillage}</span>
                        </div>
                        <p className="text-[11px] font-bold text-neutral-500 leading-relaxed">
                          {t('انتشار هالة عطرية مغناطيسية تترك بصمة حضور واضحة وجذابة.', 'Radiates a magnetic aura leaving a captivating trail.')}
                        </p>
                      </div>
                    )}

                    {product.scentFamily && (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs font-black text-black">
                          <Droplets className="w-4 h-4 text-[#C49A45]" />
                          <span>{t('العائلة العطرية:', 'Olfactory Family:')} {product.scentFamily}</span>
                        </div>
                        <p className="text-[11px] font-bold text-neutral-500 leading-relaxed">
                          {t('توليفة نادرة تجمع النبل الشرقي والأناقة الفرنسية العصرية.', 'A harmonious blend uniting regal oriental notes with modern elegance.')}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="p-3 rounded-2xl bg-[#FAF7F2] border border-[#DFC27A]/30 text-center">
                    <span className="text-[10px] font-black text-[#98702B] block">
                      {t('تركيز العطر: Eau de Parfum نقي', 'Concentration: Eau de Parfum')}
                    </span>
                  </div>
                </div>

                {/* Centerpiece: THE GEOMETRIC TRIANGLE FRAGRANCE PYRAMID (6 cols on lg) */}
                <div className="lg:col-span-6 bg-gradient-to-b from-[#FAF7F2] via-white to-[#F7F2E8] rounded-3xl border-2 border-[#C49A45]/40 p-6 sm:p-8 shadow-md relative overflow-hidden flex flex-col items-center justify-between">
                  {/* Subtle triangle pyramid SVG wireframe in background */}
                  <svg
                    className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.06] text-[#C49A45]"
                    viewBox="0 0 400 400"
                    fill="none"
                    stroke="currentColor"
                  >
                    <polygon points="200,30 370,370 30,370" strokeWidth="2" />
                    <line x1="140" y1="150" x2="260" y2="150" strokeWidth="2" strokeDasharray="4 4" />
                    <line x1="85" y1="260" x2="315" y2="260" strokeWidth="2" strokeDasharray="4 4" />
                  </svg>

                  {/* 1. APEX / TOP NOTES (Narrow Peak of the Triangle) */}
                  <div className="w-full flex flex-col items-center z-10 mb-4">
                    {/* Peak Cap */}
                    <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#B38F26] text-black text-xs font-black shadow-sm mb-3">
                      <span>👑</span>
                      <span>{t('قمة الهرم: الافتتاحية (Top Notes)', 'Apex: Top Notes')}</span>
                    </div>
                    <span className="text-[10px] font-black text-[#98702B] -mt-1.5 mb-2">
                      {t('الـ 15 دقيقة الأولى من الرش', 'First 15 minutes of spray')}
                    </span>

                    {/* Top Tier Container (Narrow Width of Pyramid) */}
                    <div className="w-[280px] sm:w-[320px] max-w-full bg-white/95 rounded-2xl border border-[#DFC27A]/60 shadow-sm p-3.5 hover:border-[#C49A45] transition-all">
                      <div className="flex flex-wrap items-center justify-center gap-3">
                        {topNotes.map((note) => {
                          const noteName = language === 'ar' ? note.nameAr : (note.nameEn || note.nameAr);
                          const subName = language === 'ar' ? note.nameEn : note.nameAr;
                          return (
                            <div key={note.id} className="flex flex-col items-center text-center w-20 group">
                              <div className="relative w-14 h-14 rounded-full p-[2px] bg-gradient-to-tr from-[#C49A45] via-[#F3E5AB] to-[#98702B] shadow-md group-hover:scale-105 group-hover:shadow-[0_0_12px_rgba(196,154,69,0.5)] transition-all duration-300">
                                <div className="w-full h-full rounded-full overflow-hidden bg-[#FAF7F2] relative flex items-center justify-center">
                                  {note.image ? (
                                    <Image src={note.image} alt={note.nameAr} fill className="object-cover group-hover:scale-110 transition-transform duration-300" sizes="56px" />
                                  ) : (
                                    <Droplets className="w-5 h-5 text-[#C49A45]" />
                                  )}
                                </div>
                              </div>
                              <span className="mt-1 text-[11px] font-black text-black line-clamp-1 group-hover:text-[#98702B] transition-colors">
                                {noteName}
                              </span>
                              {subName && (
                                <span className="text-[9px] font-bold text-neutral-400 line-clamp-1">
                                  {subName}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Diagonal Step Connector */}
                    <div className="w-0.5 h-3 bg-gradient-to-b from-[#C49A45] to-transparent my-1" />
                  </div>

                  {/* 2. MIDDLE / HEART NOTES (Medium Width of the Triangle) */}
                  <div className="w-full flex flex-col items-center z-10 mb-4">
                    <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-amber-100 border border-amber-300 text-[#98702B] text-xs font-black shadow-xs mb-2">
                      <span>✨</span>
                      <span>{t('وسط الهرم: قلب العطر (Heart Notes)', 'Heart Notes')}</span>
                    </div>
                    <span className="text-[10px] font-black text-[#98702B] -mt-1 mb-2">
                      {t('روح وبصمة العطر (2 إلى 4 ساعات)', 'Soul of the fragrance (2-4 hours)')}
                    </span>

                    {/* Middle Tier Container (Medium Width) */}
                    <div className="w-[360px] sm:w-[440px] max-w-full bg-white/95 rounded-2xl border border-[#DFC27A]/60 shadow-sm p-3.5 hover:border-[#C49A45] transition-all">
                      <div className="flex flex-wrap items-center justify-center gap-3">
                        {heartNotes.map((note) => {
                          const noteName = language === 'ar' ? note.nameAr : (note.nameEn || note.nameAr);
                          const subName = language === 'ar' ? note.nameEn : note.nameAr;
                          return (
                            <div key={note.id} className="flex flex-col items-center text-center w-20 group">
                              <div className="relative w-14 h-14 rounded-full p-[2px] bg-gradient-to-tr from-[#C49A45] via-[#F3E5AB] to-[#98702B] shadow-md group-hover:scale-105 group-hover:shadow-[0_0_12px_rgba(196,154,69,0.5)] transition-all duration-300">
                                <div className="w-full h-full rounded-full overflow-hidden bg-[#FAF7F2] relative flex items-center justify-center">
                                  {note.image ? (
                                    <Image src={note.image} alt={note.nameAr} fill className="object-cover group-hover:scale-110 transition-transform duration-300" sizes="56px" />
                                  ) : (
                                    <Droplets className="w-5 h-5 text-[#C49A45]" />
                                  )}
                                </div>
                              </div>
                              <span className="mt-1 text-[11px] font-black text-black line-clamp-1 group-hover:text-[#98702B] transition-colors">
                                {noteName}
                              </span>
                              {subName && (
                                <span className="text-[9px] font-bold text-neutral-400 line-clamp-1">
                                  {subName}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Diagonal Step Connector */}
                    <div className="w-0.5 h-3 bg-gradient-to-b from-[#C49A45] to-transparent my-1" />
                  </div>

                  {/* 3. BASE / BASE NOTES (Broadest Foundation of the Triangle) */}
                  <div className="w-full flex flex-col items-center z-10">
                    <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-gradient-to-r from-amber-200 to-amber-300 text-amber-950 border border-amber-400 text-xs font-black shadow-xs mb-2">
                      <span>🏛️</span>
                      <span>{t('قاعدة الهرم: قاعدة العطر (Base Notes)', 'Base Notes')}</span>
                    </div>
                    <span className="text-[10px] font-black text-[#98702B] -mt-1 mb-2">
                      {t('العمق والثبات الملكي (+12 ساعة ثبات)', 'Regal depth and longevity (+12h)')}
                    </span>

                    {/* Base Tier Container (Broadest Foundation Width) */}
                    <div className="w-full max-w-xl bg-white/95 rounded-2xl border-2 border-[#DFC27A]/80 shadow-md p-4 hover:border-[#C49A45] transition-all">
                      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
                        {baseNotes.map((note) => {
                          const noteName = language === 'ar' ? note.nameAr : (note.nameEn || note.nameAr);
                          const subName = language === 'ar' ? note.nameEn : note.nameAr;
                          return (
                            <div key={note.id} className="flex flex-col items-center text-center w-20 group">
                              <div className="relative w-14 h-14 rounded-full p-[2px] bg-gradient-to-tr from-[#98702B] via-[#DFC27A] to-[#98702B] shadow-md group-hover:scale-105 group-hover:shadow-[0_0_12px_rgba(152,112,43,0.5)] transition-all duration-300">
                                <div className="w-full h-full rounded-full overflow-hidden bg-[#FAF7F2] relative flex items-center justify-center">
                                  {note.image ? (
                                    <Image src={note.image} alt={note.nameAr} fill className="object-cover group-hover:scale-110 transition-transform duration-300" sizes="56px" />
                                  ) : (
                                    <Droplets className="w-5 h-5 text-[#C49A45]" />
                                  )}
                                </div>
                              </div>
                              <span className="mt-1 text-[11px] font-black text-black line-clamp-1 group-hover:text-[#98702B] transition-colors">
                                {noteName}
                              </span>
                              {subName && (
                                <span className="text-[9px] font-bold text-neutral-400 line-clamp-1">
                                  {subName}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Flank Card 2 (Royal Ritual & Usage Secrets) */}
                <div className="lg:col-span-3 bg-white rounded-3xl border border-[#DFC27A]/40 p-6 shadow-sm flex flex-col justify-between space-y-5">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2.5 pb-3 border-b border-[#DFC27A]/30">
                      <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-[#C49A45]">
                        <Zap className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-black">{t('طقوس الاستخدام', 'The Royal Ritual')}</h4>
                        <span className="text-[10px] text-[#98702B] font-bold">{t('لأقصى درجات الفوحان', 'For Peak Sillage')}</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-xs font-black text-black block">{t('نقاط النبض المثالية:', 'Ideal Pulse Points:')}</span>
                      <p className="text-[11px] font-bold text-neutral-500 leading-relaxed">
                        {t('قم بالرش على المعصمين وجانبي الرقبة لتتفاعل الزيوت مع حرارة الجسم.', 'Apply to wrists and neck to let warmth elevate the notes.')}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-xs font-black text-black block">{t('سر ثبات الهرم العطري:', 'Preserve the Pyramid:')}</span>
                      <p className="text-[11px] font-bold text-neutral-500 leading-relaxed">
                        {t('تجنب فرك المعصمين بعد الرش حتى لا تتكسر جزيئات النوتات الافتتاحية.', 'Avoid rubbing wrists so delicate top notes evolve naturally.')}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-xs font-black text-black block">{t('نقاء الزيوت العطرية:', 'Pure Fragrance Oils:')}</span>
                      <p className="text-[11px] font-bold text-neutral-500 leading-relaxed">
                        {t('مستخلص من أنقى الزيوت العطرية الفرنسية والشرقية الطبيعية والمعتقة.', 'Distilled from premium aged oriental and French perfume essences.')}
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#FAF7F2] border border-[#DFC27A]/30 text-center">
                    <span className="text-[10px] font-black text-[#98702B] block">
                      {t('ضمان الجودة والأصالة 100%', '100% Guaranteed Authenticity')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

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
