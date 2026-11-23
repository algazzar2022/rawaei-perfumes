'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Sparkles,
  Phone,
  Mail,
  MapPin,
  Instagram,
  Facebook,
  ShieldCheck,
  Truck,
  RotateCcw,
  Award,
  User,
  Headphones,
  CreditCard,
  Smartphone,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function Footer() {
  const { language, t } = useLanguage();

  return (
    <footer className="relative bg-[#FAF7F2] border-t border-[#C49A45]/30 text-[#171717] overflow-hidden">
      {/* 1. Value Propositions Banner - Perfectly Symmetrical, Centered on Mobile & Balanced on Desktop */}
      <div className="border-b border-[#C49A45]/20 py-6 sm:py-10 bg-white/70 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-6">
            {/* 1. أصالة المنتجات */}
            <div className="group flex flex-col sm:flex-row items-center text-center sm:text-start gap-2 sm:gap-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white/85 hover:bg-white border border-[#C49A45]/25 hover:border-[#C49A45] transition-all duration-300 shadow-sm hover:shadow-md">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-[#C49A45]/15 to-[#98702B]/10 border border-[#C49A45]/30 flex items-center justify-center text-[#98702B] group-hover:bg-[#C49A45] group-hover:text-white transition-all duration-300 flex-shrink-0 shadow-sm">
                <Award className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs sm:text-sm font-black text-[#171717] group-hover:text-[#98702B] transition-colors">
                  {t('أصالة مضمونة ١٠٠٪', '100% Genuine & Authentic')}
                </h4>
                <p className="text-[10px] sm:text-xs text-neutral-600 mt-0.5 line-clamp-1 sm:line-clamp-none">
                  {t('منتجات أصلية بجودة ملكية', 'Certified royal quality essences')}
                </p>
              </div>
            </div>

            {/* 2. التوصيل السريع */}
            <div className="group flex flex-col sm:flex-row items-center text-center sm:text-start gap-2 sm:gap-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white/85 hover:bg-white border border-[#C49A45]/25 hover:border-[#C49A45] transition-all duration-300 shadow-sm hover:shadow-md">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-[#C49A45]/15 to-[#98702B]/10 border border-[#C49A45]/30 flex items-center justify-center text-[#98702B] group-hover:bg-[#C49A45] group-hover:text-white transition-all duration-300 flex-shrink-0 shadow-sm">
                <Truck className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs sm:text-sm font-black text-[#171717] group-hover:text-[#98702B] transition-colors">
                  {t('توصيل سريع وآمن', 'Fast & Secure Shipping')}
                </h4>
                <p className="text-[10px] sm:text-xs text-neutral-600 mt-0.5 line-clamp-1 sm:line-clamp-none">
                  {t('لكافة محافظات جمهورية مصر', 'Nationwide delivery across Egypt')}
                </p>
              </div>
            </div>

            {/* 3. الدفع الإلكتروني */}
            <div className="group flex flex-col sm:flex-row items-center text-center sm:text-start gap-2 sm:gap-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white/85 hover:bg-white border border-[#C49A45]/25 hover:border-[#C49A45] transition-all duration-300 shadow-sm hover:shadow-md">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-[#C49A45]/15 to-[#98702B]/10 border border-[#C49A45]/30 flex items-center justify-center text-[#98702B] group-hover:bg-[#C49A45] group-hover:text-white transition-all duration-300 flex-shrink-0 shadow-sm">
                <Smartphone className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs sm:text-sm font-black text-[#171717] group-hover:text-[#98702B] transition-colors">
                  {t('دفع إلكتروني فوري', 'Instant Online Transfer')}
                </h4>
                <p className="text-[10px] sm:text-xs text-neutral-600 mt-0.5 line-clamp-1 sm:line-clamp-none">
                  {t('عبر انستاباي وفودافون كاش', 'Via InstaPay & Vodafone Cash')}
                </p>
              </div>
            </div>

            {/* 4. خدمة العملاء */}
            <div className="group flex flex-col sm:flex-row items-center text-center sm:text-start gap-2 sm:gap-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white/85 hover:bg-white border border-[#C49A45]/25 hover:border-[#C49A45] transition-all duration-300 shadow-sm hover:shadow-md">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-[#C49A45]/15 to-[#98702B]/10 border border-[#C49A45]/30 flex items-center justify-center text-[#98702B] group-hover:bg-[#C49A45] group-hover:text-white transition-all duration-300 flex-shrink-0 shadow-sm">
                <Headphones className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs sm:text-sm font-black text-[#171717] group-hover:text-[#98702B] transition-colors">
                  {t('خدمة عملاء ومتابعة', 'Dedicated Customer Care')}
                </h4>
                <p className="text-[10px] sm:text-xs text-neutral-600 mt-0.5 line-clamp-1 sm:line-clamp-none">
                  {t('دعم متواصل واهتمام بعد الطلب', 'Ongoing support & after-order care')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Footer Content - Ultra-clean on Mobile (Brand Only), Full Multi-column on Desktop */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 sm:gap-10">
          {/* Col 1 & 2: Brand Info (Centered on Mobile, Left/Right on Desktop) */}
          <div className="lg:col-span-2 flex flex-col items-center lg:items-start text-center lg:text-start space-y-4 sm:space-y-5">
            <Link href="/" className="flex flex-col sm:flex-row items-center gap-3 sm:gap-3.5 group">
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                <Image
                  src="/logo.png"
                  alt="روائع للعطور"
                  fill
                  sizes="(max-width: 640px) 64px, 80px"
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col justify-center items-center sm:items-start">
                <span className="text-2xl sm:text-3xl font-black text-[#171717] group-hover:text-[#98702B] transition-colors leading-tight">
                  روائع للعطور
                </span>
                <p className="text-[10px] sm:text-xs tracking-[0.25em] text-[#98702B] font-black uppercase mt-0.5">
                  RAWAEI PERFUMES
                </p>
              </div>
            </Link>

            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed max-w-md mx-auto lg:mx-0">
              {t(
                'علامة عطور ملكية فاخرة تأسست لتجسد أرقى معاني الفخامة والأناقة في مصر والشرق الأوسط. ننتقي لكم أجود أنواع العود ودهن العود المعتّق وخلاصات العطور الفرنسية النادرة.',
                'A prestigious royal perfume brand celebrating true oriental heritage and Parisian haute parfumerie. Sourcing only the most exquisite aged ouds and sublime essences.'
              )}
            </p>

            {/* Social Media Links (Visible on Desktop only, hidden on mobile per user request) */}
            <div className="pt-2 hidden lg:flex items-center gap-3">
              <a
                href="https://facebook.com/algazzar2015"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white hover:bg-[#C49A45] hover:text-white border border-[#C49A45]/30 flex items-center justify-center text-[#171717] transition-all shadow-sm active:scale-95"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://instagram.com/rawaeiperfumes"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white hover:bg-[#C49A45] hover:text-white border border-[#C49A45]/30 flex items-center justify-center text-[#171717] transition-all shadow-sm active:scale-95"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 3: Categories (Hidden on Mobile per user request, Visible on Desktop) */}
          <div className="hidden lg:flex flex-col items-start text-start space-y-4">
            <h4 className="text-base font-bold text-[#171717] border-r-2 border-[#C49A45] pr-3">
              {t('أقسام المتجر', 'Shop Categories')}
            </h4>
            <ul className="space-y-2.5 text-xs text-neutral-600">
              <li>
                <Link href="/perfumes" className="hover:text-[#98702B] transition-colors py-0.5 inline-block">
                  {t('جميع العطور الفاخرة', 'All Perfumes')}
                </Link>
              </li>
              <li>
                <Link href="/category/oud-incense" className="hover:text-[#98702B] transition-colors py-0.5 inline-block">
                  {t('البخور والعود الملكي', 'Incense & Oud')}
                </Link>
              </li>
              <li>
                <Link href="/category/sets-gifts" className="hover:text-[#98702B] transition-colors py-0.5 inline-block">
                  {t('المجموعات وبوكسات الهدايا', 'Gift Sets')}
                </Link>
              </li>
              <li>
                <Link href="/category/home-fragrances" className="hover:text-[#98702B] transition-colors py-0.5 inline-block">
                  {t('معطرات المنزل والمفارش', 'Home Fragrances')}
                </Link>
              </li>
              <li>
                <Link href="/category/body-splash" className="hover:text-[#98702B] transition-colors py-0.5 inline-block">
                  {t('البادي سبلاش المنعش', 'Body Splash')}
                </Link>
              </li>
              <li>
                <Link href="/category/makhmariyat" className="hover:text-[#98702B] transition-colors py-0.5 inline-block">
                  {t('المخمريات الحريرية', 'Makhmariyat')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Perfume Lines & Policies (Hidden on Mobile per user request, Visible on Desktop) */}
          <div className="hidden lg:flex flex-col items-start text-start space-y-4">
            <h4 className="text-base font-bold text-[#171717] border-r-2 border-[#C49A45] pr-3">
              {t('تشكيلات العطور', 'Fragrance Lines')}
            </h4>
            <ul className="space-y-2.5 text-xs text-neutral-600">
              <li>
                <Link href="/perfumes/for-him" className="hover:text-[#98702B] transition-colors py-0.5 inline-block">
                  {t('عطور رجالية (For Him)', 'For Him')}
                </Link>
              </li>
              <li>
                <Link href="/perfumes/for-her" className="hover:text-[#98702B] transition-colors py-0.5 inline-block">
                  {t('عطور نسائية (For Her)', 'For Her')}
                </Link>
              </li>
              <li>
                <Link href="/perfumes/unisex" className="hover:text-[#98702B] transition-colors py-0.5 inline-block">
                  {t('عطور للجنسين (Unisex)', 'Unisex')}
                </Link>
              </li>
              <li>
                <Link href="/page/about-us" className="hover:text-[#98702B] transition-colors py-0.5 inline-block">
                  {t('قصة روائع للعطور', 'About RAWAEI')}
                </Link>
              </li>
              <li>
                <Link href="/page/shipping-returns" className="hover:text-[#98702B] transition-colors py-0.5 inline-block">
                  {t('سياسة الشحن والاستبدال', 'Shipping & Returns')}
                </Link>
              </li>
              <li>
                <Link href="/page/privacy-policy" className="hover:text-[#98702B] transition-colors py-0.5 inline-block">
                  {t('سياسة الخصوصية والأمان', 'Privacy Policy')}
                </Link>
              </li>
              <li>
                <Link href="/page/terms-and-conditions" className="hover:text-[#98702B] transition-colors py-0.5 inline-block">
                  {t('الشروط والأحكام', 'Terms & Conditions')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 5: Customer Service & Contact Info (Hidden on Mobile per user request, Visible on Desktop) */}
          <div className="hidden lg:flex flex-col items-start text-start space-y-4">
            <h4 className="text-base font-bold text-[#171717] border-r-2 border-[#C49A45] pr-3">
              {t('خدمة العملاء', 'Customer Service')}
            </h4>
            <ul className="space-y-3 text-xs text-neutral-600">
              <li className="flex items-start gap-2.5 max-w-xs">
                <MapPin className="w-4 h-4 text-[#C49A45] flex-shrink-0 mt-0.5" />
                <span>{t('جمهورية مصر العربية، القاهرة – التجمع الخامس، شارع التسعين الشمالي', 'New Cairo, Cairo, Egypt')}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#C49A45] flex-shrink-0" />
                <a href="tel:+201001234567" dir="ltr" className="hover:text-[#98702B] font-semibold transition-colors">
                  +20 100 123 4567
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#C49A45] flex-shrink-0" />
                <a href="mailto:info@rawaei.com" className="hover:text-[#98702B] font-semibold transition-colors">
                  info@rawaei.com
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* 3. Mandatory Exact Copyright & Developer Credit */}
      <div className="border-t border-[#C49A45]/20 bg-[#F0ECE2] py-6 px-4 text-center">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-3 text-xs text-neutral-700">
          <div>
            {t('جميع الحقوق محفوظة 2026 © لشركة روائع للعطور', '© 2026 RAWAEI PERFUMES CO. All Rights Reserved.')}
          </div>
          <div>
            تم التطوير بواسطة{' '}
            <a
              href="https://www.facebook.com/algazzar2015"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#98702B] hover:text-black font-bold underline transition-colors"
            >
              MOHAMED ALGAZZAR
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
