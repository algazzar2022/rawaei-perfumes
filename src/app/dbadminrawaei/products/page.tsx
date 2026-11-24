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
  Droplets,
} from 'lucide-react';
import { ProductDto, CategoryDto, FragranceNoteDto } from '@/lib/types';
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

  // Fragrance Notes Library & Selection State
  const [availableNotes, setAvailableNotes] = useState<FragranceNoteDto[]>([]);
  const [selectedTopNotes, setSelectedTopNotes] = useState<string[]>([]);
  const [selectedHeartNotes, setSelectedHeartNotes] = useState<string[]>([]);
  const [selectedBaseNotes, setSelectedBaseNotes] = useState<string[]>([]);

  // Quick Note Add Form
  const [quickAddModalOpen, setQuickAddModalOpen] = useState(false);
  const [quickAddTier, setQuickAddTier] = useState<'TOP' | 'HEART' | 'BASE'>('TOP');
  const [quickNoteData, setQuickNoteData] = useState({ nameAr: '', category: 'أخشاب', image: '' });
  const [quickNoteSaving, setQuickNoteSaving] = useState(false);

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
      const [prodRes, catRes, notesRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/categories'),
        fetch('/api/fragrance-notes'),
      ]);

      const prodData = await prodRes.json();
      const catData = await catRes.json();
      const notesData = await notesRes.json();

      if (prodData.products) setProducts(prodData.products);
      if (catData.categories) setCategories(catData.categories);
      if (notesData.notes) setAvailableNotes(notesData.notes);
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
    setSelectedTopNotes([]);
    setSelectedHeartNotes([]);
    setSelectedBaseNotes([]);
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

    if (p.fragranceNotes && p.fragranceNotes.length > 0) {
      setSelectedTopNotes(p.fragranceNotes.filter((fn) => fn.type === 'TOP').map((fn) => fn.noteId));
      setSelectedHeartNotes(p.fragranceNotes.filter((fn) => fn.type === 'HEART').map((fn) => fn.noteId));
      setSelectedBaseNotes(p.fragranceNotes.filter((fn) => fn.type === 'BASE').map((fn) => fn.noteId));
    } else {
      setSelectedTopNotes([]);
      setSelectedHeartNotes([]);
      setSelectedBaseNotes([]);
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

  const handleAddNoteToTier = (tier: 'TOP' | 'HEART' | 'BASE', noteId: string) => {
    if (!noteId) return;
    if (tier === 'TOP') {
      if (!selectedTopNotes.includes(noteId)) setSelectedTopNotes([...selectedTopNotes, noteId]);
    } else if (tier === 'HEART') {
      if (!selectedHeartNotes.includes(noteId)) setSelectedHeartNotes([...selectedHeartNotes, noteId]);
    } else if (tier === 'BASE') {
      if (!selectedBaseNotes.includes(noteId)) setSelectedBaseNotes([...selectedBaseNotes, noteId]);
    }
  };

  const handleRemoveNoteFromTier = (tier: 'TOP' | 'HEART' | 'BASE', noteId: string) => {
    if (tier === 'TOP') {
      setSelectedTopNotes(selectedTopNotes.filter((id) => id !== noteId));
    } else if (tier === 'HEART') {
      setSelectedHeartNotes(selectedHeartNotes.filter((id) => id !== noteId));
    } else if (tier === 'BASE') {
      setSelectedBaseNotes(selectedBaseNotes.filter((id) => id !== noteId));
    }
  };

  const handleQuickAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickNoteData.nameAr.trim()) return;
    setQuickNoteSaving(true);
    try {
      const res = await fetch('/api/fragrance-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nameAr: quickNoteData.nameAr.trim(),
          category: quickNoteData.category,
          image: quickNoteData.image.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'فشل حفظ النوتة');

      const createdNote: FragranceNoteDto = data.note;
      setAvailableNotes((prev) => [...prev, createdNote]);
      handleAddNoteToTier(quickAddTier, createdNote.id);
      setQuickAddModalOpen(false);
      setQuickNoteData({ nameAr: '', category: 'أخشاب', image: '' });
    } catch (err: any) {
      alert(err.message || 'حدث خطأ أثناء إضافة النوتة');
    } finally {
      setQuickNoteSaving(false);
    }
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

      // Derive note names from selected fragrance library notes if selected
      const topNoteNamesAr = selectedTopNotes
        .map((id) => availableNotes.find((n) => n.id === id)?.nameAr)
        .filter(Boolean)
        .join('، ');
      const heartNoteNamesAr = selectedHeartNotes
        .map((id) => availableNotes.find((n) => n.id === id)?.nameAr)
        .filter(Boolean)
        .join('، ');
      const baseNoteNamesAr = selectedBaseNotes
        .map((id) => availableNotes.find((n) => n.id === id)?.nameAr)
        .filter(Boolean)
        .join('، ');

      const topNoteNamesEn = selectedTopNotes
        .map((id) => availableNotes.find((n) => n.id === id)?.nameEn)
        .filter(Boolean)
        .join(', ');
      const heartNoteNamesEn = selectedHeartNotes
        .map((id) => availableNotes.find((n) => n.id === id)?.nameEn)
        .filter(Boolean)
        .join(', ');
      const baseNoteNamesEn = selectedBaseNotes
        .map((id) => availableNotes.find((n) => n.id === id)?.nameEn)
        .filter(Boolean)
        .join(', ');

      const effectiveTopAr = topNoteNamesAr || formData.topNotes.trim();
      const effectiveHeartAr = heartNoteNamesAr || formData.heartNotes.trim();
      const effectiveBaseAr = baseNoteNamesAr || formData.baseNotes.trim();

      // Auto-translate Arabic inputs to English in the background
      let translatedNameEn = formData.nameEn.trim();
      let translatedDescEn = formData.descriptionEn.trim();
      let translatedTopNotes = topNoteNamesEn || formData.topNotes.trim();
      let translatedHeartNotes = heartNoteNamesEn || formData.heartNotes.trim();
      let translatedBaseNotes = baseNoteNamesEn || formData.baseNotes.trim();

      try {
        const textsToTranslate: Record<string, string> = {
          name: formData.nameAr.trim(),
          desc: formData.descriptionAr.trim(),
        };
        if (!topNoteNamesEn && effectiveTopAr) textsToTranslate.top = effectiveTopAr;
        if (!heartNoteNamesEn && effectiveHeartAr) textsToTranslate.heart = effectiveHeartAr;
        if (!baseNoteNamesEn && effectiveBaseAr) textsToTranslate.base = effectiveBaseAr;

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
        fragranceNotes: [
          ...selectedTopNotes.map((noteId, idx) => ({ noteId, type: 'TOP', sortOrder: idx })),
          ...selectedHeartNotes.map((noteId, idx) => ({ noteId, type: 'HEART', sortOrder: idx })),
          ...selectedBaseNotes.map((noteId, idx) => ({ noteId, type: 'BASE', sortOrder: idx })),
        ],
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
              <div className="sm:col-span-2 border-t-2 border-[#DFC27A]/40 pt-5 space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-black text-black flex items-center gap-2">
                      <Droplets className="w-5 h-5 text-[#C49A45]" />
                      <span>الهرم العطري الملكي والنوتات (Fragrance Pyramid)</span>
                    </h3>
                    <p className="text-xs font-bold text-neutral-500 mt-0.5">
                      اختر النوتات العطرية لكل مرحلة من مراحل العطر من المكتبة لعرض صورها وأسمائها بأسلوب ملكي فاخر
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {/* Tier 1: TOP NOTES */}
                  <div className="bg-[#FAF8F5] border border-[#DFC27A]/50 rounded-2xl p-4 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center justify-between border-b border-[#DFC27A]/30 pb-2 mb-3">
                        <div>
                          <span className="text-xs font-black text-black block">1. الافتتاحية (Top Notes)</span>
                          <span className="text-[10px] font-bold text-[#98702B]">أول 15 دقيقة من الرش</span>
                        </div>
                        <span className="text-xs font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                          {selectedTopNotes.length} نوتات
                        </span>
                      </div>

                      {/* Selected Notes Badges */}
                      <div className="min-h-[80px] flex flex-wrap gap-2 items-start mb-3">
                        {selectedTopNotes.length === 0 ? (
                          <p className="text-[11px] font-bold text-neutral-400 py-3 text-center w-full">
                            لم يتم اختيار نوتات للافتتاحية بعد
                          </p>
                        ) : (
                          selectedTopNotes.map((noteId) => {
                            const note = availableNotes.find((n) => n.id === noteId);
                            if (!note) return null;
                            return (
                              <div
                                key={note.id}
                                className="flex items-center gap-2 bg-white border border-[#DFC27A]/60 rounded-full pl-2 pr-1 py-1 shadow-xs"
                              >
                                <div className="relative w-7 h-7 rounded-full overflow-hidden bg-[#FAF7F2] border border-[#DFC27A] flex-shrink-0 flex items-center justify-center">
                                  {note.image ? (
                                    <Image src={note.image} alt={note.nameAr} fill className="object-cover" sizes="28px" />
                                  ) : (
                                    <Droplets className="w-3.5 h-3.5 text-[#C49A45]" />
                                  )}
                                </div>
                                <span className="text-xs font-black text-black">{note.nameAr}</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveNoteFromTier('TOP', note.id)}
                                  className="w-4 h-4 rounded-full bg-neutral-100 hover:bg-red-500 hover:text-white text-neutral-500 flex items-center justify-center text-[10px] font-bold transition-colors cursor-pointer"
                                  title="إزالة النوتة"
                                >
                                  ×
                                </button>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>

                    {/* Selector Controls */}
                    <div className="space-y-2 pt-2 border-t border-[#DFC27A]/20">
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            handleAddNoteToTier('TOP', e.target.value);
                            e.target.value = '';
                          }
                        }}
                        defaultValue=""
                        className="w-full bg-white border border-[#DFC27A]/60 rounded-xl px-3 py-2 text-xs text-black font-bold focus:outline-none focus:border-[#C49A45]"
                      >
                        <option value="">+ اختر نوتة من المكتبة للافتتاحية...</option>
                        {availableNotes
                          .filter((n) => !selectedTopNotes.includes(n.id))
                          .map((n) => (
                            <option key={n.id} value={n.id}>
                              {n.nameAr} ({n.category || 'نوتة'})
                            </option>
                          ))}
                      </select>

                      <button
                        type="button"
                        onClick={() => {
                          setQuickAddTier('TOP');
                          setQuickNoteData({ nameAr: '', category: 'حمضيات', image: '' });
                          setQuickAddModalOpen(true);
                        }}
                        className="w-full py-1.5 px-3 rounded-xl border border-dashed border-[#C49A45] hover:bg-amber-50 text-[11px] font-black text-[#98702B] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>إضافة نوتة جديدة غير موجودة بالمكتبة</span>
                      </button>
                    </div>
                  </div>

                  {/* Tier 2: HEART NOTES */}
                  <div className="bg-[#FAF8F5] border border-[#DFC27A]/50 rounded-2xl p-4 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center justify-between border-b border-[#DFC27A]/30 pb-2 mb-3">
                        <div>
                          <span className="text-xs font-black text-black block">2. قلب العطر (Heart Notes)</span>
                          <span className="text-[10px] font-bold text-[#98702B]">جوهر وهوية العطر (2-4 ساعات)</span>
                        </div>
                        <span className="text-xs font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                          {selectedHeartNotes.length} نوتات
                        </span>
                      </div>

                      {/* Selected Notes Badges */}
                      <div className="min-h-[80px] flex flex-wrap gap-2 items-start mb-3">
                        {selectedHeartNotes.length === 0 ? (
                          <p className="text-[11px] font-bold text-neutral-400 py-3 text-center w-full">
                            لم يتم اختيار نوتات لقلب العطر بعد
                          </p>
                        ) : (
                          selectedHeartNotes.map((noteId) => {
                            const note = availableNotes.find((n) => n.id === noteId);
                            if (!note) return null;
                            return (
                              <div
                                key={note.id}
                                className="flex items-center gap-2 bg-white border border-[#DFC27A]/60 rounded-full pl-2 pr-1 py-1 shadow-xs"
                              >
                                <div className="relative w-7 h-7 rounded-full overflow-hidden bg-[#FAF7F2] border border-[#DFC27A] flex-shrink-0 flex items-center justify-center">
                                  {note.image ? (
                                    <Image src={note.image} alt={note.nameAr} fill className="object-cover" sizes="28px" />
                                  ) : (
                                    <Droplets className="w-3.5 h-3.5 text-[#C49A45]" />
                                  )}
                                </div>
                                <span className="text-xs font-black text-black">{note.nameAr}</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveNoteFromTier('HEART', note.id)}
                                  className="w-4 h-4 rounded-full bg-neutral-100 hover:bg-red-500 hover:text-white text-neutral-500 flex items-center justify-center text-[10px] font-bold transition-colors cursor-pointer"
                                  title="إزالة النوتة"
                                >
                                  ×
                                </button>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>

                    {/* Selector Controls */}
                    <div className="space-y-2 pt-2 border-t border-[#DFC27A]/20">
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            handleAddNoteToTier('HEART', e.target.value);
                            e.target.value = '';
                          }
                        }}
                        defaultValue=""
                        className="w-full bg-white border border-[#DFC27A]/60 rounded-xl px-3 py-2 text-xs text-black font-bold focus:outline-none focus:border-[#C49A45]"
                      >
                        <option value="">+ اختر نوتة من المكتبة لقلب العطر...</option>
                        {availableNotes
                          .filter((n) => !selectedHeartNotes.includes(n.id))
                          .map((n) => (
                            <option key={n.id} value={n.id}>
                              {n.nameAr} ({n.category || 'نوتة'})
                            </option>
                          ))}
                      </select>

                      <button
                        type="button"
                        onClick={() => {
                          setQuickAddTier('HEART');
                          setQuickNoteData({ nameAr: '', category: 'زهور', image: '' });
                          setQuickAddModalOpen(true);
                        }}
                        className="w-full py-1.5 px-3 rounded-xl border border-dashed border-[#C49A45] hover:bg-amber-50 text-[11px] font-black text-[#98702B] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>إضافة نوتة جديدة غير موجودة بالمكتبة</span>
                      </button>
                    </div>
                  </div>

                  {/* Tier 3: BASE NOTES */}
                  <div className="bg-[#FAF8F5] border border-[#DFC27A]/50 rounded-2xl p-4 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center justify-between border-b border-[#DFC27A]/30 pb-2 mb-3">
                        <div>
                          <span className="text-xs font-black text-black block">3. قاعدة العطر (Base Notes)</span>
                          <span className="text-[10px] font-bold text-[#98702B]">عمق وأصالة وثبات (+12 ساعة)</span>
                        </div>
                        <span className="text-xs font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                          {selectedBaseNotes.length} نوتات
                        </span>
                      </div>

                      {/* Selected Notes Badges */}
                      <div className="min-h-[80px] flex flex-wrap gap-2 items-start mb-3">
                        {selectedBaseNotes.length === 0 ? (
                          <p className="text-[11px] font-bold text-neutral-400 py-3 text-center w-full">
                            لم يتم اختيار نوتات للقاعدة بعد
                          </p>
                        ) : (
                          selectedBaseNotes.map((noteId) => {
                            const note = availableNotes.find((n) => n.id === noteId);
                            if (!note) return null;
                            return (
                              <div
                                key={note.id}
                                className="flex items-center gap-2 bg-white border border-[#DFC27A]/60 rounded-full pl-2 pr-1 py-1 shadow-xs"
                              >
                                <div className="relative w-7 h-7 rounded-full overflow-hidden bg-[#FAF7F2] border border-[#DFC27A] flex-shrink-0 flex items-center justify-center">
                                  {note.image ? (
                                    <Image src={note.image} alt={note.nameAr} fill className="object-cover" sizes="28px" />
                                  ) : (
                                    <Droplets className="w-3.5 h-3.5 text-[#C49A45]" />
                                  )}
                                </div>
                                <span className="text-xs font-black text-black">{note.nameAr}</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveNoteFromTier('BASE', note.id)}
                                  className="w-4 h-4 rounded-full bg-neutral-100 hover:bg-red-500 hover:text-white text-neutral-500 flex items-center justify-center text-[10px] font-bold transition-colors cursor-pointer"
                                  title="إزالة النوتة"
                                >
                                  ×
                                </button>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>

                    {/* Selector Controls */}
                    <div className="space-y-2 pt-2 border-t border-[#DFC27A]/20">
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            handleAddNoteToTier('BASE', e.target.value);
                            e.target.value = '';
                          }
                        }}
                        defaultValue=""
                        className="w-full bg-white border border-[#DFC27A]/60 rounded-xl px-3 py-2 text-xs text-black font-bold focus:outline-none focus:border-[#C49A45]"
                      >
                        <option value="">+ اختر نوتة من المكتبة لقاعدة العطر...</option>
                        {availableNotes
                          .filter((n) => !selectedBaseNotes.includes(n.id))
                          .map((n) => (
                            <option key={n.id} value={n.id}>
                              {n.nameAr} ({n.category || 'نوتة'})
                            </option>
                          ))}
                      </select>

                      <button
                        type="button"
                        onClick={() => {
                          setQuickAddTier('BASE');
                          setQuickNoteData({ nameAr: '', category: 'أخشاب', image: '' });
                          setQuickAddModalOpen(true);
                        }}
                        className="w-full py-1.5 px-3 rounded-xl border border-dashed border-[#C49A45] hover:bg-amber-50 text-[11px] font-black text-[#98702B] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>إضافة نوتة جديدة غير موجودة بالمكتبة</span>
                      </button>
                    </div>
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

      {/* Quick Add Note to Library (Light Luxury Modal) */}
      {quickAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border-2 border-[#C49A45] shadow-2xl p-6 sm:p-8 w-full max-w-lg space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#DFC27A]/30 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-[#C49A45]">
                  <Droplets className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-black">إضافة نوتة عطرية جديدة للمكتبة</h4>
                  <p className="text-[11px] font-bold text-[#98702B]">
                    سيتم إضافتها تلقائياً إلى{' '}
                    {quickAddTier === 'TOP'
                      ? 'الافتتاحية'
                      : quickAddTier === 'HEART'
                      ? 'قلب العطر'
                      : 'قاعدة العطر'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setQuickAddModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleQuickAddNote} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-black mb-1.5">
                  اسم النوتة بالعربية <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: لبان حوجري، مسك أبيض ملكي..."
                  value={quickNoteData.nameAr}
                  onChange={(e) => setQuickNoteData({ ...quickNoteData, nameAr: e.target.value })}
                  className="w-full bg-[#FAF8F5] border border-[#DFC27A]/50 rounded-xl px-3.5 py-2.5 text-xs font-bold text-black focus:outline-none focus:border-[#C49A45]"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-black mb-1.5">
                  التصنيف <span className="text-red-500">*</span>
                </label>
                <select
                  value={quickNoteData.category}
                  onChange={(e) => setQuickNoteData({ ...quickNoteData, category: e.target.value })}
                  className="w-full bg-[#FAF8F5] border border-[#DFC27A]/50 rounded-xl px-3.5 py-2.5 text-xs font-bold text-black focus:outline-none focus:border-[#C49A45]"
                >
                  {['أخشاب', 'عنبر ومسك', 'زهور', 'حمضيات', 'توابل وبخور', 'جلود', 'فواكه ومذاقات', 'أخرى'].map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-black mb-1.5">
                  صورة النوتة العطرية
                </label>
                <div className="flex items-center gap-4 p-3 rounded-2xl bg-[#FAF8F5] border border-stone-200">
                  <div className="relative w-16 h-16 rounded-full border-2 border-[#C49A45] shadow-xs overflow-hidden bg-white flex-shrink-0 flex items-center justify-center">
                    {quickNoteData.image ? (
                      <Image
                        src={quickNoteData.image}
                        alt="صورة النوتة"
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    ) : (
                      <Droplets className="w-6 h-6 text-stone-300" />
                    )}
                  </div>
                  <div className="flex-1">
                    <MediaUploader
                      label="رفع صورة النوتة العطرية"
                      value={quickNoteData.image}
                      onChange={(url) => setQuickNoteData({ ...quickNoteData, image: url })}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setQuickAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-neutral-300 text-xs font-bold text-neutral-700 hover:bg-neutral-50"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={quickNoteSaving}
                  className="px-6 py-2 rounded-xl gold-button text-xs font-black text-black shadow-md hover:brightness-105 disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{quickNoteSaving ? 'جاري الحفظ...' : 'حفظ وإضافة للهرم العطري'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
