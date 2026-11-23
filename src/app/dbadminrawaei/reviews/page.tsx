'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Video,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Play,
  Star,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { VideoReviewDto } from '@/lib/types';
import MediaUploader from '@/components/admin/MediaUploader';

export default function AdminVideoReviewsPage() {
  const [reviews, setReviews] = useState<VideoReviewDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // View Mode: 'LIST' or 'FORM' (no popups)
  const [viewMode, setViewMode] = useState<'LIST' | 'FORM'>('LIST');
  const [editingReview, setEditingReview] = useState<VideoReviewDto | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    authorName: '',
    authorHandle: '',
    quoteAr: '',
    quoteEn: '',
    badgeText: 'REAL REVIEW',
    videoUrl: '',
    posterImage: '',
    platform: 'REELS',
    productTag: '',
    rating: 5,
    sortOrder: 0,
    isActive: true,
  });

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/video-reviews?all=true');
      const data = await res.json();
      if (data.reviews) {
        setReviews(data.reviews);
      }
    } catch (err: any) {
      setError(err.message || 'فشل جلب مراجعات الفيديو');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const openAddForm = () => {
    setEditingReview(null);
    setFormData({
      authorName: '',
      authorHandle: '@',
      quoteAr: '',
      quoteEn: '',
      badgeText: 'REAL REVIEW',
      videoUrl: '',
      posterImage: '',
      platform: 'REELS',
      productTag: '',
      rating: 5,
      sortOrder: reviews.length + 1,
      isActive: true,
    });
    setError(null);
    setSuccessMsg(null);
    setViewMode('FORM');
  };

  const openEditForm = (rev: VideoReviewDto) => {
    setEditingReview(rev);
    setFormData({
      authorName: rev.authorName,
      authorHandle: rev.authorHandle || '',
      quoteAr: rev.quoteAr,
      quoteEn: rev.quoteEn || '',
      badgeText: rev.badgeText || 'REAL REVIEW',
      videoUrl: rev.videoUrl || '',
      posterImage: rev.posterImage,
      platform: rev.platform || 'REELS',
      productTag: rev.productTag || '',
      rating: rev.rating || 5,
      sortOrder: rev.sortOrder || 0,
      isActive: rev.isActive,
    });
    setError(null);
    setSuccessMsg(null);
    setViewMode('FORM');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setSaving(true);

    try {
      if (editingReview) {
        // Update
        const res = await fetch(`/api/video-reviews/${editingReview.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'فشل تعديل المراجعة');
        setSuccessMsg('تم تعديل مراجعة الفيديو بنجاح');
      } else {
        // Create
        const res = await fetch('/api/video-reviews', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'فشل إضافة المراجعة');
        setSuccessMsg('تمت إضافة مراجعة الفيديو بنجاح');
      }

      setViewMode('LIST');
      fetchReviews();
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء الحفظ');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه المراجعة؟')) return;
    try {
      const res = await fetch(`/api/video-reviews/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('فشل الحذف');
      setSuccessMsg('تم حذف مراجعة الفيديو بنجاح');
      fetchReviews();
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء الحذف');
    }
  };

  const toggleActive = async (rev: VideoReviewDto) => {
    try {
      await fetch(`/api/video-reviews/${rev.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !rev.isActive }),
      });
      fetchReviews();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* ============================================================== */}
      {/* 1. FORM VIEW (Create / Edit Video Review)                      */}
      {/* ============================================================== */}
      {viewMode === 'FORM' ? (
        <div className="space-y-6">
          {/* Header Bar */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#DFC27A]/40 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <button
                type="button"
                onClick={() => setViewMode('LIST')}
                className="inline-flex items-center gap-2 text-xs font-black text-black hover:text-[#98702B] mb-2 transition-colors cursor-pointer"
              >
                <ArrowRight className="w-4 h-4 text-black" />
                <span>العودة إلى قائمة الفيديوهات</span>
              </button>
              <h1 className="text-2xl font-black text-black flex items-center gap-2">
                <Video className="w-6 h-6 text-[#98702B]" />
                <span>{editingReview ? `تعديل فيديو: ${editingReview.authorName}` : 'إضافة فيديو تجربة واقعية جديد'}</span>
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setViewMode('LIST')}
                className="px-5 py-2.5 rounded-xl bg-[#FAF8F5] hover:bg-neutral-200 border border-neutral-300 text-xs font-bold text-black transition-colors cursor-pointer"
              >
                إلغاء والرجوع
              </button>
              <button
                type="submit"
                form="review-form"
                disabled={saving}
                className="gold-button px-6 py-2.5 rounded-xl text-xs font-black text-black shadow-md hover:brightness-105 disabled:opacity-50 cursor-pointer"
              >
                {saving ? 'جاري الحفظ...' : editingReview ? 'حفظ التعديلات' : 'نشر الفيديو'}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-300 text-red-900 text-xs font-bold">
              {error}
            </div>
          )}

          {/* Form Content */}
          <form
            id="review-form"
            onSubmit={handleSubmit}
            className="bg-white rounded-3xl p-6 sm:p-8 border border-[#DFC27A]/40 shadow-sm space-y-6 text-xs"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-black font-black text-xs block">اسم المؤثر / العميل *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: منة إيهاب"
                  value={formData.authorName}
                  onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                  className="w-full bg-[#FAF8F5] border border-[#DFC27A]/40 rounded-xl px-4 py-2.5 text-xs text-black font-bold placeholder-[#777777] focus:outline-none focus:border-[#C49A45] focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-black font-black text-xs block">حساب السوشيال ميديا</label>
                <input
                  type="text"
                  placeholder="@mennaehab23"
                  value={formData.authorHandle}
                  onChange={(e) => setFormData({ ...formData, authorHandle: e.target.value })}
                  className="w-full bg-[#FAF8F5] border border-[#DFC27A]/40 rounded-xl px-4 py-2.5 text-xs text-black font-bold placeholder-[#777777] focus:outline-none focus:border-[#C49A45] focus:bg-white"
                  dir="ltr"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <MediaUploader
                  label="صورة غلاف الفيديو (Poster Image - يتم ضغطها ورفعها لكلاوديناري)"
                  value={formData.posterImage}
                  onChange={(url) => setFormData({ ...formData, posterImage: url })}
                  acceptType="image"
                  folder="reviews"
                  placeholder="https://res.cloudinary.com/..."
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <MediaUploader
                  label="ملف الفيديو (MP4 / WebM - يرفع مباشرة لكلاوديناري)"
                  value={formData.videoUrl}
                  onChange={(url) => setFormData({ ...formData, videoUrl: url })}
                  acceptType="video"
                  folder="reviews"
                  placeholder="https://res.cloudinary.com/..."
                />
              </div>

              <div className="space-y-1.5 sm:col-span-1">
                <label className="text-black font-black text-xs block">اقتباس العميل / رأيه في العطر (بالعربية) *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="رأيه في ثبات العطر، التغليف، والفوحان المميز..."
                  value={formData.quoteAr}
                  onChange={(e) => setFormData({ ...formData, quoteAr: e.target.value })}
                  className="w-full bg-[#FAF8F5] border border-[#DFC27A]/40 rounded-xl p-3 text-xs text-black font-bold placeholder-[#777777] focus:outline-none focus:border-[#C49A45] focus:bg-white"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-1">
                <label className="text-black font-black text-xs block">اقتباس العميل بالإنجليزية (Quote in English)</label>
                <textarea
                  rows={3}
                  dir="ltr"
                  placeholder="Customer review in English: longevity, sillage, luxurious packaging..."
                  value={formData.quoteEn}
                  onChange={(e) => setFormData({ ...formData, quoteEn: e.target.value })}
                  className="w-full bg-[#FAF8F5] border border-[#DFC27A]/40 rounded-xl p-3 text-xs text-black font-bold placeholder-[#777777] focus:outline-none focus:border-[#C49A45] focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-black font-black text-xs block">وسم المنتج / البوكس</label>
                <input
                  type="text"
                  placeholder="مثال: بوكس عطور روائع جولد"
                  value={formData.productTag}
                  onChange={(e) => setFormData({ ...formData, productTag: e.target.value })}
                  className="w-full bg-[#FAF8F5] border border-[#DFC27A]/40 rounded-xl px-4 py-2.5 text-xs text-black font-bold placeholder-[#777777] focus:outline-none focus:border-[#C49A45] focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-black font-black text-xs block">شارة الفيديو (Badge)</label>
                <input
                  type="text"
                  placeholder="REAL REVIEW"
                  value={formData.badgeText}
                  onChange={(e) => setFormData({ ...formData, badgeText: e.target.value })}
                  className="w-full bg-[#FAF8F5] border border-[#DFC27A]/40 rounded-xl px-4 py-2.5 text-xs text-black font-bold placeholder-[#777777] focus:outline-none focus:border-[#C49A45] focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-black font-black text-xs block">ترتيب الظهور</label>
                <input
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                  className="w-full bg-[#FAF8F5] border border-[#DFC27A]/40 rounded-xl px-4 py-2.5 text-xs text-black font-bold focus:outline-none focus:border-[#C49A45] focus:bg-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-2 sm:col-span-2">
                <label className="flex items-center gap-2 cursor-pointer text-black font-bold">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 accent-[#C49A45]"
                  />
                  <span>تفعيل ظهور الفيديو في الصفحة الرئيسية للمتجر</span>
                </label>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-6 border-t border-[#DFC27A]/30 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setViewMode('LIST')}
                className="px-5 py-2.5 rounded-xl bg-[#FAF8F5] hover:bg-neutral-200 border border-neutral-300 text-xs font-bold text-black transition-colors cursor-pointer"
              >
                إلغاء والرجوع
              </button>
              <button
                type="submit"
                disabled={saving}
                className="gold-button px-6 py-2.5 rounded-xl text-xs font-black text-black shadow-md hover:brightness-105 disabled:opacity-50 cursor-pointer"
              >
                {saving ? 'جاري الحفظ...' : editingReview ? 'حفظ التعديلات' : 'نشر الفيديو'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* ============================================================== */
        /* 2. REVIEWS LIST VIEW (Cards Grid)                              */
        /* ============================================================== */
        <>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-black">إدارة فيديوهات المؤثرين وتجارب العملاء</h1>
            </div>

            <button
              onClick={openAddForm}
              className="gold-button px-5 py-2.5 rounded-xl text-xs font-black text-black flex items-center gap-2 self-start sm:self-auto shadow-md hover:brightness-105 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-black" />
              <span>إضافة فيديو جديد</span>
            </button>
          </div>

          {error && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-300 text-red-900 text-xs font-bold">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 text-xs font-bold">
              {successMsg}
            </div>
          )}

          {loading ? (
            <div className="p-12 text-center text-neutral-500 text-xs font-bold">جاري تحميل الفيديوهات...</div>
          ) : reviews.length === 0 ? (
            <div className="bg-white border border-[#DFC27A]/40 rounded-3xl p-12 text-center space-y-3 shadow-sm">
              <Video className="w-10 h-10 text-neutral-400 mx-auto" />
              <h3 className="text-base font-black text-black">لا توجد مراجعات فيديو مسجلة حالياً</h3>
              <p className="text-xs text-neutral-600 font-bold">انقر على زر "إضافة فيديو جديد" لرفع أول فيديو ومشاركته مع الزوار</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="bg-white border border-[#DFC27A]/40 hover:border-[#98702B] rounded-3xl overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md transition-all"
                >
                  {/* Poster Thumbnail */}
                  <div className="relative aspect-[9/13] w-full bg-neutral-900 overflow-hidden">
                    <Image
                      src={rev.posterImage || '/logo.png'}
                      alt={rev.authorName}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/30" />

                    <div className="absolute top-3 right-3">
                      <span className="px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-[#DFC27A]/50 text-[10px] font-black text-[#DFC27A]">
                        {rev.badgeText || 'REAL REVIEW'}
                      </span>
                    </div>

                    <div className="absolute top-3 left-3">
                      <button
                        onClick={() => toggleActive(rev)}
                        className={`px-3 py-1 rounded-full text-[10px] font-black shadow-md cursor-pointer ${
                          rev.isActive
                            ? 'bg-emerald-600 text-white'
                            : 'bg-red-600 text-white'
                        }`}
                      >
                        {rev.isActive ? 'مفعل ✓' : 'معطل ✕'}
                      </button>
                    </div>

                    {/* Bottom details inside poster */}
                    <div className="absolute bottom-3 right-3 left-3 space-y-1">
                      <h4 className="text-sm font-black text-white line-clamp-1">{rev.authorName}</h4>
                      <span className="text-[11px] text-[#DFC27A] font-mono font-bold block" dir="ltr">
                        {rev.authorHandle}
                      </span>
                      <p className="text-xs text-neutral-200 line-clamp-2 mt-1 leading-relaxed">
                        "{rev.quoteAr}"
                      </p>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="p-4 bg-white border-t border-[#DFC27A]/20 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-black font-bold">
                      <span>الترتيب:</span>
                      <span className="font-black text-black">{rev.sortOrder}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditForm(rev)}
                        className="p-2 rounded-xl bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white border border-blue-200 transition-all shadow-sm cursor-pointer"
                        title="تعديل الفيديو"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(rev.id)}
                        className="p-2 rounded-xl bg-red-50 hover:bg-red-600 text-red-600 hover:text-white border border-red-200 transition-all shadow-sm cursor-pointer"
                        title="حذف الفيديو"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
