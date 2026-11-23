'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Plus, Edit2, Trash2, Check, X, Layers, Sparkles } from 'lucide-react';
import { CategoryDto } from '@/lib/types';
import MediaUploader from '@/components/admin/MediaUploader';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryDto | null>(null);
  const [saving, setSaving] = useState(false);
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

  const openCreateModal = () => {
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
    setIsModalOpen(true);
  };

  const openEditModal = (c: CategoryDto) => {
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
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editingCategory
        ? `/api/categories/${editingCategory.id}`
        : '/api/categories';
      const method = editingCategory ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('فشل الحفظ');
      setIsModalOpen(false);
      fetchCategories();
    } catch {
      alert('حدث خطأ أثناء حفظ التصنيف');
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">إدارة التصنيفات الرئيسية الستة</h1>
          <p className="text-xs text-gray-400 mt-1">
            التحكم في تصنيفات المتجر (العطور، البخور والعود، الهدايا، معطرات المنزل، البادي سبلاش، والمخمريات)
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="gold-button px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 self-start sm:self-auto shadow-gold-glow"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة تصنيف جديد</span>
        </button>
      </div>

      {/* Categories Cards / Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="glass-card rounded-3xl p-6 border border-[#C49A45]/20 flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="w-8 h-8 rounded-xl bg-[#C49A45]/20 text-[#DFC27A] flex items-center justify-center font-bold text-xs">
                  {cat.sortOrder}
                </span>
                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    cat.isActive
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-red-500/20 text-red-300'
                  }`}
                >
                  {cat.isActive ? 'مفعل' : 'معطل'}
                </span>
              </div>

              {cat.image && (
                <div className="relative h-36 w-full rounded-2xl overflow-hidden bg-neutral-900 border border-white/5">
                  <Image src={cat.image} alt={cat.nameAr} fill className="object-cover" />
                </div>
              )}

              <div>
                <h3 className="text-lg font-bold text-white">{cat.nameAr}</h3>
                <p className="text-xs text-[#DFC27A] font-semibold">{cat.nameEn}</p>
                <p className="text-[11px] text-gray-400 mt-1 font-mono">
                  Slug: /{cat.slug}
                </p>
                {cat.descriptionAr && (
                  <p className="text-xs text-gray-300 line-clamp-2 mt-2 leading-relaxed">
                    {cat.descriptionAr}
                  </p>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs font-bold text-black">
                المنتجات: {cat._count?.products || 0}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEditModal(cat)}
                  className="p-2 rounded-xl bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white border border-blue-200 transition-all shadow-sm"
                  title="تعديل التصنيف"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(cat.id, cat.nameAr)}
                  className="p-2 rounded-xl bg-red-50 hover:bg-red-600 text-red-600 hover:text-white border border-red-200 transition-all shadow-sm"
                  title="حذف التصنيف"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#141414] border border-[#C49A45]/30 rounded-3xl w-full max-w-lg p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h2 className="text-base font-bold text-white">
                {editingCategory ? 'تعديل التصنيف' : 'إضافة تصنيف جديد'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-gray-300 font-semibold">الاسم بالعربية *</label>
                <input
                  type="text"
                  required
                  value={formData.nameAr}
                  onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#C49A45]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-300 font-semibold">الاسم بالإنجليزية *</label>
                <input
                  type="text"
                  required
                  value={formData.nameEn}
                  onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#C49A45]"
                  dir="ltr"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-300 font-semibold">المعرف اللطيف (Slug) *</label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#C49A45]"
                  dir="ltr"
                />
              </div>

              <div className="space-y-1">
                <MediaUploader
                  label="صورة التصنيف (يتم ضغط الحجم فورياً ورفعها إلى Cloudinary)"
                  value={formData.image}
                  onChange={(url) => setFormData({ ...formData, image: url })}
                  acceptType="image"
                  folder="categories"
                  placeholder="https://res.cloudinary.com/..."
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-300 font-semibold">ترتيب الظهور</label>
                <input
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) =>
                    setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })
                  }
                  className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#C49A45]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-300 font-semibold">الوصف بالعربية</label>
                <textarea
                  rows={2}
                  value={formData.descriptionAr}
                  onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#C49A45]"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="catActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="accent-[#C49A45]"
                />
                <label htmlFor="catActive" className="text-white cursor-pointer font-medium">
                  تفعيل ظهور التصنيف في المتجر
                </label>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-white/10 text-gray-300 hover:text-white"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="gold-button px-6 py-2 rounded-xl font-bold"
                >
                  {saving ? 'جاري الحفظ...' : 'حفظ التصنيف'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
