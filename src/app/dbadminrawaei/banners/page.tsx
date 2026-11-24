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
import MediaUploader from '@/components/admin/MediaUploader';
import { autoTranslate, autoTranslateBatch } from '@/lib/translate';

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

  const handleSaveHero = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const hero = banners.find((b) => b.type === 'HERO');
      if (!hero) return;

      // Auto-translate Arabic inputs to English in the background
      let translatedTitleEn = heroTitleEn;
      let translatedSubEn = heroSubtitleEn;
      let translatedBtnEn = heroBtnTextEn;

      try {
        const texts: Record<string, string> = {};
        if (heroTitleAr?.trim()) texts.title = heroTitleAr.trim();
        if (heroSubtitleAr?.trim()) texts.sub = heroSubtitleAr.trim();
        if (heroBtnTextAr?.trim()) texts.btn = heroBtnTextAr.trim();

        if (Object.keys(texts).length > 0) {
          const res = await autoTranslateBatch(texts);
          if (res.title) translatedTitleEn = res.title;
          if (res.sub) translatedSubEn = res.sub;
          if (res.btn) translatedBtnEn = res.btn;
        }
      } catch (e) {
        console.warn('Hero translation error:', e);
      }

      // Translate slide titles if any
      const translatedSlides = await Promise.all(
        slides.map(async (s) => {
          if (s.titleAr?.trim()) {
            try {
              const trans = await autoTranslate(s.titleAr.trim());
              return { ...s, titleEn: trans || s.titleAr };
            } catch {
              return s;
            }
          }
          return s;
        })
      );

      const res = await fetch(`/api/banners/${hero.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: heroMode,
          titleAr: heroTitleAr,
          titleEn: translatedTitleEn || heroTitleAr,
          subtitleAr: heroSubtitleAr,
          subtitleEn: translatedSubEn || heroSubtitleAr,
          desktopImage: heroDesktopImg,
          mobileImage: heroMobileImg,
          videoUrl: heroVideoUrl,
          link: heroLink,
          buttonTextAr: heroBtnTextAr,
          buttonTextEn: translatedBtnEn || heroBtnTextAr,
          slides: translatedSlides,
        }),
      });

      if (!res.ok) throw new Error('فشل حفظ البانر الرئيسي');
      setMessage('تمت الترجمة وحفظ إعدادات البانر الرئيسي بنجاح!');
      setTimeout(() => setMessage(null), 3000);
      fetchBanners();
    } catch (err: any) {
      alert(err.message || 'خطأ في الحفظ');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePromo = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const wideToSave = { ...promoWide };
      const small1ToSave = { ...promoSmall1 };
      const small2ToSave = { ...promoSmall2 };

      try {
        const texts: Record<string, string> = {};
        if (wideToSave.titleAr?.trim()) texts.wTitle = wideToSave.titleAr.trim();
        if (wideToSave.subtitleAr?.trim()) texts.wSub = wideToSave.subtitleAr.trim();
        if (small1ToSave.titleAr?.trim()) texts.s1Title = small1ToSave.titleAr.trim();
        if (small2ToSave.titleAr?.trim()) texts.s2Title = small2ToSave.titleAr.trim();

        if (Object.keys(texts).length > 0) {
          const res = await autoTranslateBatch(texts);
          if (res.wTitle) wideToSave.titleEn = res.wTitle;
          if (res.wSub) wideToSave.subtitleEn = res.wSub;
          if (res.s1Title) small1ToSave.titleEn = res.s1Title;
          if (res.s2Title) small2ToSave.titleEn = res.s2Title;
        }
      } catch (e) {
        console.warn('Promo translation error:', e);
      }

      if (wideToSave.id) {
        await fetch(`/api/banners/${wideToSave.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(wideToSave),
        });
      }
      if (small1ToSave.id) {
        await fetch(`/api/banners/${small1ToSave.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(small1ToSave),
        });
      }
      if (small2ToSave.id) {
        await fetch(`/api/banners/${small2ToSave.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(small2ToSave),
        });
      }
      setMessage('تمت الترجمة وحفظ البانرات الإعلانية بنجاح!');
      setTimeout(() => setMessage(null), 3000);
      fetchBanners();
    } catch (err: any) {
      alert(err.message || 'خطأ في حفظ البانرات الإعلانية');
    } finally {
      setSaving(false);
    }
  };

  const addSlide = () => {
    setSlides([
      ...slides,
      {
        id: `slide-new-${Date.now()}`,
        titleAr: 'عنوان شريحة جديد',
        titleEn: 'New Slide Title',
        subtitleAr: 'وصف مختصر للشريحة العطرية',
        subtitleEn: 'Short description',
        desktopImage: '',
        mobileImage: '',
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
        <h1 className="text-2xl font-black text-black">إدارة البانرات والسلايدر والفيديو</h1>
      </div>

      {message && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 text-xs font-black">
          {message}
        </div>
      )}

      {/* ============================================================== */}
      {/* 1. HERO BANNER SETTINGS                                        */}
      {/* ============================================================== */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#DFC27A]/40 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DFC27A]/20 pb-4">
          <div>
            <h2 className="text-lg font-black text-black flex items-center gap-2">
              <Sliders className="w-5 h-5 text-[#98702B]" />
              <span>البانر الرئيسي للمتجر (Hero Banner)</span>
            </h2>
          </div>

          <button
            onClick={handleSaveHero}
            disabled={saving}
            className="gold-button px-7 py-2.5 rounded-xl text-xs font-black text-black flex items-center gap-2 shadow-md hover:brightness-105 disabled:opacity-50 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-black" />
            <span>{saving ? 'جارٍ الترجمة والحفظ... ✨' : 'ترجمة وحفظ'}</span>
          </button>
        </div>

        {/* 3 Modes Selector Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            type="button"
            onClick={() => setHeroMode('STATIC')}
            className={`p-4 rounded-2xl border text-right transition-all flex items-center gap-3 cursor-pointer ${
              heroMode === 'STATIC'
                ? 'bg-amber-100 border-[#DFC27A] text-black shadow-sm font-black'
                : 'bg-[#FAF8F5] border-neutral-300 text-neutral-700 hover:bg-neutral-100 font-bold'
            }`}
          >
            <ImageIcon className="w-6 h-6 text-[#98702B]" />
            <div>
              <div className="font-black text-xs text-black">1. صورة ثابتة (Static)</div>
              <div className="text-[11px] text-neutral-600">صورة واحدة عريضة فائقة الجودة</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setHeroMode('SLIDESHOW')}
            className={`p-4 rounded-2xl border text-right transition-all flex items-center gap-3 cursor-pointer ${
              heroMode === 'SLIDESHOW'
                ? 'bg-amber-100 border-[#DFC27A] text-black shadow-sm font-black'
                : 'bg-[#FAF8F5] border-neutral-300 text-neutral-700 hover:bg-neutral-100 font-bold'
            }`}
          >
            <Layers className="w-6 h-6 text-[#98702B]" />
            <div>
              <div className="font-black text-xs text-black">2. Slideshow متعدد الصور</div>
              <div className="text-[11px] text-neutral-600">شرائح متعددة قابلة للتبديل والمدة</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setHeroMode('VIDEO')}
            className={`p-4 rounded-2xl border text-right transition-all flex items-center gap-3 cursor-pointer ${
              heroMode === 'VIDEO'
                ? 'bg-amber-100 border-[#DFC27A] text-black shadow-sm font-black'
                : 'bg-[#FAF8F5] border-neutral-300 text-neutral-700 hover:bg-neutral-100 font-bold'
            }`}
          >
            <Film className="w-6 h-6 text-[#98702B]" />
            <div>
              <div className="font-black text-xs text-black">3. فيديو (Video)</div>
              <div className="text-[11px] text-neutral-600">فيديو سنيمائي عالي الدقة</div>
            </div>
          </button>
        </div>

        {/* Mode-specific Fields */}
        {heroMode === 'STATIC' && (
          <div className="p-6 rounded-2xl bg-[#FAF8F5] border border-[#DFC27A]/30 space-y-4 text-xs">
            <h3 className="font-black text-black text-sm">بيانات الصورة الثابتة:</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1 sm:col-span-2">
                <MediaUploader
                  label="صورة الكمبيوتر (1920x800) - تضغط وترفع إلى Cloudinary"
                  value={heroDesktopImg}
                  onChange={(url) => setHeroDesktopImg(url)}
                  acceptType="image"
                  folder="banners"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <MediaUploader
                  label="صورة الموبايل (800x900 بدون تشويه)"
                  value={heroMobileImg}
                  onChange={(url) => setHeroMobileImg(url)}
                  acceptType="image"
                  folder="banners"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-black font-black block">العنوان بالعربية</label>
                <input
                  type="text"
                  value={heroTitleAr}
                  onChange={(e) => setHeroTitleAr(e.target.value)}
                  className="w-full bg-white border border-[#DFC27A]/40 rounded-xl px-4 py-2.5 text-xs text-black font-bold focus:outline-none focus:border-[#C49A45]"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-black font-black block">الوصف الترويجي بالعربية</label>
                <input
                  type="text"
                  value={heroSubtitleAr}
                  onChange={(e) => setHeroSubtitleAr(e.target.value)}
                  className="w-full bg-white border border-[#DFC27A]/40 rounded-xl px-4 py-2.5 text-xs text-black font-bold focus:outline-none focus:border-[#C49A45]"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-1">
                <label className="text-black font-black block">نص الزر بالعربية</label>
                <input
                  type="text"
                  value={heroBtnTextAr}
                  onChange={(e) => setHeroBtnTextAr(e.target.value)}
                  className="w-full bg-white border border-[#DFC27A]/40 rounded-xl px-4 py-2.5 text-xs text-black font-bold focus:outline-none focus:border-[#C49A45]"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-1">
                <label className="text-black font-black block">رابط الزر (Link)</label>
                <input
                  type="text"
                  value={heroLink}
                  onChange={(e) => setHeroLink(e.target.value)}
                  className="w-full bg-white border border-[#DFC27A]/40 rounded-xl px-4 py-2.5 text-xs text-black font-bold focus:outline-none focus:border-[#C49A45]"
                  dir="ltr"
                />
              </div>
            </div>
          </div>
        )}

        {heroMode === 'VIDEO' && (
          <div className="p-6 rounded-2xl bg-[#FAF8F5] border border-[#DFC27A]/30 space-y-4 text-xs">
            <h3 className="font-black text-black text-sm">بيانات فيديو البانر:</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 sm:col-span-2">
                <MediaUploader
                  label="ملف الفيديو (MP4 / WebM - يرفع مباشرة إلى Cloudinary)"
                  value={heroVideoUrl}
                  onChange={(url) => setHeroVideoUrl(url)}
                  acceptType="video"
                  folder="banners"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-black font-black block">العنوان بالعربية</label>
                <input
                  type="text"
                  value={heroTitleAr}
                  onChange={(e) => setHeroTitleAr(e.target.value)}
                  className="w-full bg-white border border-[#DFC27A]/40 rounded-xl px-4 py-2.5 text-xs text-black font-bold focus:outline-none focus:border-[#C49A45]"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-black font-black block">الوصف الفرعي</label>
                <input
                  type="text"
                  value={heroSubtitleAr}
                  onChange={(e) => setHeroSubtitleAr(e.target.value)}
                  className="w-full bg-white border border-[#DFC27A]/40 rounded-xl px-4 py-2.5 text-xs text-black font-bold focus:outline-none focus:border-[#C49A45]"
                />
              </div>
            </div>
          </div>
        )}

        {heroMode === 'SLIDESHOW' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-black text-sm">
                شرائح السلايد شو الحالية ({slides.length}):
              </h3>
              <button
                type="button"
                onClick={addSlide}
                className="gold-button px-4 py-2 rounded-xl text-xs font-black text-black flex items-center gap-1.5 shadow-sm hover:brightness-105 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-black" />
                <span>إضافة شريحة جديدة</span>
              </button>
            </div>

            <div className="space-y-4">
              {slides.map((s, idx) => (
                <div
                  key={s.id || idx}
                  className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#DFC27A]/40 space-y-4 text-xs"
                >
                  <div className="flex items-center justify-between border-b border-[#DFC27A]/20 pb-3">
                    <span className="font-black text-[#98702B] text-sm">
                      الشريحة رقم {idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeSlide(idx)}
                      className="text-red-600 hover:text-red-700 flex items-center gap-1 text-xs font-bold cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>حذف الشريحة</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div className="space-y-1 sm:col-span-2 lg:col-span-3">
                      <MediaUploader
                        label="صورة الكمبيوتر (تضغط وترفع لكلاوديناري)"
                        value={s.desktopImage}
                        onChange={(url) => updateSlideField(idx, 'desktopImage', url)}
                        acceptType="image"
                        folder="banners"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-black font-black block">عنوان الشريحة بالعربية</label>
                      <input
                        type="text"
                        value={s.titleAr}
                        onChange={(e) => updateSlideField(idx, 'titleAr', e.target.value)}
                        className="w-full bg-white border border-[#DFC27A]/40 rounded-xl px-3 py-2 text-xs text-black font-bold focus:outline-none focus:border-[#C49A45]"
                      />
                    </div>


                    <div className="space-y-1">
                      <label className="text-black font-black block">رابط التحويل عند الضغط</label>
                      <input
                        type="text"
                        value={s.link}
                        onChange={(e) => updateSlideField(idx, 'link', e.target.value)}
                        placeholder="/perfumes"
                        className="w-full bg-white border border-[#DFC27A]/40 rounded-xl px-3 py-2 text-xs text-black font-bold focus:outline-none focus:border-[#C49A45]"
                        dir="ltr"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-black font-black block">مدة العرض (بالثواني)</label>
                      <input
                        type="number"
                        min="2"
                        max="30"
                        value={s.durationSeconds || 5}
                        onChange={(e) =>
                          updateSlideField(idx, 'durationSeconds', parseInt(e.target.value) || 5)
                        }
                        className="w-full bg-white border border-[#DFC27A]/40 rounded-xl px-3 py-2 text-xs text-black font-bold focus:outline-none focus:border-[#C49A45]"
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
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#DFC27A]/40 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DFC27A]/20 pb-4">
          <div>
            <h2 className="text-lg font-black text-black flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#98702B]" />
              <span>قسم البانرات الإعلانية (بانر عريض + بانران صغيران)</span>
            </h2>
          </div>

          <button
            onClick={handleSavePromo}
            disabled={saving}
            className="gold-button px-7 py-2.5 rounded-xl text-xs font-black text-black flex items-center gap-2 shadow-md hover:brightness-105 disabled:opacity-50 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-black" />
            <span>{saving ? 'جارٍ الترجمة والحفظ... ✨' : 'ترجمة وحفظ'}</span>
          </button>
        </div>

        {/* 1. Wide Banner Form */}
        <div className="p-6 rounded-2xl bg-[#FAF8F5] border border-[#DFC27A]/30 space-y-3 text-xs">
          <span className="font-black text-black text-sm block">1. البانر الإعلاني العريض:</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-black font-black block">العنوان بالعربية</label>
              <input
                type="text"
                value={promoWide.titleAr || ''}
                onChange={(e) => setPromoWide({ ...promoWide, titleAr: e.target.value })}
                className="w-full bg-white border border-[#DFC27A]/40 rounded-xl px-4 py-2.5 text-xs text-black font-bold focus:outline-none focus:border-[#C49A45]"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-black font-black block">الوصف بالعربية</label>
              <input
                type="text"
                value={promoWide.subtitleAr || ''}
                onChange={(e) => setPromoWide({ ...promoWide, subtitleAr: e.target.value })}
                className="w-full bg-white border border-[#DFC27A]/40 rounded-xl px-4 py-2.5 text-xs text-black font-bold focus:outline-none focus:border-[#C49A45]"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <MediaUploader
                label="صورة البانر العريض (تضغط وترفع لكلاوديناري)"
                value={promoWide.desktopImage || ''}
                onChange={(url) => setPromoWide({ ...promoWide, desktopImage: url })}
                acceptType="image"
                folder="banners"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-black font-black block">رابط الانتقال (Link)</label>
              <input
                type="text"
                value={promoWide.link || ''}
                onChange={(e) => setPromoWide({ ...promoWide, link: e.target.value })}
                className="w-full bg-white border border-[#DFC27A]/40 rounded-xl px-4 py-2.5 text-xs text-black font-bold focus:outline-none focus:border-[#C49A45]"
                dir="ltr"
              />
            </div>
          </div>
        </div>

        {/* 2. Small Banners 1 and 2 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Small Banner 1 */}
          <div className="p-6 rounded-2xl bg-[#FAF8F5] border border-[#DFC27A]/30 space-y-3 text-xs">
            <span className="font-black text-black text-sm block">2. البانر الإعلاني الصغير الأول:</span>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-black font-black block">العنوان بالعربية</label>
                <input
                  type="text"
                  value={promoSmall1.titleAr || ''}
                  onChange={(e) => setPromoSmall1({ ...promoSmall1, titleAr: e.target.value })}
                  className="w-full bg-white border border-[#DFC27A]/40 rounded-xl px-4 py-2.5 text-xs text-black font-bold focus:outline-none focus:border-[#C49A45]"
                />
              </div>
              <div className="space-y-1.5">
                <MediaUploader
                  label="صورة البانر الصغير 1"
                  value={promoSmall1.desktopImage || ''}
                  onChange={(url) => setPromoSmall1({ ...promoSmall1, desktopImage: url })}
                  acceptType="image"
                  folder="banners"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-black font-black block">رابط الانتقال</label>
                <input
                  type="text"
                  value={promoSmall1.link || ''}
                  onChange={(e) => setPromoSmall1({ ...promoSmall1, link: e.target.value })}
                  className="w-full bg-white border border-[#DFC27A]/40 rounded-xl px-4 py-2.5 text-xs text-black font-bold focus:outline-none focus:border-[#C49A45]"
                  dir="ltr"
                />
              </div>
            </div>
          </div>

          {/* Small Banner 2 */}
          <div className="p-6 rounded-2xl bg-[#FAF8F5] border border-[#DFC27A]/30 space-y-3 text-xs">
            <span className="font-black text-black text-sm block">3. البانر الإعلاني الصغير الثاني:</span>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-black font-black block">العنوان بالعربية</label>
                <input
                  type="text"
                  value={promoSmall2.titleAr || ''}
                  onChange={(e) => setPromoSmall2({ ...promoSmall2, titleAr: e.target.value })}
                  className="w-full bg-white border border-[#DFC27A]/40 rounded-xl px-4 py-2.5 text-xs text-black font-bold focus:outline-none focus:border-[#C49A45]"
                />
              </div>
              <div className="space-y-1.5">
                <MediaUploader
                  label="صورة البانر الصغير 2"
                  value={promoSmall2.desktopImage || ''}
                  onChange={(url) => setPromoSmall2({ ...promoSmall2, desktopImage: url })}
                  acceptType="image"
                  folder="banners"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-black font-black block">رابط الانتقال</label>
                <input
                  type="text"
                  value={promoSmall2.link || ''}
                  onChange={(e) => setPromoSmall2({ ...promoSmall2, link: e.target.value })}
                  className="w-full bg-white border border-[#DFC27A]/40 rounded-xl px-4 py-2.5 text-xs text-black font-bold focus:outline-none focus:border-[#C49A45]"
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
