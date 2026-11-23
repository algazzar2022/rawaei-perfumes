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
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import { ProductDto, CategoryDto } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import MediaUploader from '@/components/admin/MediaUploader';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedGender, setSelectedGender] = useState('ALL');

  // Page View Mode: 'LIST' (table) or 'FORM' (create/edit)
  const [viewMode, setViewMode] = useState<'LIST' | 'FORM'>('LIST');
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

      if (prodData.products) setProducts(prodData.products);
      if (catData.categories) setCategories(catData.categories);
    } catch (err) {
      console.error('Failed to load products/categories', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateForm = () => {
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
    setViewMode('FORM');
  };

  const openEditForm = (p: ProductDto) => {
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
    setViewMode('FORM');
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);

    try {
      const payload = {
        nameAr: formData.nameAr,
        nameEn: formData.nameEn,
        slug: formData.slug || formData.nameEn.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        descriptionAr: formData.descriptionAr,
        descriptionEn: formData.descriptionEn,
        price: parseFloat(formData.price) || 0,
        compareAtPrice: formData.compareAtPrice ? parseFloat(formData.compareAtPrice) : null,
        stock: parseInt(formData.stock) || 0,
        gender: formData.gender,
        scentFamily: formData.scentFamily,
        topNotes: formData.topNotes,
        heartNotes: formData.heartNotes,
        baseNotes: formData.baseNotes,
        longevity: formData.longevity,
        sillage: formData.sillage,
        isFeatured: formData.isFeatured,
        isActive: formData.isActive,
        categoryId: formData.categoryId,
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

      setViewMode('LIST');
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
      {/* ============================================================== */}
      {/* 1. FULL PAGE FORM VIEW (Create / Edit Product)                */}
      {/* ============================================================== */}
      {viewMode === 'FORM' ? (
        <div className="space-y-6">
          {/* Top Bar for Form */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#DFC27A]/40 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <button
                type="button"
                onClick={() => setViewMode('LIST')}
                className="inline-flex items-center gap-2 text-xs font-black text-black hover:text-[#98702B] mb-2 transition-colors cursor-pointer"
              >
                <ArrowRight className="w-4 h-4 text-black" />
                <span>العودة إلى جدول المنتجات</span>
              </button>
              <h1 className="text-2xl font-black text-black">
                {editingProduct ? `تعديل بيانات العطر: ${editingProduct.nameAr}` : 'إضافة عطر فاخر جديد'}
              </h1>
              <p className="text-xs text-neutral-600 mt-1">
                املأ البيانات والمواصفات العطرية أدناه، ثم اضغط حفظ لتحديث المتجر مباشرة
              </p>
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
                form="product-form"
                disabled={saving}
                className="gold-button px-6 py-2.5 rounded-xl text-xs font-black text-black shadow-md hover:brightness-105 disabled:opacity-50 cursor-pointer"
              >
                {saving ? 'جاري الحفظ...' : editingProduct ? 'حفظ التعديلات' : 'نشر العطر الجديد'}
              </button>
            </div>
          </div>

          {formError && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-300 text-red-900 text-xs font-bold">
              {formError}
            </div>
          )}

          {/* Full Width White Form */}
          <form
            id="product-form"
            onSubmit={handleSaveProduct}
            className="bg-white rounded-3xl p-6 sm:p-8 border border-[#DFC27A]/40 shadow-sm space-y-6 text-xs"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-black font-black text-xs block">اسم العطر بالعربية *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: عطر سوفرين ليذر الملكي"
                  value={formData.nameAr}
                  onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                  className="w-full bg-[#FAF8F5] border border-[#DFC27A]/40 rounded-xl px-4 py-2.5 text-xs text-black font-bold placeholder-[#777777] focus:outline-none focus:border-[#C49A45] focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-black font-black text-xs block">اسم العطر بالإنجليزية *</label>
                <input
                  type="text"
                  required
                  placeholder="Sovereign Leather Royal Perfume"
                  value={formData.nameEn}
                  onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                  className="w-full bg-[#FAF8F5] border border-[#DFC27A]/40 rounded-xl px-4 py-2.5 text-xs text-black font-bold placeholder-[#777777] focus:outline-none focus:border-[#C49A45] focus:bg-white"
                  dir="ltr"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-black font-black text-xs block">المعرف اللطيف (Slug) *</label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="sovereign-leather"
                  className="w-full bg-[#FAF8F5] border border-[#DFC27A]/40 rounded-xl px-4 py-2.5 text-xs text-black font-bold placeholder-[#777777] focus:outline-none focus:border-[#C49A45] focus:bg-white"
                  dir="ltr"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-black font-black text-xs block">التصنيف *</label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full bg-[#FAF8F5] border border-[#DFC27A]/40 rounded-xl px-4 py-2.5 text-xs text-black font-bold focus:outline-none focus:border-[#C49A45] focus:bg-white"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nameAr}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-black font-black text-xs block">القسم (الجنس)</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full bg-[#FAF8F5] border border-[#DFC27A]/40 rounded-xl px-4 py-2.5 text-xs text-black font-bold focus:outline-none focus:border-[#C49A45] focus:bg-white"
                >
                  <option value="HIM">For Him (رجالي)</option>
                  <option value="HER">For Her (نسائي)</option>
                  <option value="UNISEX">Unisex (للجنسين)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-black font-black text-xs block">السعر الحالي (ج.م) *</label>
                <input
                  type="number"
                  required
                  step="0.01"
                  placeholder="850"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full bg-[#FAF8F5] border border-[#DFC27A]/40 rounded-xl px-4 py-2.5 text-xs text-black font-bold placeholder-[#777777] focus:outline-none focus:border-[#C49A45] focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-black font-black text-xs block">السعر قبل الخصم (اختياري)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="1100"
                  value={formData.compareAtPrice}
                  onChange={(e) => setFormData({ ...formData, compareAtPrice: e.target.value })}
                  className="w-full bg-[#FAF8F5] border border-[#DFC27A]/40 rounded-xl px-4 py-2.5 text-xs text-black font-bold placeholder-[#777777] focus:outline-none focus:border-[#C49A45] focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-black font-black text-xs block">كمية المخزون *</label>
                <input
                  type="number"
                  required
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  className="w-full bg-[#FAF8F5] border border-[#DFC27A]/40 rounded-xl px-4 py-2.5 text-xs text-black font-bold placeholder-[#777777] focus:outline-none focus:border-[#C49A45] focus:bg-white"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <MediaUploader
                  label="صورة المنتج (يتم ضغط الحجم فورياً ورفعها إلى Cloudinary)"
                  value={formData.imageUrl}
                  onChange={(url) => setFormData({ ...formData, imageUrl: url })}
                  acceptType="image"
                  folder="products"
                  placeholder="https://res.cloudinary.com/..."
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-black font-black text-xs block">الوصف بالعربية</label>
                <textarea
                  rows={3}
                  placeholder="عطر فاخر يمزج بين عبق العود المعتّق والنفحات الخشبية والجلدية الساحرة..."
                  value={formData.descriptionAr}
                  onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
                  className="w-full bg-[#FAF8F5] border border-[#DFC27A]/40 rounded-xl p-3 text-xs text-black font-bold placeholder-[#777777] focus:outline-none focus:border-[#C49A45] focus:bg-white"
                />
              </div>

              {/* Fragrance Pyramid Section */}
              <div className="sm:col-span-2 border-t border-[#DFC27A]/30 pt-4 space-y-3">
                <span className="text-black font-black text-sm block">الهرم العطري والمواصفات:</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-black font-black">الافتتاحية (Top Notes)</label>
                    <input
                      type="text"
                      value={formData.topNotes}
                      onChange={(e) => setFormData({ ...formData, topNotes: e.target.value })}
                      placeholder="البرغموت، الهيل..."
                      className="w-full bg-[#FAF8F5] border border-[#DFC27A]/40 rounded-xl px-3 py-2 text-xs text-black font-bold focus:outline-none focus:border-[#C49A45] focus:bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-black font-black">قلب العطر (Heart Notes)</label>
                    <input
                      type="text"
                      value={formData.heartNotes}
                      onChange={(e) => setFormData({ ...formData, heartNotes: e.target.value })}
                      placeholder="الورد الدمشقي، اللافندر..."
                      className="w-full bg-[#FAF8F5] border border-[#DFC27A]/40 rounded-xl px-3 py-2 text-xs text-black font-bold focus:outline-none focus:border-[#C49A45] focus:bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-black font-black">القاعدة (Base Notes)</label>
                    <input
                      type="text"
                      value={formData.baseNotes}
                      onChange={(e) => setFormData({ ...formData, baseNotes: e.target.value })}
                      placeholder="خشب العود، العنبر، المسك..."
                      className="w-full bg-[#FAF8F5] border border-[#DFC27A]/40 rounded-xl px-3 py-2 text-xs text-black font-bold focus:outline-none focus:border-[#C49A45] focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap items-center gap-6 sm:col-span-2 pt-2 border-t border-[#DFC27A]/20">
                <label className="flex items-center gap-2 cursor-pointer text-black font-bold">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="w-4 h-4 accent-[#C49A45]"
                  />
                  <span>إظهار في قسم المنتجات المميزة (Featured)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-black font-bold">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 accent-[#C49A45]"
                  />
                  <span>تفعيل المنتج وعرضه في المتجر</span>
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
                {saving ? 'جاري الحفظ...' : editingProduct ? 'حفظ التعديلات' : 'نشر العطر الجديد'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* ============================================================== */
        /* 2. TABLE VIEW (List of Products)                               */
        /* ============================================================== */
        <>
          {/* Top Controls Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-black">إدارة المنتجات والعطور</h1>
              <p className="text-xs text-neutral-600 mt-1">
                إضافة وتعديل وحذف العطور، تحديد الأسعار، الأحجام، والنوتات العطرية
              </p>
            </div>

            <button
              onClick={openCreateForm}
              className="gold-button px-5 py-2.5 rounded-xl text-xs font-black text-black flex items-center gap-2 self-start sm:self-auto shadow-md hover:brightness-105 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-black" />
              <span>إضافة عطر جديد</span>
            </button>
          </div>

          {/* Filter and Search Bar */}
          <div className="bg-white rounded-2xl p-4 border border-[#DFC27A]/40 shadow-sm flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute top-1/2 -translate-y-1/2 right-3 w-4 h-4 text-neutral-500" />
              <input
                type="text"
                placeholder="بحث بالاسم أو SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#FAF8F5] border border-[#DFC27A]/40 rounded-xl pr-10 pl-3 py-2.5 text-xs text-black font-bold placeholder-[#666666] focus:outline-none focus:border-[#C49A45] focus:bg-white"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-[#FAF8F5] border border-[#DFC27A]/40 rounded-xl px-4 py-2.5 text-xs text-black font-bold focus:outline-none focus:border-[#C49A45] focus:bg-white"
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
              className="bg-[#FAF8F5] border border-[#DFC27A]/40 rounded-xl px-4 py-2.5 text-xs text-black font-bold focus:outline-none focus:border-[#C49A45] focus:bg-white"
            >
              <option value="ALL">جميع الأقسام (الجنس)</option>
              <option value="HIM">For Him (رجالي)</option>
              <option value="HER">For Her (نسائي)</option>
              <option value="UNISEX">Unisex (للجنسين)</option>
            </select>
          </div>

          {/* Products Table */}
          <div className="bg-white rounded-3xl border border-[#DFC27A]/40 overflow-hidden shadow-md">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-right">
                <thead className="bg-[#FAF6EE] border-b-2 border-[#DFC27A]/30 text-black">
                  <tr>
                    <th className="p-4 font-black text-black">الصورة</th>
                    <th className="p-4 font-black text-black">اسم العطر</th>
                    <th className="p-4 font-black text-black">التصنيف</th>
                    <th className="p-4 font-black text-black text-center">القسم</th>
                    <th className="p-4 font-black text-black">السعر</th>
                    <th className="p-4 font-black text-black text-center">المخزون</th>
                    <th className="p-4 font-black text-black text-center">مميز؟</th>
                    <th className="p-4 font-black text-black text-center">الحالة</th>
                    <th className="p-4 font-black text-black text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DFC27A]/15 text-black">
                  {filteredProducts.map((p) => {
                    const img = p.images?.[0]?.url || '/logo.png';
                    return (
                      <tr key={p.id} className="hover:bg-[#FAF8F5] transition-colors">
                        <td className="p-4">
                          <div className="relative w-12 h-14 rounded-xl overflow-hidden bg-[#FAF8F5] border border-[#DFC27A]/30">
                            <Image src={img} alt={p.nameAr} fill className="object-contain p-1" sizes="50px" />
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="font-black text-black text-sm">{p.nameAr}</div>
                          <div className="text-[11px] text-neutral-600 font-semibold">{p.nameEn}</div>
                          <div className="text-[10px] text-[#98702B] font-mono font-bold">SKU: {p.sku}</div>
                        </td>
                        <td className="p-4 text-black font-bold">
                          {p.category?.nameAr || '-'}
                        </td>
                        <td className="p-4 text-center">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-black shadow-xs ${
                              p.gender === 'HER'
                                ? 'bg-[#FDF2F8] text-[#9D174D] border border-[#FBCFE8]'
                                : p.gender === 'HIM'
                                ? 'bg-[#EFF6FF] text-[#1E40AF] border border-[#BFDBFE]'
                                : 'bg-[#FEFCE8] text-[#854D0E] border border-[#FEF08A]'
                            }`}
                          >
                            {p.gender === 'HIM' ? 'رجالي 👔' : p.gender === 'HER' ? 'نسائي 🌸' : 'للجنسين ✨'}
                          </span>
                        </td>
                        <td className="p-4 font-black text-black text-sm">
                          {formatPrice(p.price, 'ar')}
                        </td>
                        <td className="p-4 text-center">
                          <span
                            className={`inline-block px-3 py-1 rounded-lg text-xs font-black shadow-xs ${
                              p.stock <= 5
                                ? 'bg-[#FEF2F2] text-[#991B1B] border border-[#FECACA]'
                                : 'bg-[#F0FDF4] text-[#166534] border border-[#BBF7D0]'
                            }`}
                          >
                            {p.stock} قطعة
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          {p.isFeatured ? (
                            <span className="inline-block px-3 py-1 rounded-full bg-[#FFFBEB] text-[#92400E] border border-[#FDE68A] font-black text-xs shadow-xs">
                              مميز ⭐
                            </span>
                          ) : (
                            <span className="text-neutral-400 font-bold text-xs">لا</span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-black shadow-xs ${
                              p.isActive
                                ? 'bg-[#F0FDF4] text-[#166534] border border-[#BBF7D0]'
                                : 'bg-[#F4F4F5] text-[#3F3F46] border border-[#E4E4E7]'
                            }`}
                          >
                            {p.isActive ? 'نشط ✓' : 'معطل ✕'}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => openEditForm(p)}
                              className="w-9 h-9 rounded-xl bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white border border-blue-200 transition-all shadow-xs flex items-center justify-center cursor-pointer"
                              title="تعديل العطر"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(p.id, p.nameAr)}
                              className="w-9 h-9 rounded-xl bg-red-50 hover:bg-red-600 text-red-600 hover:text-white border border-red-200 transition-all shadow-xs flex items-center justify-center cursor-pointer"
                              title="حذف العطر"
                            >
                              <Trash2 className="w-4 h-4" />
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
        </>
      )}
    </div>
  );
}
