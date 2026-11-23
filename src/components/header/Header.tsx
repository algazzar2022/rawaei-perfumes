'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Search,
  ShoppingBag,
  User,
  Menu,
  X,
  ChevronDown,
  Globe,
  Sparkles,
  Flame,
  Gift,
  Home,
  Droplets,
  HeartHandshake,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { ProductDto } from '@/lib/types';
import { formatPrice } from '@/lib/utils';

export default function Header() {
  const { itemCount, setIsCartOpen } = useCart();
  const { language, direction, toggleLanguage, t } = useLanguage();
  const router = useRouter();

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ProductDto[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Mobile menu & search states
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isPerfumesDropdownOpen, setIsPerfumesDropdownOpen] = useState(false);

  // Announcement bar state
  const announcementText =
    language === 'ar'
      ? '✨ شحن مجاني فاخر لكافة محافظات مصر للطلبات فوق 800 جنيه | كود الخصم: WELCOME10 ✨'
      : '✨ Free Royal Nationwide Delivery in Egypt for orders above 800 EGP | Coupon: WELCOME10 ✨';

  // Search debounced handler
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(searchQuery)}&limit=5`);
        const data = await res.json();
        setSearchResults(data.products || []);
        setShowSearchDropdown(true);
      } catch (e) {
        console.error('Search error', e);
      } finally {
        setIsSearching(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside search dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowSearchDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSearchDropdown(false);
      setIsMobileMenuOpen(false);
      setIsMobileSearchOpen(false);
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <>
      {/* 1. Top Moving Announcement Bar (Marquee Ticker on Both Mobile & Desktop) */}
      <div 
        dir="ltr"
        className="relative w-full overflow-hidden bg-[#111813] border-b border-[#C49A45]/30 text-white py-2 text-[11px] sm:text-xs font-semibold select-none shadow-sm"
      >
        <div className={direction === 'rtl' ? 'animate-marquee-rtl' : 'animate-marquee-ltr'}>
          {/* Content Block 1 */}
          <div className="flex items-center gap-6 px-4 shrink-0" dir={direction}>
            <span className="flex items-center gap-1.5 text-neutral-100">
              <Sparkles className="w-3.5 h-3.5 text-[#DFC27A]" />
              {t(
                'شحن مجاني فاخر لكافة محافظات مصر للطلبات فوق 800 جنيه',
                'Free Royal Delivery Across Egypt For Orders Above 800 EGP'
              )}
            </span>
            <span className="text-[#DFC27A] font-black">◆</span>
            <span className="text-[#DFC27A] font-bold">
              {t('كود الخصم الحصري: WELCOME10', 'Exclusive Coupon: WELCOME10')}
            </span>
            <span className="text-[#DFC27A] font-black">◆</span>
            <span className="text-neutral-200">
              {t(
                'ضمان أصالة وجودة ملكية 100% معتمدة لجميع المنتجات',
                '100% Certified Genuine Royal Quality'
              )}
            </span>
            <span className="text-[#DFC27A] font-black">◆</span>
            <span className="text-neutral-200">
              {t(
                'دفع إلكتروني فوري وموثوق عبر انستاباي وفودافون كاش',
                'Instant Online Transfer via InstaPay & Vodafone Cash'
              )}
            </span>
            <span className="text-[#DFC27A] font-black">◆</span>
          </div>

          {/* Content Block 2 (Exact Duplicate for Seamless Infinite Marquee Loop) */}
          <div className="flex items-center gap-6 px-4 shrink-0" dir={direction}>
            <span className="flex items-center gap-1.5 text-neutral-100">
              <Sparkles className="w-3.5 h-3.5 text-[#DFC27A]" />
              {t(
                'شحن مجاني فاخر لكافة محافظات مصر للطلبات فوق 800 جنيه',
                'Free Royal Delivery Across Egypt For Orders Above 800 EGP'
              )}
            </span>
            <span className="text-[#DFC27A] font-black">◆</span>
            <span className="text-[#DFC27A] font-bold">
              {t('كود الخصم الحصري: WELCOME10', 'Exclusive Coupon: WELCOME10')}
            </span>
            <span className="text-[#DFC27A] font-black">◆</span>
            <span className="text-neutral-200">
              {t(
                'ضمان أصالة وجودة ملكية 100% معتمدة لجميع المنتجات',
                '100% Certified Genuine Royal Quality'
              )}
            </span>
            <span className="text-[#DFC27A] font-black">◆</span>
            <span className="text-neutral-200">
              {t(
                'تحويل إلكتروني فوري وموثوق عبر انستاباي وفودافون كاش',
                'Instant Online Transfer via InstaPay & Vodafone Cash'
              )}
            </span>
            <span className="text-[#DFC27A] font-black">◆</span>
          </div>
        </div>
      </div>

      {/* 2. Main Non-Sticky Header (stays at top, does not scroll down with user) */}
      <header className="relative z-40 glass-header border-b border-[#C49A45]/20 shadow-sm bg-white/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* ========================================================================= */}
          {/* A. MOBILE HEADER (Strictly matching the user reference image layout)      */}
          {/* Start: 3-line Menu | Center: Logo | End: Cart (badge + bag) + Search Icon */}
          {/* Styled in signature royal gold (#98702B / #C49A45) with enlarged logo     */}
          {/* ========================================================================= */}
          <div className="lg:hidden flex items-center justify-between h-[68px] sm:h-20 relative">
            {/* 1. Start: Hamburger Menu 3 Lines in Signature Royal Gold */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 text-[#98702B] hover:text-[#7D591B] hover:bg-[#C49A45]/10 rounded-xl transition-all z-10 active:scale-95"
              aria-label="Open navigation menu"
            >
              <Menu className="w-7 h-7 stroke-[2]" />
            </button>

            {/* 2. Center: Logo Only (Enlarged, centered, royal presence) */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <Link href="/" className="pointer-events-auto flex items-center justify-center py-1">
                <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0 drop-shadow-sm transition-transform active:scale-95">
                  <Image
                    src="/logo.png"
                    alt={t('روائع للعطور', 'RAWAEI PERFUMES')}
                    fill
                    sizes="(max-width: 640px) 56px, 64px"
                    className="object-contain"
                    priority
                  />
                </div>
              </Link>
            </div>

            {/* 3. End: Cart with counter + Search icon in Royal Gold */}
            <div className="flex items-center gap-1 sm:gap-2 z-10">
              {/* Cart Icon in Royal Gold with Red Badge (strictly matching Desktop styling) */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 text-[#98702B] hover:text-[#7D591B] hover:bg-[#C49A45]/10 rounded-xl transition-all active:scale-95"
                aria-label="View Shopping Cart"
              >
                <ShoppingBag className="w-6 h-6 stroke-[2]" />
                {itemCount > 0 && (
                  <span className="absolute top-0 right-0 min-w-[19px] h-[19px] px-1 bg-red-600 border-2 border-white text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-md animate-pulse">
                    {itemCount}
                  </span>
                )}
              </button>

              {/* Search Icon in Royal Gold */}
              <button
                onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
                className={`p-2 rounded-xl transition-all active:scale-95 ${
                  isMobileSearchOpen
                    ? 'text-white bg-[#98702B] shadow-sm'
                    : 'text-[#98702B] hover:text-[#7D591B] hover:bg-[#C49A45]/10'
                }`}
                aria-label="Search"
              >
                <Search className="w-6 h-6 stroke-[2]" />
              </button>
            </div>
          </div>

          {/* Mobile Search Dropdown Bar (Toggled when clicking Search Icon) */}
          {isMobileSearchOpen && (
            <div className="lg:hidden px-2 pb-3 pt-1 border-t border-[#C49A45]/20 animate-in fade-in slide-in-from-top-1">
              <form onSubmit={handleSearchSubmit} className="relative w-full">
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => {
                    if (searchResults.length > 0) setShowSearchDropdown(true);
                  }}
                  placeholder={t('ابحث في عطور روائع...', 'Search perfumes...')}
                  className="w-full bg-[#FAF7F2] text-[#171717] text-xs pl-10 pr-9 py-2.5 rounded-full border border-[#C49A45]/40 focus:border-[#C49A45] focus:outline-none shadow-inner"
                />
                <Search className="absolute top-1/2 -translate-y-1/2 right-3 w-4 h-4 text-[#98702B]" />
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setShowSearchDropdown(false);
                    setIsMobileSearchOpen(false);
                  }}
                  className="absolute top-1/2 -translate-y-1/2 left-3 text-gray-400 hover:text-black"
                >
                  <X className="w-4 h-4" />
                </button>
              </form>

              {/* Live Autocomplete Results */}
              {showSearchDropdown && searchResults.length > 0 && (
                <div className="mt-2 bg-white border border-[#C49A45]/30 rounded-2xl shadow-xl overflow-hidden z-50">
                  <div className="p-2 border-b border-gray-100 text-xs text-gray-500 font-bold bg-[#FAF7F2]">
                    {t('النتائج المطابقة:', 'Matching products:')}
                  </div>
                  <div className="max-h-60 overflow-y-auto divide-y divide-gray-100">
                    {searchResults.map((product) => {
                      const img =
                        product.images?.[0]?.url ||
                        'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=200';
                      const title = language === 'ar' ? product.nameAr : product.nameEn;
                      return (
                        <Link
                          key={product.id}
                          href={`/product/${product.slug}`}
                          onClick={() => {
                            setShowSearchDropdown(false);
                            setIsMobileSearchOpen(false);
                          }}
                          className="flex items-center gap-2.5 p-2.5 hover:bg-[#FAF7F2] transition-colors"
                        >
                          <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-neutral-100 flex-shrink-0 border border-gray-100">
                            <Image src={img} alt={title} fill className="object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-[#171717] truncate">{title}</p>
                            <p className="text-[10px] text-gray-500 truncate">
                              {product.scentFamily || product.gender}
                            </p>
                          </div>
                          <span className="text-xs font-black text-[#98702B]">
                            {formatPrice(product.price, language)}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                  <div className="p-2 bg-[#FAF7F2] border-t border-gray-100 text-center">
                    <button
                      onClick={handleSearchSubmit}
                      className="text-xs text-[#98702B] hover:text-[#C49A45] font-bold"
                    >
                      {t('عرض جميع نتائج البحث', 'View all search results')} →
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* B. DESKTOP HEADER (Preserved 100% Identical)                              */}
          {/* ========================================================================= */}
          <div className="hidden lg:flex items-center justify-between h-20 lg:h-24 gap-4">
            {/* Desktop Right: Brand Logo + Site Name */}
            <div className="flex items-center gap-4 flex-shrink-0">
              <Link href="/" className="flex items-center gap-3.5 group">
                <div className="relative w-[70px] h-[70px] flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                  <Image
                    src="/logo.png"
                    alt={t('روائع للعطور', 'RAWAEI PERFUMES')}
                    fill
                    sizes="(max-width: 640px) 56px, 64px"
                    className="object-contain"
                    priority
                  />
                </div>
                <div className="flex flex-col justify-center">
                  <span className="text-2xl sm:text-3xl font-black tracking-tight text-[#171717] group-hover:text-[#98702B] transition-colors leading-tight">
                    {t('روائع للعطور', 'RAWAEI')}
                  </span>
                  <span className="text-xs font-black tracking-[0.22em] text-[#98702B] uppercase mt-0.5">
                    RAWAEI PERFUMES
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Center: Search Bar with Live Results */}
            <div
              ref={searchContainerRef}
              className="flex-1 max-w-md mx-6 relative"
            >
              <form onSubmit={handleSearchSubmit} className="w-full relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => {
                    if (searchResults.length > 0) setShowSearchDropdown(true);
                  }}
                  placeholder={t(
                    'ابحث عن عطرك المفضل، عود، دهن، بخور...',
                    'Search luxury perfumes, oud, incense...'
                  )}
                  className="w-full bg-[#FAF7F2] text-[#171717] text-xs sm:text-sm pl-10 pr-11 py-2.5 rounded-full border border-[#C49A45]/30 focus:border-[#C49A45] focus:outline-none focus:ring-2 focus:ring-[#C49A45]/20 transition-all placeholder-gray-500 shadow-inner"
                />
                <button
                  type="submit"
                  className="absolute top-1/2 -translate-y-1/2 right-3 text-[#98702B] hover:text-[#C49A45] transition-colors p-1"
                  aria-label="Search"
                >
                  <Search className="w-4 h-4" />
                </button>
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setShowSearchDropdown(false);
                    }}
                    className="absolute top-1/2 -translate-y-1/2 left-3 text-gray-400 hover:text-black"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </form>

              {/* Live Search Autocomplete Dropdown */}
              {showSearchDropdown && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#C49A45]/30 rounded-2xl shadow-2xl overflow-hidden z-50 backdrop-blur-xl animate-in fade-in slide-in-from-top-2">
                  <div className="p-3 border-b border-gray-100 text-xs text-gray-500 font-bold bg-[#FAF7F2]">
                    {t('النتائج المطابقة:', 'Matching products:')}
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
                    {searchResults.map((product) => {
                      const img =
                        product.images?.[0]?.url ||
                        'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=200';
                      const title = language === 'ar' ? product.nameAr : product.nameEn;
                      return (
                        <Link
                          key={product.id}
                          href={`/product/${product.slug}`}
                          onClick={() => setShowSearchDropdown(false)}
                          className="flex items-center gap-3 p-3 hover:bg-[#FAF7F2] transition-colors group"
                        >
                          <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-neutral-100 flex-shrink-0 border border-gray-100">
                            <Image
                              src={img}
                              alt={title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-[#171717] group-hover:text-[#98702B] truncate">
                              {title}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {product.scentFamily || product.gender}
                            </p>
                          </div>
                          <span className="text-xs font-black text-[#98702B]">
                            {formatPrice(product.price, language)}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                  <div className="p-2.5 bg-[#FAF7F2] border-t border-gray-100 text-center">
                    <button
                      onClick={handleSearchSubmit}
                      className="text-xs text-[#98702B] hover:text-[#C49A45] font-bold"
                    >
                      {t('عرض جميع نتائج البحث', 'View all search results')} →
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Desktop Left: Customer Account, Language Switcher, Cart */}
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Language Switcher */}
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#C49A45]/30 hover:border-[#C49A45] text-xs font-bold text-[#444444] hover:text-[#171717] transition-all bg-[#FAF7F2] hover:bg-white shadow-sm"
                title={t('تغيير اللغة', 'Switch Language')}
              >
                <Globe className="w-3.5 h-3.5 text-[#98702B]" />
                <span>{language === 'ar' ? 'English' : 'عربي'}</span>
              </button>

              {/* Customer Account Portal Button */}
              <Link
                href="/account"
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-[#C49A45]/30 hover:border-[#C49A45] text-xs font-bold text-[#171717] bg-[#FAF7F2] hover:bg-white transition-all shadow-sm"
                title={t('حسابي وطلباتي', 'My Account & Orders')}
              >
                <User className="w-4 h-4 text-[#98702B]" />
                <span className="hidden sm:inline">{t('حسابي', 'My Account')}</span>
              </Link>

              {/* Shopping Cart Button */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative w-10 h-10 rounded-full bg-gradient-to-br from-[#DFC27A] via-[#C49A45] to-[#98702B] flex items-center justify-center text-black shadow-md hover:scale-105 active:scale-95 transition-all"
                aria-label="View Shopping Cart"
              >
                <ShoppingBag className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 bg-red-600 border border-white text-white text-[11px] font-black rounded-full flex items-center justify-center shadow-md animate-pulse">
                    {itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Desktop Navigation Menu Links */}
          <nav className="hidden lg:flex items-center justify-center gap-8 py-3 border-t border-[#C49A45]/15 text-sm font-semibold text-[#333333]">
            <Link
              href="/"
              className="hover:text-[#98702B] transition-colors py-1 flex items-center gap-1"
            >
              {t('الرئيسية', 'Home')}
            </Link>

            {/* Perfumes Dropdown */}
            <div className="relative group">
              <button className="flex items-center gap-1 hover:text-[#98702B] transition-colors py-1">
                <span>{t('العطور', 'Perfumes')}</span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-500 group-hover:rotate-180 transition-transform" />
              </button>
              <div className="absolute top-full right-0 w-56 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="bg-white rounded-2xl p-2 border border-[#C49A45]/30 shadow-xl backdrop-blur-xl">
                  <Link
                    href="/perfumes"
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-[#171717] hover:bg-[#FAF7F2] hover:text-[#98702B] transition-colors"
                  >
                    <span>{t('جميع العطور الفاخرة', 'All Fragrances')}</span>
                  </Link>
                  <Link
                    href="/perfumes/for-him"
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-[#171717] hover:bg-[#FAF7F2] hover:text-[#98702B] transition-colors"
                  >
                    <span className="text-[#98702B]">●</span>
                    <span>For Him – {t('عطور رجالية', 'For Him')}</span>
                  </Link>
                  <Link
                    href="/perfumes/for-her"
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-[#171717] hover:bg-[#FAF7F2] hover:text-[#98702B] transition-colors"
                  >
                    <span className="text-[#98702B]">●</span>
                    <span>For Her – {t('عطور نسائية', 'For Her')}</span>
                  </Link>
                  <Link
                    href="/perfumes/unisex"
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-[#171717] hover:bg-[#FAF7F2] hover:text-[#98702B] transition-colors"
                  >
                    <span className="text-[#98702B]">●</span>
                    <span>Unisex – {t('عطور للجنسين', 'Unisex')}</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Core Categories Links */}
            <Link
              href="/category/oud-incense"
              className="hover:text-[#98702B] transition-colors py-1 flex items-center gap-1.5"
            >
              <Flame className="w-3.5 h-3.5 text-[#98702B]" />
              <span>{t('البخور والعود', 'Incense & Oud')}</span>
            </Link>

            <Link
              href="/category/sets-gifts"
              className="hover:text-[#98702B] transition-colors py-1 flex items-center gap-1.5"
            >
              <Gift className="w-3.5 h-3.5 text-[#98702B]" />
              <span>{t('المجموعات والهدايا', 'Sets & Gifts')}</span>
            </Link>

            <Link
              href="/category/home-fragrances"
              className="hover:text-[#98702B] transition-colors py-1 flex items-center gap-1.5"
            >
              <Home className="w-3.5 h-3.5 text-[#98702B]" />
              <span>{t('معطرات المنزل', 'Home Fragrances')}</span>
            </Link>

            <Link
              href="/category/body-splash"
              className="hover:text-[#98702B] transition-colors py-1 flex items-center gap-1.5"
            >
              <Droplets className="w-3.5 h-3.5 text-[#98702B]" />
              <span>{t('البادي سبلاش', 'Body Splash')}</span>
            </Link>

            <Link
              href="/category/makhmariyat"
              className="hover:text-[#98702B] transition-colors py-1 flex items-center gap-1.5"
            >
              <HeartHandshake className="w-3.5 h-3.5 text-[#98702B]" />
              <span>{t('المخمريات', 'Makhmariyat')}</span>
            </Link>

            <Link
              href="/#featured-products"
              className="text-[#98702B] hover:text-[#171717] font-bold transition-colors py-1 flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t('المختارات المميزة', 'Featured')}</span>
            </Link>
          </nav>
        </div>
      </header>

      {/* 3. Mobile Navigation Drawer (Light Luxury Theme) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          <div
            className={`fixed top-0 bottom-0 ${
              direction === 'rtl' ? 'right-0' : 'left-0'
            } w-[85vw] max-w-sm bg-white border-l border-r border-[#C49A45]/30 z-50 p-5 sm:p-6 flex flex-col justify-between overflow-y-auto shadow-2xl`}
          >
            <div>
              {/* Drawer Top Header: Logo + Brand + Close Button */}
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 flex-shrink-0">
                    <Image
                      src="/logo.png"
                      alt="روائع للعطور"
                      fill
                      sizes="48px"
                      className="object-contain"
                    />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-[#171717] leading-tight">
                      {t('روائع للعطور', 'RAWAEI')}
                    </h4>
                    <p className="text-[10px] text-[#98702B] font-black tracking-wider uppercase">
                      RAWAEI PERFUMES
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-9 h-9 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-gray-500 hover:text-black transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Search Bar with live search inside drawer */}
              <div className="pt-4 pb-2">
                <form onSubmit={handleSearchSubmit} className="relative w-full">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => {
                      if (searchResults.length > 0) setShowSearchDropdown(true);
                    }}
                    placeholder={t('ابحث عن عطر، بخور، عود...', 'Search perfumes, oud, incense...')}
                    className="w-full bg-[#FAF7F2] text-[#171717] text-xs pl-9 pr-9 py-2.5 rounded-full border border-[#C49A45]/40 focus:border-[#C49A45] focus:outline-none focus:ring-2 focus:ring-[#C49A45]/20 shadow-inner"
                  />
                  <Search className="absolute top-1/2 -translate-y-1/2 right-3 w-4 h-4 text-[#98702B]" />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setShowSearchDropdown(false);
                      }}
                      className="absolute top-1/2 -translate-y-1/2 left-3 text-gray-400 hover:text-black"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </form>

                {/* Autocomplete Dropdown inside drawer */}
                {showSearchDropdown && searchResults.length > 0 && (
                  <div className="mt-2 bg-[#FAF7F2] border border-[#C49A45]/30 rounded-2xl shadow-lg overflow-hidden animate-in fade-in">
                    <div className="p-2 border-b border-gray-200/60 text-[11px] text-gray-500 font-bold">
                      {t('النتائج المطابقة:', 'Matching products:')}
                    </div>
                    <div className="max-h-56 overflow-y-auto divide-y divide-gray-200/50">
                      {searchResults.map((product) => {
                        const img =
                          product.images?.[0]?.url ||
                          'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=200';
                        const title = language === 'ar' ? product.nameAr : product.nameEn;
                        return (
                          <Link
                            key={product.id}
                            href={`/product/${product.slug}`}
                            onClick={() => {
                              setShowSearchDropdown(false);
                              setIsMobileMenuOpen(false);
                            }}
                            className="flex items-center gap-2.5 p-2 hover:bg-white transition-colors"
                          >
                            <div className="relative w-9 h-9 rounded-lg overflow-hidden bg-white flex-shrink-0 border border-gray-100">
                              <Image src={img} alt={title} fill className="object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-[#171717] truncate">{title}</p>
                              <p className="text-[10px] text-gray-500 truncate">
                                {product.scentFamily || product.gender}
                              </p>
                            </div>
                            <span className="text-[11px] font-black text-[#98702B]">
                              {formatPrice(product.price, language)}
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                    <div className="p-2 bg-white border-t border-gray-200/60 text-center">
                      <button
                        onClick={handleSearchSubmit}
                        className="text-xs text-[#98702B] hover:text-[#C49A45] font-bold"
                      >
                        {t('عرض جميع نتائج البحث', 'View all search results')} →
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* All Categories Links with Icons */}
              <div className="py-3 space-y-1 text-xs sm:text-sm font-semibold text-[#2D2D2D]">
                <Link
                  href="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-[#FAF7F2] text-[#171717] hover:text-[#98702B] transition-colors"
                >
                  <Home className="w-4 h-4 text-[#98702B]" />
                  <span>{t('الرئيسية', 'Home')}</span>
                </Link>

                <Link
                  href="/products"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-[#FAF7F2] text-[#98702B] font-bold transition-colors"
                >
                  <Sparkles className="w-4 h-4 text-[#98702B]" />
                  <span>{t('جميع المنتجات الفاخرة', 'All Royal Products')}</span>
                </Link>

                {/* Perfumes Section Dropdown */}
                <div className="rounded-xl overflow-hidden">
                  <button
                    onClick={() => setIsPerfumesDropdownOpen(!isPerfumesDropdownOpen)}
                    className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-[#FAF7F2] text-[#171717] hover:text-[#98702B] transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Droplets className="w-4 h-4 text-[#98702B]" />
                      <span>{t('أقسام العطور', 'Perfume Collections')}</span>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        isPerfumesDropdownOpen ? 'rotate-180 text-[#98702B]' : ''
                      }`}
                    />
                  </button>
                  {isPerfumesDropdownOpen && (
                    <div className="pr-8 pl-4 py-1.5 space-y-1 bg-[#FAF7F2]/80 rounded-lg text-xs">
                      <Link
                        href="/perfumes"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block py-1 text-gray-700 hover:text-[#98702B]"
                      >
                        {t('جميع العطور', 'All Perfumes')}
                      </Link>
                      <Link
                        href="/perfumes/for-him"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block py-1 text-[#98702B] font-bold"
                      >
                        For Him – {t('عطور رجالية', 'For Him')}
                      </Link>
                      <Link
                        href="/perfumes/for-her"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block py-1 text-[#98702B] font-bold"
                      >
                        For Her – {t('عطور نسائية', 'For Her')}
                      </Link>
                      <Link
                        href="/perfumes/unisex"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block py-1 text-[#98702B] font-bold"
                      >
                        Unisex – {t('عطور للجنسين', 'Unisex')}
                      </Link>
                    </div>
                  )}
                </div>

                <Link
                  href="/category/oud-incense"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-[#FAF7F2] text-gray-700 hover:text-[#98702B] transition-colors"
                >
                  <Flame className="w-4 h-4 text-[#98702B]" />
                  <span>{t('البخور والعود الملكي', 'Incense & Oud')}</span>
                </Link>

                <Link
                  href="/category/sets-gifts"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-[#FAF7F2] text-gray-700 hover:text-[#98702B] transition-colors"
                >
                  <Gift className="w-4 h-4 text-[#98702B]" />
                  <span>{t('المجموعات وبوكسات الهدايا', 'Sets & Gifts')}</span>
                </Link>

                <Link
                  href="/category/home-fragrances"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-[#FAF7F2] text-gray-700 hover:text-[#98702B] transition-colors"
                >
                  <Home className="w-4 h-4 text-[#98702B]" />
                  <span>{t('معطرات المنزل والمفارش', 'Home Fragrances')}</span>
                </Link>

                <Link
                  href="/category/body-splash"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-[#FAF7F2] text-gray-700 hover:text-[#98702B] transition-colors"
                >
                  <Droplets className="w-4 h-4 text-[#98702B]" />
                  <span>{t('البادي سبلاش المنعش', 'Body Splash')}</span>
                </Link>

                <Link
                  href="/category/makhmariyat"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-[#FAF7F2] text-gray-700 hover:text-[#98702B] transition-colors"
                >
                  <HeartHandshake className="w-4 h-4 text-[#98702B]" />
                  <span>{t('المخمريات الحريرية', 'Makhmariyat')}</span>
                </Link>

                <Link
                  href="/#featured-products"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-[#C49A45]/10 text-[#98702B] font-bold hover:bg-[#C49A45]/20 transition-colors"
                >
                  <Sparkles className="w-4 h-4 text-[#C49A45]" />
                  <span>{t('المختارات الحصرية', 'Exclusive Selection')}</span>
                </Link>
              </div>
            </div>

            {/* Bottom Drawer: Customer Account & Language Toggle */}
            <div className="pt-4 border-t border-gray-100 space-y-2.5">
              <button
                onClick={toggleLanguage}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[#C49A45]/30 text-[#171717] bg-[#FAF7F2] hover:bg-white text-xs font-bold transition-all shadow-sm"
              >
                <Globe className="w-4 h-4 text-[#98702B]" />
                <span>{language === 'ar' ? 'English Language (EN)' : 'اللغة العربية (AR)'}</span>
              </button>

              <Link
                href="/account"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[#C49A45]/40 text-[#98702B] bg-white text-xs font-bold shadow-sm"
              >
                <User className="w-4 h-4" />
                <span>{t('حسابي وتتبع الطلبات', 'My Account & Orders')}</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
