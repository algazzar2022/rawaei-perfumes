'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Sliders,
  Image as ImageIcon,
  Film,
  Layers,
  Plus,
  Trash2,
  Check,
  Sparkles,
  Save,
  ArrowUpDown,
} from 'lucide-react';
import { BannerDto, BannerSlideDto } from '@/lib/types';

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<BannerDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Hero Banner Form State
  const [heroMode, setHeroMode] = useState<'STATIC' | 'SLIDESHOW' | 'VIDEO'>('SLIDESHOW');
  const [heroTitleAr, setHeroTitleAr] = useState('');
  const [heroTitleEn, setHeroTitleEn] = useState('');
  const [heroSubtitleAr, setHeroSubtitleAr] = useState('');
  const [heroSubtitleEn, setHeroSubtitleEn] = useState('');
  const [heroDesktopImg, setHeroDesktopImg] = useState('');
  const [heroMobileImg, setHeroMobileImg] = useState('');
  const [heroVideoUrl, setHeroVideoUrl] = useState('');
  const [heroLink, setHeroLink] = useState('');
  const [heroBtnTextAr, setHeroBtnTextAr] = useState('');
  const [heroBtnTextEn, setHeroBtnTextEn] = useState('');
  const [slides, setSlides] = useState<any[]>([]);

  // Promo Banners State
  const [promoWide, setPromoWide] = useState<any>({});
  const [promoSmall1, setPromoSmall1] = useState<any>({});
  const [promoSmall2, setPromoSmall2] = useState<any>({});

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/banners');
      const data = await res.json();
      const list: BannerDto[] = data.banners || [];
      setBanners(list);

      const hero = list.find((b) => b.type === 'HERO');
      if (hero) {
        setHeroMode((hero.mode as any) || 'SLIDESHOW');
        setHeroTitleAr(hero.titleAr || '');
        setHeroTitleEn(hero.titleEn || '');
        setHeroSubtitleAr(hero.subtitleAr || '');
        setHeroSubtitleEn(hero.subtitleEn || '');
        setHeroDesktopImg(hero.desktopImage || '');
        setHeroMobileImg(hero.mobileImage || '');
        setHeroVideoUrl(hero.videoUrl || '');
        setHeroLink(hero.link || '');
        setHeroBtnTextAr(hero.buttonTextAr || '');
        setHeroBtnTextEn(hero.buttonTextEn || '');
        setSlides(hero.slides || []);
      }

      const wide = list.find((b) => b.type === 'PROMO_WIDE');
      if (wide) setPromoWide(wide);

      const sm1 = list.find((b) => b.type === 'PROMO_SMALL_1');
      if (sm1) setPromoSmall1(sm1);

      const sm2 = list.find((b) => b.type === 'PROMO_SMALL_2');
      if (sm2) setPromoSmall2(sm2);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  // Save Hero Banner settings
  const handleSaveHero = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const hero = banners.find((b) => b.type === 'HERO');
      if (!hero) return;

      const res = await fetch(`/api/banners/${hero.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: heroMode,
          titleAr: heroTitleAr,
          titleEn: heroTitleEn,
          subtitleAr: heroSubtitleAr,
          subtitleEn: heroSubtitleEn,
          desktopImage: heroDesktopImg,
          mobileImage: heroMobileImg,
          videoUrl: heroVideoUrl,
          link: heroLink,
          buttonTextAr: heroBtnTextAr,
          buttonTextEn: heroBtnTextEn,
          slides,
        }),
      });

      if (!res.ok) throw new Error('فشل حفظ البانر الرئيسي');
      setMessage('تم حفظ إعدادات البانر الرئيسي والشرائح بنجاح!');
      setTimeout(() => setMessage(null), 3000);
      fetchBanners();
    } catch (err: any) {
      alert(err.message || 'خطأ في الحفظ');
    } finally {
      setSaving(false);
    }
  };

  // Save Promotional Banners
  const handleSavePromo = async () => {
    setSaving(true);
    setMessage(null);
    try {
      if (promoWide.id) {
        await fetch(`/api/banners/${promoWide.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(promoWide),
        });
      }
      if (promoSmall1.id) {
        await fetch(`/api/banners/${promoSmall1.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(promoSmall1),
        });
      }
      if (promoSmall2.id) {
        await fetch(`/api/banners/${promoSmall2.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(promoSmall2),
        });
      }
      setMessage('تم حفظ البانرات الإعلانية بنجاح!');
      setTimeout(() => setMessage(null), 3000);
      fetchBanners();
    } catch (err: any) {
      alert(err.message || 'خطأ في حفظ البانرات الإعلانية');
    } finally {
      setSaving(false);
    }
  };

  // Add a new slide to slides list
  const addSlide = () => {
    setSlides([
      ...slides,
      {
        id: `slide-new-${Date.now()}`,
        titleAr: 'عنوان شريحة جديد',
        titleEn: 'New Slide Title',
        subtitleAr: 'وصف مختصر للشريحة العطرية',
        subtitleEn: 'Short description',
        desktopImage: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=1920',
        mobileImage: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=800',
        link: '/perfumes',
        buttonTextAr: 'تسوق الآن',
        buttonTextEn: 'Shop Now',
        durationSeconds: 5,
        isActive: true,
      },
    ]);
  };

  const removeSlide = (idx: number) => {
    setSlides(slides.filter((_, i) => i !== idx));
  };

  const updateSlideField = (idx: number, field: string, val: any) => {
    const copy = [...slides];
    copy[idx] = { ...copy[idx], [field]: val };
    setSlides(copy);
  };

  return (
    <div className="space-y-10 pb-12">
      <div>
        <h1 className="text-2xl font-black text-white">إدارة البانرات والسلايدر والفيديو</h1>
        <p className="text-xs text-gray-400 mt-1">
          التحكم في البانر الرئيسي بثلاثة أوضاع (صورة، سلايدر، فيديو)، وتخصيص البانرات الإعلانية
        </p>
      </div>

      {message && (
        <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-200 text-xs font-bold">
          {message}
        </div>
      )}

      {/* ============================================================== */}
      {/* 1. HERO BANNER SETTINGS                                        */}
      {/* ============================================================== */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-[#C49A45]/30 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-[#C49A45]" />
              <span>البانر الرئيسي للمتجر (Hero Banner)</span>
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              اختر وضع العرض المناسب: صورة ثابتة، سلايدشو متعدد الصور، أو فيديو
            </p>
          </div>

          <button
            onClick={handleSaveHero}
            disabled={saving}
            className="gold-button px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-gold-glow"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'جاري الحفظ...' : 'حفظ إعدادات البانر الرئيسي'}</span>
          </button>
        </div>

        {/* 3 Modes Selector Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            type="button"
            onClick={() => setHeroMode('STATIC')}
            className={`p-4 rounded-2xl border text-right transition-all flex items-center gap-3 ${
              heroMode === 'STATIC'
                ? 'bg-[#C49A45]/20 border-[#C49A45] text-white shadow-gold-glow'
                : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
            }`}
          >
            <ImageIcon className="w-6 h-6 text-[#DFC27A]" />
            <div>
              <div className="font-bold text-xs">1. صورة ثابتة (Static)</div>
              <div className="text-[11px] opacity-75">صورة واحدة عريضة فائقة الجودة</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setHeroMode('SLIDESHOW')}
            className={`p-4 rounded-2xl border text-right transition-all flex items-center gap-3 ${
              heroMode === 'SLIDESHOW'
                ? 'bg-[#C49A45]/20 border-[#C49A45] text-white shadow-gold-glow'
                : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
            }`}
          >
            <Layers className="w-6 h-6 text-[#DFC27A]" />
            <div>
              <div className="font-bold text-xs">2. Slideshow متعدد الصور</div>
              <div className="text-[11px] opacity-75">شرائح متعددة قابلة للتبديل والمدة</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setHeroMode('VIDEO')}
            className={`p-4 rounded-2xl border text-right transition-all flex items-center gap-3 ${
              heroMode === 'VIDEO'
                ? 'bg-[#C49A45]/20 border-[#C49A45] text-white shadow-gold-glow'
                : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
            }`}
          >
            <Film className="w-6 h-6 text-[#DFC27A]" />
            <div>
              <div className="font-bold text-xs">3. فيديو (Video)</div>
              <div className="text-[11px] opacity-75">فيديو سنيمائي يعمل تلقائياً وبشكل متكرر</div>
            </div>
          </button>
        </div>

        {/* Mode-specific Fields */}
        {heroMode === 'STATIC' && (
          <div className="p-5 rounded-2xl bg-white/5 border border-white/5 space-y-4 text-xs">
            <h3 className="font-bold text-white text-sm">بيانات الصورة الثابتة:</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-gray-300">رابط صورة الكمبيوتر (1920x800)</label>
                <input
                  type="url"
                  value={heroDesktopImg}
                  onChange={(e) => setHeroDesktopImg(e.target.value)}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-white"
                  dir="ltr"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-300">رابط صورة الموبايل (800x900 بدون تشويه)</label>
                <input
                  type="url"
                  value={heroMobileImg}
                  onChange={(e) => setHeroMobileImg(e.target.value)}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-white"
                  dir="ltr"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-300">العنوان بالعربية</label>
                <input
                  type="text"
                  value={heroTitleAr}
                  onChange={(e) => setHeroTitleAr(e.target.value)}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-300">العنوان بالإنجليزية</label>
                <input
                  type="text"
                  value={heroTitleEn}
                  onChange={(e) => setHeroTitleEn(e.target.value)}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-white"
                  dir="ltr"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-gray-300">الوصف الترويجي</label>
                <input
                  type="text"
                  value={heroSubtitleAr}
                  onChange={(e) => setHeroSubtitleAr(e.target.value)}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-300">رابط الزر (Link)</label>
                <input
                  type="text"
                  value={heroLink}
                  onChange={(e) => setHeroLink(e.target.value)}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-white"
                  dir="ltr"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-300">نص الزر</label>
                <input
                  type="text"
                  value={heroBtnTextAr}
                  onChange={(e) => setHeroBtnTextAr(e.target.value)}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-white"
                />
              </div>
            </div>
          </div>
        )}

        {heroMode === 'VIDEO' && (
          <div className="p-5 rounded-2xl bg-white/5 border border-white/5 space-y-4 text-xs">
            <h3 className="font-bold text-white text-sm">بيانات فيديو البانر:</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1 sm:col-span-2">
                <label className="text-gray-300">رابط الفيديو (Direct MP4 URL) *</label>
                <input
                  type="url"
                  value={heroVideoUrl}
                  onChange={(e) => setHeroVideoUrl(e.target.value)}
                  placeholder="https://.../video.mp4"
                  className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-white"
                  dir="ltr"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-300">العنوان بالعربية</label>
                <input
                  type="text"
                  value={heroTitleAr}
                  onChange={(e) => setHeroTitleAr(e.target.value)}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-300">العنوان بالإنجليزية</label>
                <input
                  type="text"
                  value={heroTitleEn}
                  onChange={(e) => setHeroTitleEn(e.target.value)}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-white"
                  dir="ltr"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-gray-300">الوصف الفرعي</label>
                <input
                  type="text"
                  value={heroSubtitleAr}
                  onChange={(e) => setHeroSubtitleAr(e.target.value)}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-white"
                />
              </div>
            </div>
          </div>
        )}

        {heroMode === 'SLIDESHOW' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-sm">
                شرائح السلايد شو الحالية ({slides.length}):
              </h3>
              <button
                type="button"
                onClick={addSlide}
                className="gold-button px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة شريحة جديدة</span>
              </button>
            </div>

            <div className="space-y-4">
              {slides.map((s, idx) => (
                <div
                  key={s.id || idx}
                  className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4 text-xs"
                >
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <span className="font-bold text-[#DFC27A]">
                      الشريحة رقم {idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeSlide(idx)}
                      className="text-red-400 hover:text-red-300 flex items-center gap-1 text-xs"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>حذف الشريحة</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-gray-300">صورة الكمبيوتر (URL)</label>
                      <input
                        type="url"
                        value={s.desktopImage}
                        onChange={(e) => updateSlideField(idx, 'desktopImage', e.target.value)}
                        className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-1.5 text-white"
                        dir="ltr"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-gray-300">صورة الموبايل (URL)</label>
                      <input
                        type="url"
                        value={s.mobileImage}
                        onChange={(e) => updateSlideField(idx, 'mobileImage', e.target.value)}
                        className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-1.5 text-white"
                        dir="ltr"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-gray-300">مدة العرض (بالثواني)</label>
                      <input
                        type="number"
                        min="2"
                        max="30"
                        value={s.durationSeconds || 5}
                        onChange={(e) =>
                          updateSlideField(idx, 'durationSeconds', parseInt(e.target.value) || 5)
                        }
                        className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-1.5 text-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-gray-300">عنوان الشريحة</label>
                      <input
                        type="text"
                        value={s.titleAr}
                        onChange={(e) => updateSlideField(idx, 'titleAr', e.target.value)}
                        className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-1.5 text-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-gray-300">رابط التحويل عند الضغط</label>
                      <input
                        type="text"
                        value={s.link}
                        onChange={(e) => updateSlideField(idx, 'link', e.target.value)}
                        placeholder="/perfumes/for-him"
                        className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-1.5 text-white"
                        dir="ltr"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-gray-300">نص الزر</label>
                      <input
                        type="text"
                        value={s.buttonTextAr}
                        onChange={(e) => updateSlideField(idx, 'buttonTextAr', e.target.value)}
                        className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-1.5 text-white"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* 2. PROMOTIONAL BANNERS MANAGEMENT                              */}
      {/* ============================================================== */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-[#C49A45]/30 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#C49A45]" />
              <span>قسم البانرات الإعلانية (بانر عريض + بانران صغيران)</span>
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              تعديل صور ونصوص وروابط البانرات الإعلانية الترويجية في الصفحة الرئيسية
            </p>
          </div>

          <button
            onClick={handleSavePromo}
            disabled={saving}
            className="gold-button px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-gold-glow"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'جاري الحفظ...' : 'حفظ البانرات الإعلانية'}</span>
          </button>
        </div>

        {/* 1. Wide Banner Form */}
        <div className="p-5 rounded-2xl bg-white/5 border border-white/5 space-y-3 text-xs">
          <span className="font-bold text-white text-sm block">1. البانر الإعلاني العريض:</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-gray-300">العنوان بالعربية</label>
              <input
                type="text"
                value={promoWide.titleAr || ''}
                onChange={(e) => setPromoWide({ ...promoWide, titleAr: e.target.value })}
                className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-gray-300">الوصف</label>
              <input
                type="text"
                value={promoWide.subtitleAr || ''}
                onChange={(e) => setPromoWide({ ...promoWide, subtitleAr: e.target.value })}
                className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-gray-300">رابط صورة الكمبيوتر (1200x800)</label>
              <input
                type="url"
                value={promoWide.desktopImage || ''}
                onChange={(e) => setPromoWide({ ...promoWide, desktopImage: e.target.value })}
                className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-white"
                dir="ltr"
              />
            </div>
            <div className="space-y-1">
              <label className="text-gray-300">رابط الانتقال (Link)</label>
              <input
                type="text"
                value={promoWide.link || ''}
                onChange={(e) => setPromoWide({ ...promoWide, link: e.target.value })}
                className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-white"
                dir="ltr"
              />
            </div>
          </div>
        </div>

        {/* 2. Small Banners 1 and 2 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Small Banner 1 */}
          <div className="p-5 rounded-2xl bg-white/5 border border-white/5 space-y-3 text-xs">
            <span className="font-bold text-white text-sm block">2. البانر الإعلاني الصغير الأول:</span>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-gray-300">العنوان</label>
                <input
                  type="text"
                  value={promoSmall1.titleAr || ''}
                  onChange={(e) => setPromoSmall1({ ...promoSmall1, titleAr: e.target.value })}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-gray-300">رابط الصورة (URL)</label>
                <input
                  type="url"
                  value={promoSmall1.desktopImage || ''}
                  onChange={(e) => setPromoSmall1({ ...promoSmall1, desktopImage: e.target.value })}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-white"
                  dir="ltr"
                />
              </div>
              <div className="space-y-1">
                <label className="text-gray-300">رابط الانتقال</label>
                <input
                  type="text"
                  value={promoSmall1.link || ''}
                  onChange={(e) => setPromoSmall1({ ...promoSmall1, link: e.target.value })}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-white"
                  dir="ltr"
                />
              </div>
            </div>
          </div>

          {/* Small Banner 2 */}
          <div className="p-5 rounded-2xl bg-white/5 border border-white/5 space-y-3 text-xs">
            <span className="font-bold text-white text-sm block">3. البانر الإعلاني الصغير الثاني:</span>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-gray-300">العنوان</label>
                <input
                  type="text"
                  value={promoSmall2.titleAr || ''}
                  onChange={(e) => setPromoSmall2({ ...promoSmall2, titleAr: e.target.value })}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-gray-300">رابط الصورة (URL)</label>
                <input
                  type="url"
                  value={promoSmall2.desktopImage || ''}
                  onChange={(e) => setPromoSmall2({ ...promoSmall2, desktopImage: e.target.value })}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-white"
                  dir="ltr"
                />
              </div>
              <div className="space-y-1">
                <label className="text-gray-300">رابط الانتقال</label>
                <input
                  type="text"
                  value={promoSmall2.link || ''}
                  onChange={(e) => setPromoSmall2({ ...promoSmall2, link: e.target.value })}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-white"
                  dir="ltr"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
