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
  ExternalLink,
} from 'lucide-react';
import { VideoReviewDto } from '@/lib/types';
import MediaUploader from '@/components/admin/MediaUploader';

export default function AdminVideoReviewsPage() {
  const [reviews, setReviews] = useState<VideoReviewDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<VideoReviewDto | null>(null);
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

  const openAddModal = () => {
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
    setIsModalOpen(true);
  };

  const openEditModal = (rev: VideoReviewDto) => {
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
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

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

      setIsModalOpen(false);
      fetchReviews();
    } catch (err: any) {
      setError(err.message || 'حدث خطأ');
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
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C49A45]/15 border border-[#C49A45]/30 text-xs font-bold text-[#DFC27A] mb-2">
            <Video className="w-3.5 h-3.5 text-[#C49A45]" />
            <span>قسم المؤثرين وتجارب العملاء</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            إدارة فيديوهات المؤثرين وتجارب العملاء
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            التحكم في قسم الفيديوهات والتجارب الواقعية التي تظهر في الصفحة الرئيسية قبل الفوتر
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="gold-button px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 self-start sm:self-auto shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة فيديو جديد</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/60 border border-red-500/50 text-red-200 text-xs font-semibold">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-200 text-xs font-semibold">
          {successMsg}
        </div>
      )}

      {/* Reviews Grid */}
      {loading ? (
        <div className="p-12 text-center text-gray-400 text-xs">جاري تحميل الفيديوهات...</div>
      ) : reviews.length === 0 ? (
        <div className="bg-[#121212] border border-white/10 rounded-2xl p-12 text-center space-y-3">
          <Video className="w-10 h-10 text-gray-500 mx-auto" />
          <h3 className="text-base font-bold text-white">لا توجد مراجعات فيديو مسجلة</h3>
          <p className="text-xs text-gray-400">انقر على زر "إضافة فيديو جديد" لإضافة أول مراجعة</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-[#141414] border border-[#C49A45]/20 hover:border-[#C49A45] rounded-2xl overflow-hidden flex flex-col justify-between shadow-lg transition-all"
            >
              {/* Poster Thumbnail */}
              <div className="relative aspect-[9/14] w-full bg-black overflow-hidden group">
                <Image
                  src={rev.posterImage}
                  alt={rev.authorName}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/40" />

                <div className="absolute top-3 right-3">
                  <span className="px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[10px] font-bold text-[#DFC27A]">
                    {rev.badgeText || 'REAL REVIEW'}
                  </span>
                </div>

                <div className="absolute top-3 left-3">
                  <button
                    onClick={() => toggleActive(rev)}
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-md ${
                      rev.isActive
                        ? 'bg-emerald-600 text-white'
                        : 'bg-red-600 text-white'
                    }`}
                  >
                    {rev.isActive ? 'مفعل' : 'معطل'}
                  </button>
                </div>

                {/* Bottom details inside poster */}
                <div className="absolute bottom-3 right-3 left-3 space-y-1">
                  <h4 className="text-sm font-bold text-white line-clamp-1">{rev.authorName}</h4>
                  <span className="text-[11px] text-[#DFC27A] font-semibold block" dir="ltr">
                    {rev.authorHandle}
                  </span>
                  <p className="text-xs text-gray-300 line-clamp-2 mt-1">
                    "{rev.quoteAr}"
                  </p>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-3 bg-white border-t border-[#DFC27A]/20 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-black font-bold">
                  <span>الترتيب:</span>
                  <span className="font-black text-black">{rev.sortOrder}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(rev)}
                    className="p-2 rounded-xl bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white border border-blue-200 transition-all shadow-sm"
                    title="تعديل الفيديو"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(rev.id)}
                    className="p-2 rounded-xl bg-red-50 hover:bg-red-600 text-red-600 hover:text-white border border-red-200 transition-all shadow-sm"
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

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-lg bg-[#141414] border border-[#C49A45]/40 rounded-3xl p-6 sm:p-8 space-y-5 my-8 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-lg font-bold text-white">
                {editingReview ? 'تعديل مراجعة الفيديو' : 'إضافة فيديو تجربة جديد'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-gray-300 font-semibold">اسم المؤثر / العميل *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: Menna Ehab"
                    value={formData.authorName}
                    onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                    className="w-full bg-[#1B1B1B] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#C49A45]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-gray-300 font-semibold">حساب إنستجرام / تيك توك</label>
                  <input
                    type="text"
                    placeholder="@mennaehab23"
                    value={formData.authorHandle}
                    onChange={(e) => setFormData({ ...formData, authorHandle: e.target.value })}
                    className="w-full bg-[#1B1B1B] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#C49A45]"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <MediaUploader
                  label="صورة غلاف الفيديو (Poster Image)"
                  value={formData.posterImage}
                  onChange={(url) => setFormData({ ...formData, posterImage: url })}
                  acceptType="image"
                  folder="reviews"
                  placeholder="https://res.cloudinary.com/..."
                />
              </div>

              <div className="space-y-1.5">
                <MediaUploader
                  label="ملف الفيديو (MP4 / WebM)"
                  value={formData.videoUrl}
                  onChange={(url) => setFormData({ ...formData, videoUrl: url })}
                  acceptType="video"
                  folder="reviews"
                  placeholder="https://res.cloudinary.com/..."
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-gray-300 font-semibold">اقتباس العميل / رأيه في العطر (بالعربية) *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="رأيه في ثبات العطر، التغليف، والفوحان..."
                  value={formData.quoteAr}
                  onChange={(e) => setFormData({ ...formData, quoteAr: e.target.value })}
                  className="w-full bg-[#1B1B1B] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#C49A45]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-gray-300 font-semibold">وسم المنتج / البوكس</label>
                  <input
                    type="text"
                    placeholder="مثال: بوكس 3 عطور"
                    value={formData.productTag}
                    onChange={(e) => setFormData({ ...formData, productTag: e.target.value })}
                    className="w-full bg-[#1B1B1B] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#C49A45]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-gray-300 font-semibold">ترتيب الظهور</label>
                  <input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                    className="w-full bg-[#1B1B1B] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#C49A45]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-gray-300 font-semibold">الحالة</label>
                  <select
                    value={formData.isActive ? 'true' : 'false'}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
                    className="w-full bg-[#1B1B1B] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#C49A45]"
                  >
                    <option value="true">مفعل</option>
                    <option value="false">معطل</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/10 text-gray-300 hover:text-white"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="gold-button px-6 py-2 rounded-xl font-bold"
                >
                  {editingReview ? 'حفظ التعديلات' : 'إضافة الفيديو'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
