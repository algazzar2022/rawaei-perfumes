'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Check,
  X,
  Star,
  Sparkles,
  Layers,
  Filter,
} from 'lucide-react';
import { ProductDto, CategoryDto } from '@/lib/types';
import { formatPrice } from '@/lib/utils';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedGender, setSelectedGender] = useState('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductDto | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form Fields
  const [formData, setFormData] = useState({
    nameAr: '',
    nameEn: '',
    slug: '',
    descriptionAr: '',
    descriptionEn: '',
    price: '',
    compareAtPrice: '',
    stock: '25',
    volumeMl: '100',
    gender: 'UNISEX',
    scentFamily: 'Woody Oriental',
    topNotes: '',
    heartNotes: '',
    baseNotes: '',
    longevity: '18-24 ساعة',
    sillage: 'قوي ونفاذ',
    isFeatured: false,
    isActive: true,
    categoryId: '',
    imageUrl: '',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/categories'),
      ]);
      const prodData = await prodRes.json();
      const catData = await catRes.json();
      setProducts(prodData.products || []);
      setCategories(catData.categories || []);
      if (catData.categories?.length > 0 && !formData.categoryId) {
        setFormData((prev) => ({ ...prev, categoryId: catData.categories[0].id }));
      }
    } catch (e) {
      console.error('Error fetching admin products', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      nameAr: '',
      nameEn: '',
      slug: '',
      descriptionAr: '',
      descriptionEn: '',
      price: '',
      compareAtPrice: '',
      stock: '25',
      volumeMl: '100',
      gender: 'UNISEX',
      scentFamily: 'Woody Oriental',
      topNotes: '',
      heartNotes: '',
      baseNotes: '',
      longevity: '18-24 ساعة',
      sillage: 'قوي ونفاذ',
      isFeatured: false,
      isActive: true,
      categoryId: categories[0]?.id || '',
      imageUrl: '',
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (p: ProductDto) => {
    setEditingProduct(p);
    setFormData({
      nameAr: p.nameAr,
      nameEn: p.nameEn,
      slug: p.slug,
      descriptionAr: p.descriptionAr || '',
      descriptionEn: p.descriptionEn || '',
      price: String(p.price),
      compareAtPrice: p.compareAtPrice ? String(p.compareAtPrice) : '',
      stock: String(p.stock),
      volumeMl: String(p.volumeMl),
      gender: p.gender,
      scentFamily: p.scentFamily || '',
      topNotes: p.topNotes || '',
      heartNotes: p.heartNotes || '',
      baseNotes: p.baseNotes || '',
      longevity: p.longevity || '',
      sillage: p.sillage || '',
      isFeatured: p.isFeatured,
      isActive: p.isActive,
      categoryId: p.categoryId,
      imageUrl: p.images?.[0]?.url || '',
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);

    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        compareAtPrice: formData.compareAtPrice ? parseFloat(formData.compareAtPrice) : null,
        stock: parseInt(formData.stock) || 0,
        volumeMl: parseInt(formData.volumeMl) || 100,
        images: formData.imageUrl ? [{ url: formData.imageUrl }] : undefined,
      };

      const url = editingProduct
        ? `/api/products/${editingProduct.id}`
        : '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'فشل حفظ بيانات المنتج');
      }

      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      setFormError(err.message || 'حدث خطأ أثناء الحفظ');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`هل أنت متأكد من رغبتك في حذف العطر (${name})؟`)) return;

    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'فشل الحذف');
        return;
      }
      fetchData();
    } catch {
      alert('حدث خطأ أثناء الحذف');
    }
  };

  // Filtered list
  const filteredProducts = products.filter((p) => {
    const matchQuery =
      !searchQuery.trim() ||
      p.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchCategory =
      selectedCategory === 'ALL' || p.categoryId === selectedCategory;

    const matchGender =
      selectedGender === 'ALL' || p.gender === selectedGender;

    return matchQuery && matchCategory && matchGender;
  });

  return (
    <div className="space-y-6">
      {/* Top Controls Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">إدارة المنتجات والعطور</h1>
          <p className="text-xs text-gray-400 mt-1">
            إضافة وتعديل وحذف العطور، تحديد الأسعار، الأحجام، والنوتات العطرية
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="gold-button px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 self-start sm:self-auto shadow-gold-glow"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة عطر جديد</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card rounded-2xl p-4 border border-white/10 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute top-1/2 -translate-y-1/2 right-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="بحث بالاسم أو SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#171717] border border-white/10 rounded-xl pr-9 pl-3 py-2 text-xs text-white focus:outline-none focus:border-[#C49A45]"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-[#171717] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C49A45]"
        >
          <option value="ALL">جميع التصنيفات</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nameAr}
            </option>
          ))}
        </select>

        <select
          value={selectedGender}
          onChange={(e) => setSelectedGender(e.target.value)}
          className="bg-[#171717] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C49A45]"
        >
          <option value="ALL">جميع الأقسام (الجنس)</option>
          <option value="HIM">For Him (رجالي)</option>
          <option value="HER">For Her (نسائي)</option>
          <option value="UNISEX">Unisex (للجنسين)</option>
        </select>
      </div>

      {/* Products Table */}
      <div className="glass-card rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-right">
            <thead className="bg-[#151515] border-b border-white/5 text-gray-400">
              <tr>
                <th className="p-4 font-semibold">الصورة</th>
                <th className="p-4 font-semibold">اسم العطر</th>
                <th className="p-4 font-semibold">التصنيف</th>
                <th className="p-4 font-semibold">القسم</th>
                <th className="p-4 font-semibold">السعر</th>
                <th className="p-4 font-semibold">المخزون</th>
                <th className="p-4 font-semibold">مميز؟</th>
                <th className="p-4 font-semibold">الحالة</th>
                <th className="p-4 font-semibold text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-gray-200">
              {filteredProducts.map((p) => {
                const img =
                  p.images?.[0]?.url ||
                  'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=200';
                return (
                  <tr key={p.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <div className="relative w-12 h-14 rounded-xl overflow-hidden bg-neutral-900 border border-white/10">
                        <Image src={img} alt={p.nameAr} fill className="object-cover" sizes="50px" />
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-white text-sm">{p.nameAr}</div>
                      <div className="text-[11px] text-gray-400">{p.nameEn}</div>
                      <div className="text-[10px] text-[#DFC27A]">SKU: {p.sku}</div>
                    </td>
                    <td className="p-4 text-gray-300 font-medium">
                      {p.category?.nameAr || '-'}
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full bg-black/60 border border-white/10 text-[10px] font-bold text-[#DFC27A]">
                        {p.gender === 'HIM' ? 'رجالي' : p.gender === 'HER' ? 'نسائي' : 'للجنسين'}
                      </span>
                    </td>
                    <td className="p-4 font-extrabold text-[#DFC27A] text-sm">
                      {formatPrice(p.price, 'ar')}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                          p.stock <= 5
                            ? 'bg-red-500/20 text-red-300'
                            : 'bg-emerald-500/20 text-emerald-300'
                        }`}
                      >
                        {p.stock} قطعة
                      </span>
                    </td>
                    <td className="p-4">
                      {p.isFeatured ? (
                        <span className="px-2 py-0.5 rounded-full bg-[#C49A45]/20 text-[#DFC27A] font-bold text-[10px]">
                          نعم
                        </span>
                      ) : (
                        <span className="text-gray-500 text-[10px]">لا</span>
                      )}
                    </td>
                    <td className="p-4">
                      {p.isActive ? (
                        <span className="text-emerald-400 font-bold">نشط</span>
                      ) : (
                        <span className="text-red-400 font-bold">معطل</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-[#C49A45] hover:text-black text-gray-300 transition-colors"
                          title="تعديل"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id, p.nameAr)}
                          className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-600 text-red-300 hover:text-white transition-colors"
                          title="حذف"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-[#141414] border border-[#C49A45]/30 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h2 className="text-lg font-bold text-white">
                {editingProduct ? 'تعديل بيانات العطر' : 'إضافة عطر فاخر جديد'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-200 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-gray-300 font-semibold">اسم العطر بالعربية *</label>
                  <input
                    type="text"
                    required
                    value={formData.nameAr}
                    onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                    className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#C49A45]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-gray-300 font-semibold">اسم العطر بالإنجليزية *</label>
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
                    placeholder="royal-black-perfume"
                    className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#C49A45]"
                    dir="ltr"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-gray-300 font-semibold">التصنيف *</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#C49A45]"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nameAr}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-gray-300 font-semibold">القسم (الجنس)</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#C49A45]"
                  >
                    <option value="HIM">For Him (رجال)</option>
                    <option value="HER">For Her (نساء)</option>
                    <option value="UNISEX">Unisex (للجنسين)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-gray-300 font-semibold">السعر الحالي (ج.م) *</label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#C49A45]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-gray-300 font-semibold">السعر قبل الخصم (اختياري)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.compareAtPrice}
                    onChange={(e) => setFormData({ ...formData, compareAtPrice: e.target.value })}
                    className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#C49A45]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-gray-300 font-semibold">كمية المخزون *</label>
                  <input
                    type="number"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#C49A45]"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-gray-300 font-semibold">رابط صورة المنتج (URL)</label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#C49A45]"
                    dir="ltr"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-gray-300 font-semibold">الوصف بالعربية</label>
                  <textarea
                    rows={2}
                    value={formData.descriptionAr}
                    onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
                    className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#C49A45]"
                  />
                </div>

                {/* Fragrance Pyramid */}
                <div className="space-y-1 sm:col-span-2 border-t border-white/5 pt-3">
                  <span className="text-[#DFC27A] font-bold block mb-2">الهرم العطري:</span>
                </div>

                <div className="space-y-1">
                  <label className="text-gray-300">الافتتاحية (Top Notes)</label>
                  <input
                    type="text"
                    value={formData.topNotes}
                    onChange={(e) => setFormData({ ...formData, topNotes: e.target.value })}
                    placeholder="البرغموت، الهيل..."
                    className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-gray-300">قلب العطر (Heart Notes)</label>
                  <input
                    type="text"
                    value={formData.heartNotes}
                    onChange={(e) => setFormData({ ...formData, heartNotes: e.target.value })}
                    placeholder="الورد، اللافندر..."
                    className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-gray-300">القاعدة (Base Notes)</label>
                  <input
                    type="text"
                    value={formData.baseNotes}
                    onChange={(e) => setFormData({ ...formData, baseNotes: e.target.value })}
                    placeholder="خشب العود، العنبر، المسك..."
                    className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-6 sm:col-span-2 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-white font-medium">
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                      className="accent-[#C49A45]"
                    />
                    <span>إظهار في قسم المنتجات المميزة (Featured)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-white font-medium">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="accent-[#C49A45]"
                    />
                    <span>تفعيل المنتج</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-white/10 text-gray-300 hover:text-white"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="gold-button px-6 py-2.5 rounded-xl font-bold"
                >
                  {saving ? 'جاري الحفظ...' : 'حفظ بيانات العطر'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
