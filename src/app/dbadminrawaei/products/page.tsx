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
import { autoTranslate, autoTranslateBatch } from '@/lib/translate';

interface SizeEntry {
  id?: string;
  sizeMl: number;
  price: string;
  comparePrice: string;
  stock: string;
  isDefault: boolean;
}

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

  // Bottle Sizes state
  const [sizes, setSizes] = useState<SizeEntry[]>([
    { sizeMl: 50, price: '650', comparePrice: '850', stock: '20', isDefault: false },
    { sizeMl: 100, price: '950', comparePrice: '1250', stock: '30', isDefault: true },
  ]);

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
      price: '650',
      compareAtPrice: '850',
      stock: '50',
      volumeMl: '50',
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
    setSizes([
      { sizeMl: 50, price: '650', comparePrice: '850', stock: '20', isDefault: true },
      { sizeMl: 100, price: '950', comparePrice: '1250', stock: '30', isDefault: false },
    ]);
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

    if (p.sizes && p.sizes.length > 0) {
      setSizes(
        p.sizes.map((s) => ({
          id: s.id,
          sizeMl: s.sizeMl,
          price: String(s.price),
          comparePrice: s.comparePrice ? String(s.comparePrice) : '',
          stock: String(s.stock ?? 10),
          isDefault: Boolean(s.isDefault),
        }))
      );
    } else {
      setSizes([
        {
          sizeMl: p.volumeMl || 100,
          price: String(p.price),
          comparePrice: p.compareAtPrice ? String(p.compareAtPrice) : '',
          stock: String(p.stock),
          isDefault: true,
        },
      ]);
    }

    setFormError(null);
    setViewMode('FORM');
  };

  const handleAddSizePreset = (ml: number) => {
    if (sizes.some((s) => s.sizeMl === ml)) {
      alert(`حجم الزجاجة ${ml} مل مضاف بالفعل في القائمة أدناه`);
      return;
    }
    const lastPrice = sizes.length > 0 ? parseFloat(sizes[sizes.length - 1].price) || 800 : 800;
    const estPrice = Math.round(lastPrice * (ml / (sizes[sizes.length - 1]?.sizeMl || 100)));
    const estCompare = Math.round(estPrice * 1.3);

    setSizes((prev) => [
      ...prev,
      {
        sizeMl: ml,
        price: String(estPrice),
        comparePrice: String(estCompare),
        stock: '20',
        isDefault: prev.length === 0,
      },
    ]);
  };

  const handleAddCustomSize = () => {
    const mlStr = prompt('أدخل حجم الزجاجة بالمليلتر (مثال: 30 أو 75 أو 250):');
    if (!mlStr) return;
    const ml = parseInt(mlStr);
    if (isNaN(ml) || ml <= 0) {
      alert('يرجى إدخال رقم صحيح وموجب لحجم الزجاجة');
      return;
    }
    handleAddSizePreset(ml);
  };

  const handleUpdateSize = (index: number, field: keyof SizeEntry, value: any) => {
    setSizes((prev) => {
      const copy = [...prev];
      if (field === 'isDefault') {
        return copy.map((item, i) => ({
          ...item,
          isDefault: i === index,
        }));
      }
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleRemoveSize = (index: number) => {
    if (sizes.length <= 1) {
      alert('يجب الإبقاء على حجم زجاجة واحد على الأقل للعطر');
      return;
    }
    setSizes((prev) => {
      const filtered = prev.filter((_, i) => i !== index);
      if (!filtered.some((s) => s.isDefault)) {
        filtered[0].isDefault = true;
      }
      return filtered;
    });
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);

    try {
      if (!formData.nameAr.trim()) {
        throw new Error('يرجى كتابة اسم العطر بالعربية');
      }

      if (!formData.descriptionAr.trim()) {
        throw new Error('يرجى كتابة وصف ومكونات العطر بالعربية');
      }

      if (sizes.length === 0) {
        throw new Error('يرجى إضافة حجم زجاجة واحد على الأقل للعطر مع السعر');
      }

      // Auto-translate Arabic inputs to English in the background
      let translatedNameEn = formData.nameEn.trim();
      let translatedDescEn = formData.descriptionEn.trim();
      let translatedTopNotes = formData.topNotes.trim();
      let translatedHeartNotes = formData.heartNotes.trim();
      let translatedBaseNotes = formData.baseNotes.trim();

      try {
        const textsToTranslate: Record<string, string> = {
          name: formData.nameAr.trim(),
          desc: formData.descriptionAr.trim(),
        };
        if (formData.topNotes.trim()) textsToTranslate.top = formData.topNotes.trim();
        if (formData.heartNotes.trim()) textsToTranslate.heart = formData.heartNotes.trim();
        if (formData.baseNotes.trim()) textsToTranslate.base = formData.baseNotes.trim();

        const transRes = await autoTranslateBatch(textsToTranslate);
        if (transRes.name) translatedNameEn = transRes.name;
        if (transRes.desc) translatedDescEn = transRes.desc;
        if (transRes.top) translatedTopNotes = transRes.top;
        if (transRes.heart) translatedHeartNotes = transRes.heart;
        if (transRes.base) translatedBaseNotes = transRes.base;
      } catch (transErr) {
        console.warn('Auto translation warning:', transErr);
      }

      if (!translatedNameEn) translatedNameEn = formData.nameAr.trim();
      if (!translatedDescEn) translatedDescEn = formData.descriptionAr.trim();

      const cleanSlug =
        formData.slug.trim() ||
        translatedNameEn
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '') ||
        `perfume-${Date.now()}`;

      const defaultSize = sizes.find((s) => s.isDefault) || sizes[0];
      const mainPrice = parseFloat(defaultSize.price) || parseFloat(formData.price) || 0;
      const mainComparePrice = defaultSize.comparePrice
        ? parseFloat(defaultSize.comparePrice)
        : formData.compareAtPrice
        ? parseFloat(formData.compareAtPrice)
        : null;
      const mainVolume = Number(defaultSize.sizeMl) || 100;
      const totalStock =
        sizes.reduce((acc, s) => acc + (parseInt(s.stock) || 0), 0) || parseInt(formData.stock) || 0;

      const payload = {
        nameAr: formData.nameAr,
        nameEn: translatedNameEn,
        slug: cleanSlug,
        descriptionAr: formData.descriptionAr,
        descriptionEn: translatedDescEn,
        price: mainPrice,
        compareAtPrice: mainComparePrice,
        stock: totalStock,
        volumeMl: mainVolume,
        gender: formData.gender,
        scentFamily: formData.scentFamily,
        topNotes: translatedTopNotes,
        heartNotes: translatedHeartNotes,
        baseNotes: translatedBaseNotes,
        longevity: formData.longevity,
        sillage: formData.sillage,
        isFeatured: formData.isFeatured,
        isActive: formData.isActive,
        categoryId: formData.categoryId,
        images: formData.imageUrl ? [{ url: formData.imageUrl }] : undefined,
        sizes: sizes.map((s) => ({
          sizeMl: Number(s.sizeMl) || 100,
          price: parseFloat(s.price) || 0,
          comparePrice: s.comparePrice ? parseFloat(s.comparePrice) : null,
          stock: parseInt(s.stock) || 0,
          isDefault: Boolean(s.isDefault),
        })),
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
            </div>

            <div className="flex flex-wrap items-center gap-3">
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
                className="gold-button px-7 py-2.5 rounded-xl text-xs font-black text-black shadow-md hover:brightness-105 disabled:opacity-50 cursor-pointer flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-black" />
                <span>{saving ? 'جارٍ الترجمة والحفظ... ✨' : editingProduct ? 'ترجمة وحفظ التعديلات' : 'ترجمة وحفظ'}</span>
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
              <div className="space-y-1.5 sm:col-span-2">
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
                <label className="text-black font-black text-xs block">الوصف بالعربية ومكونات العطر الفاخرة *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="عطر فاخر يمزج بين عبق العود المعتّق والنفحات الخشبية والجلدية الساحرة..."
                  value={formData.descriptionAr}
                  onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
                  className="w-full bg-[#FAF8F5] border border-[#DFC27A]/40 rounded-xl p-3 text-xs text-black font-bold placeholder-[#777777] focus:outline-none focus:border-[#C49A45] focus:bg-white"
                />
              </div>

              {/* Bottle Sizes and Pricing Section */}
              <div className="sm:col-span-2 border-t border-[#DFC27A]/30 pt-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-black font-black text-sm block flex items-center gap-2">
                      <span>🍾 أحجام الزجاجات والأسعار لكل حجم (Bottle Sizes & Multi-Volume Pricing) *</span>
                    </span>
                    <span className="text-[11px] text-neutral-600 font-bold block mt-0.5">
                      حدد أحجام العبوات المتوفرة لهذا العطر مع تحديد السعر بعد الخصم والسعر قبل الخصم والمخزون لكل حجم
                    </span>
                  </div>

                  {/* Quick Add Preset Buttons */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-black text-neutral-500">إضافة سريعة:</span>
                    {[30, 50, 75, 100, 150, 200].map((ml) => (
                      <button
                        key={ml}
                        type="button"
                        onClick={() => handleAddSizePreset(ml)}
                        className="px-2.5 py-1 rounded-lg bg-[#FAF8F5] hover:bg-[#C49A45]/20 border border-[#DFC27A]/40 text-black font-black text-[11px] transition-colors cursor-pointer"
                      >
                        +{ml} مل
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={handleAddCustomSize}
                      className="px-2.5 py-1 rounded-lg gold-button text-black font-black text-[11px] transition-colors cursor-pointer"
                    >
                      + حجم آخر
                    </button>
                  </div>
                </div>

                {/* Sizes Table / Cards */}
                <div className="space-y-3">
                  {sizes.map((s, idx) => {
                    const priceNum = parseFloat(s.price) || 0;
                    const compareNum = parseFloat(s.comparePrice) || 0;
                    const discountPercent =
                      compareNum > priceNum && priceNum > 0
                        ? Math.round(((compareNum - priceNum) / compareNum) * 100)
                        : null;

                    return (
                      <div
                        key={s.id || idx}
                        className={`p-4 rounded-2xl border transition-all ${
                          s.isDefault
                            ? 'bg-amber-50/60 border-[#C49A45] shadow-xs'
                            : 'bg-[#FAF8F5] border-[#DFC27A]/40'
                        }`}
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                          {/* Size volume */}
                          <div className="sm:col-span-2 space-y-1">
                            <label className="text-[11px] font-black text-black block">حجم الزجاجة (مل)</label>
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                required
                                min="5"
                                value={s.sizeMl}
                                onChange={(e) =>
                                  handleUpdateSize(idx, 'sizeMl', parseInt(e.target.value) || 50)
                                }
                                className="w-full bg-white border border-[#DFC27A]/50 rounded-xl px-3 py-2 text-xs font-bold text-black focus:outline-none focus:border-[#C49A45]"
                              />
                              <span className="text-xs font-black text-neutral-600">مل</span>
                            </div>
                          </div>

                          {/* Price after discount (selling price) */}
                          <div className="sm:col-span-3 space-y-1">
                            <label className="text-[11px] font-black text-black block">
                              السعر بعد الخصم (ج.م) *
                            </label>
                            <input
                              type="number"
                              required
                              step="0.01"
                              placeholder="السعر الفعلي"
                              value={s.price}
                              onChange={(e) => handleUpdateSize(idx, 'price', e.target.value)}
                              className="w-full bg-white border border-[#DFC27A]/50 rounded-xl px-3 py-2 text-xs font-bold text-black focus:outline-none focus:border-[#C49A45]"
                            />
                          </div>

                          {/* Compare price before discount */}
                          <div className="sm:col-span-3 space-y-1">
                            <div className="flex items-center justify-between">
                              <label className="text-[11px] font-black text-black block">
                                السعر قبل الخصم (ج.م)
                              </label>
                              {discountPercent && (
                                <span className="text-[10px] font-black text-red-700 bg-red-100 px-1.5 py-0.5 rounded">
                                  خصم {discountPercent}%
                                </span>
                              )}
                            </div>
                            <input
                              type="number"
                              step="0.01"
                              placeholder="اختياري (سعر الشطب)"
                              value={s.comparePrice}
                              onChange={(e) => handleUpdateSize(idx, 'comparePrice', e.target.value)}
                              className="w-full bg-white border border-[#DFC27A]/50 rounded-xl px-3 py-2 text-xs font-bold text-black focus:outline-none focus:border-[#C49A45]"
                            />
                          </div>

                          {/* Stock */}
                          <div className="sm:col-span-2 space-y-1">
                            <label className="text-[11px] font-black text-black block">المخزون (قطعة)</label>
                            <input
                              type="number"
                              required
                              min="0"
                              value={s.stock}
                              onChange={(e) => handleUpdateSize(idx, 'stock', e.target.value)}
                              className="w-full bg-white border border-[#DFC27A]/50 rounded-xl px-3 py-2 text-xs font-bold text-black focus:outline-none focus:border-[#C49A45]"
                            />
                          </div>

                          {/* Default toggle & Remove action */}
                          <div className="sm:col-span-2 flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-4">
                            <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-bold text-black">
                              <input
                                type="radio"
                                name="default_bottle_size"
                                checked={s.isDefault}
                                onChange={() => handleUpdateSize(idx, 'isDefault', true)}
                                className="accent-[#C49A45]"
                              />
                              <span>افتراضي</span>
                            </label>

                            <button
                              type="button"
                              onClick={() => handleRemoveSize(idx)}
                              className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer"
                              title="حذف هذا الحجم"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
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
                className="gold-button px-7 py-2.5 rounded-xl text-xs font-black text-black shadow-md hover:brightness-105 disabled:opacity-50 cursor-pointer flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-black" />
                <span>{saving ? 'جارٍ الترجمة والحفظ... ✨' : editingProduct ? 'ترجمة وحفظ التعديلات' : 'ترجمة وحفظ'}</span>
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
                          {p.sizes && p.sizes.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {p.sizes.map((sz) => (
                                <span
                                  key={sz.id || sz.sizeMl}
                                  className={`text-[10px] font-black px-1.5 py-0.5 rounded-md border ${
                                    sz.isDefault
                                      ? 'bg-amber-100 text-amber-950 border-amber-300'
                                      : 'bg-[#FAF7F2] text-neutral-800 border-[#DFC27A]/30'
                                  }`}
                                >
                                  {sz.sizeMl} مل ({sz.price} ج.م)
                                </span>
                              ))}
                            </div>
                          )}
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
