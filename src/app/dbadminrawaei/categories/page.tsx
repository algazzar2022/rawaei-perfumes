'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Plus, Edit2, Trash2, ArrowRight, Layers, Sparkles } from 'lucide-react';
import { CategoryDto } from '@/lib/types';
import MediaUploader from '@/components/admin/MediaUploader';
import { autoTranslate } from '@/lib/translate';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [loading, setLoading] = useState(true);

  // View Mode: 'LIST' | 'FORM' (no popups)
  const [viewMode, setViewMode] = useState<'LIST' | 'FORM'>('LIST');
  const [editingCategory, setEditingCategory] = useState<CategoryDto | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nameAr: '',
    nameEn: '',
    slug: '',
    descriptionAr: '',
    descriptionEn: '',
    image: '',
    icon: 'Sparkles',
    sortOrder: 0,
    isActive: true,
  });

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(data.categories || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreateForm = () => {
    setEditingCategory(null);
    setFormData({
      nameAr: '',
      nameEn: '',
      slug: '',
      descriptionAr: '',
      descriptionEn: '',
      image: '',
      icon: 'Sparkles',
      sortOrder: categories.length + 1,
      isActive: true,
    });
    setFormError(null);
    setViewMode('FORM');
  };

  const openEditForm = (c: CategoryDto) => {
    setEditingCategory(c);
    setFormData({
      nameAr: c.nameAr,
      nameEn: c.nameEn,
      slug: c.slug,
      descriptionAr: c.descriptionAr || '',
      descriptionEn: c.descriptionEn || '',
      image: c.image || '',
      icon: c.icon || 'Sparkles',
      sortOrder: c.sortOrder,
      isActive: c.isActive,
    });
    setFormError(null);
    setViewMode('FORM');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);

    try {
      if (!formData.nameAr.trim()) {
        throw new Error('يرجى كتابة اسم التصنيف بالعربية');
      }

      // Auto-translate Arabic inputs to English in the background
      let translatedNameEn = formData.nameEn.trim();
      let translatedDescEn = formData.descriptionEn.trim();

      try {
        const transName = await autoTranslate(formData.nameAr.trim());
        if (transName) translatedNameEn = transName;

        if (formData.descriptionAr.trim()) {
          const transDesc = await autoTranslate(formData.descriptionAr.trim());
          if (transDesc) translatedDescEn = transDesc;
        }
      } catch (transErr) {
        console.warn('Category auto translation warning:', transErr);
      }

      if (!translatedNameEn) translatedNameEn = formData.nameAr.trim();

      const cleanSlug =
        formData.slug.trim() ||
        translatedNameEn
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '') ||
        `cat-${Date.now()}`;

      const payload = {
        ...formData,
        nameAr: formData.nameAr.trim(),
        nameEn: translatedNameEn,
        slug: cleanSlug,
        descriptionAr: formData.descriptionAr.trim(),
        descriptionEn: translatedDescEn,
      };

      const url = editingCategory
        ? `/api/categories/${editingCategory.id}`
        : '/api/categories';
      const method = editingCategory ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'فشل حفظ التصنيف');

      setViewMode('LIST');
      fetchCategories();
    } catch (err: any) {
      setFormError(err.message || 'حدث خطأ أثناء حفظ التصنيف');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`هل أنت متأكد من رغبتك في حذف التصنيف (${name})؟`)) return;
    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'فشل حذف التصنيف');
        return;
      }
      fetchCategories();
    } catch {
      alert('حدث خطأ أثناء الحذف');
    }
  };

  return (
    <div className="space-y-6">
      {/* ============================================================== */}
      {/* 1. FORM VIEW (Create / Edit Category)                          */}
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
                <span>العودة إلى قائمة التصنيفات</span>
              </button>
              <h1 className="text-2xl font-black text-black">
                {editingCategory ? `تعديل التصنيف: ${editingCategory.nameAr}` : 'إضافة تصنيف رئيسي جديد'}
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
                form="category-form"
                disabled={saving}
                className="gold-button px-7 py-2.5 rounded-xl text-xs font-black text-black shadow-md hover:brightness-105 disabled:opacity-50 cursor-pointer flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-black" />
                <span>{saving ? 'جارٍ الترجمة والحفظ... ✨' : editingCategory ? 'ترجمة وحفظ التعديلات' : 'ترجمة وحفظ'}</span>
              </button>
            </div>
          </div>

          {formError && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-300 text-red-900 text-xs font-bold">
              {formError}
            </div>
          )}

          {/* Form Content */}
          <form
            id="category-form"
            onSubmit={handleSave}
            className="bg-white rounded-3xl p-6 sm:p-8 border border-[#DFC27A]/40 shadow-sm space-y-6 text-xs"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5 sm:col-span-1">
                <label className="text-black font-black text-xs block">اسم التصنيف بالعربية *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: عطور رجالية فاخرة"
                  value={formData.nameAr}
                  onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                  className="w-full bg-[#FAF8F5] border border-[#DFC27A]/40 rounded-xl px-4 py-2.5 text-xs text-black font-bold placeholder-[#777777] focus:outline-none focus:border-[#C49A45] focus:bg-white"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-1">
                <label className="text-black font-black text-xs block">ترتيب الظهور</label>
                <input
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) =>
                    setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })
                  }
                  className="w-full bg-[#FAF8F5] border border-[#DFC27A]/40 rounded-xl px-4 py-2.5 text-xs text-black font-bold focus:outline-none focus:border-[#C49A45] focus:bg-white"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <MediaUploader
                  label="صورة التصنيف (يتم ضغطها فورياً ورفعها إلى Cloudinary)"
                  value={formData.image}
                  onChange={(url) => setFormData({ ...formData, image: url })}
                  acceptType="image"
                  folder="categories"
                  placeholder="https://res.cloudinary.com/..."
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-black font-black text-xs block">الوصف بالعربية</label>
                <textarea
                  rows={3}
                  value={formData.descriptionAr}
                  onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
                  placeholder="وصف مختصر للتصنيف ومحتواه العطري..."
                  className="w-full bg-[#FAF8F5] border border-[#DFC27A]/40 rounded-xl p-3 text-xs text-black font-bold placeholder-[#777777] focus:outline-none focus:border-[#C49A45] focus:bg-white"
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
                  <span>تفعيل ظهور التصنيف في المتجر الرئيسي</span>
                </label>
              </div>
            </div>

            {/* Bottom Form Actions */}
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
                className="gold-button px-7 py-2.5 rounded-xl text-xs font-black text-black shadow-md hover:brightness-105 disabled:opacity-50 cursor-pointer flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-black" />
                <span>{saving ? 'جارٍ الترجمة والحفظ... ✨' : editingCategory ? 'ترجمة وحفظ التعديلات' : 'ترجمة وحفظ'}</span>
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* ============================================================== */
        /* 2. LIST VIEW (Categories Grid)                                 */
        /* ============================================================== */
        <>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-black">إدارة التصنيفات الرئيسية الستة</h1>
            </div>

            <button
              onClick={openCreateForm}
              className="gold-button px-5 py-2.5 rounded-xl text-xs font-black text-black flex items-center gap-2 self-start sm:self-auto shadow-md hover:brightness-105 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-black" />
              <span>إضافة تصنيف جديد</span>
            </button>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="bg-white rounded-3xl p-6 border border-[#DFC27A]/40 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="w-8 h-8 rounded-xl bg-[#FAF6EE] text-[#98702B] border border-[#DFC27A]/30 flex items-center justify-center font-black text-xs">
                      {cat.sortOrder}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-[11px] font-black ${
                        cat.isActive
                          ? 'bg-emerald-100 text-emerald-950 border border-emerald-300'
                          : 'bg-red-100 text-red-950 border border-red-300'
                      }`}
                    >
                      {cat.isActive ? 'مفعل ✓' : 'معطل ✕'}
                    </span>
                  </div>

                  {cat.image ? (
                    <div className="relative h-40 w-full rounded-2xl overflow-hidden bg-[#FAF8F5] border border-[#DFC27A]/30">
                      <Image src={cat.image} alt={cat.nameAr} fill className="object-cover" />
                    </div>
                  ) : (
                    <div className="h-28 w-full rounded-2xl bg-[#FAF8F5] border border-dashed border-[#DFC27A]/40 flex items-center justify-center text-neutral-400 text-xs font-bold">
                      لا توجد صورة
                    </div>
                  )}

                  <div>
                    <h3 className="text-lg font-black text-black">{cat.nameAr}</h3>
                    <p className="text-xs text-[#98702B] font-bold">{cat.nameEn}</p>
                    <p className="text-[11px] text-neutral-500 mt-1 font-mono font-bold">
                      Slug: /{cat.slug}
                    </p>
                    {cat.descriptionAr && (
                      <p className="text-xs text-neutral-700 line-clamp-2 mt-2 leading-relaxed font-medium">
                        {cat.descriptionAr}
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-[#DFC27A]/20 flex items-center justify-between">
                  <span className="text-xs font-black text-black">
                    عدد العطور: {cat._count?.products || 0}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditForm(cat)}
                      className="p-2 rounded-xl bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white border border-blue-200 transition-all shadow-sm cursor-pointer"
                      title="تعديل التصنيف"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id, cat.nameAr)}
                      className="p-2 rounded-xl bg-red-50 hover:bg-red-600 text-red-600 hover:text-white border border-red-200 transition-all shadow-sm cursor-pointer"
                      title="حذف التصنيف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
