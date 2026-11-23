'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import {
  Sparkles,
  Save,
  Check,
  ArrowUp,
  ArrowDown,
  Trash2,
  Search,
  Filter,
  Layers,
  Info,
} from 'lucide-react';
import { ProductDto, CategoryDto } from '@/lib/types';
import { formatPrice } from '@/lib/utils';

export default function AdminFeaturedProductsPage() {
  const [allProducts, setAllProducts] = useState<ProductDto[]>([]);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [activeCategorySlug, setActiveCategorySlug] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [settings, setSettings] = useState({
    titleAr: 'المختارات الملكية الأكثر تميزاً',
    titleEn: 'Featured Royal Masterpieces',
    subtitleAr: 'نخبة من أروع المنتجات المصممة لأصحاب الذوق الرفيع والباحثين عن التفرد',
    subtitleEn: 'Handpicked luxury fragrances for discerning connoisseurs',
    isActive: true,
    limit: 8,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [allProdRes, featRes, catRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/featured-products'),
        fetch('/api/categories'),
      ]);
      const allData = await allProdRes.json();
      const featData = await featRes.json();
      const catData = await catRes.json();

      setAllProducts(allData.products || []);
      setCategories(catData.categories || []);

      if (featData.products) {
        setSelectedProductIds(featData.products.map((p: any) => p.id));
      }
      if (featData.settings) {
        setSettings(featData.settings);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleProduct = (id: string) => {
    if (selectedProductIds.includes(id)) {
      setSelectedProductIds(selectedProductIds.filter((item) => item !== id));
    } else {
      setSelectedProductIds([...selectedProductIds, id]);
    }
  };

  const removeProduct = (id: string) => {
    setSelectedProductIds(selectedProductIds.filter((item) => item !== id));
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const copy = [...selectedProductIds];
    const temp = copy[index];
    copy[index] = copy[index - 1];
    copy[index - 1] = temp;
    setSelectedProductIds(copy);
  };

  const moveDown = (index: number) => {
    if (index === selectedProductIds.length - 1) return;
    const copy = [...selectedProductIds];
    const temp = copy[index];
    copy[index] = copy[index + 1];
    copy[index + 1] = temp;
    setSelectedProductIds(copy);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/featured-products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productIds: selectedProductIds,
          ...settings,
        }),
      });

      if (!res.ok) throw new Error('فشل حفظ التعديلات');
      setMessage('تم حفظ إعدادات وترتيب قسم المنتجات المميزة بنجاح!');
      setTimeout(() => setMessage(null), 3500);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'خطأ في الحفظ');
    } finally {
      setSaving(false);
    }
  };

  // Map selected IDs to product objects for ordering view
  const selectedProducts = useMemo(() => {
    return selectedProductIds
      .map((id) => allProducts.find((p) => p.id === id))
      .filter(Boolean) as ProductDto[];
  }, [selectedProductIds, allProducts]);

  // Filtered products for selection grid
  const filteredProducts = useMemo(() => {
    return allProducts.filter((p) => {
      const matchesCategory =
        activeCategorySlug === 'all' || p.category?.slug === activeCategorySlug;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        p.nameAr.toLowerCase().includes(q) ||
        p.nameEn.toLowerCase().includes(q) ||
        (p.sku && p.sku.toLowerCase().includes(q)) ||
        p.category?.nameAr.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [allProducts, activeCategorySlug, searchQuery]);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C49A45]/20 text-[#DFC27A] text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#C49A45]" />
            <span>إدارة قسم مختارات حصرية</span>
          </div>
          <h1 className="text-2xl font-black text-white">المنتجات المميزة (من جميع التصنيفات)</h1>
          <p className="text-xs text-gray-400 mt-1">
            اختر المنتجات يدوياً من أي تصنيف (عطور، بخور وعود، هدايا، معطرات منزل، بادي سبلاش، مخمريات) ورتّبها حسب رغبتك
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="gold-button px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 self-start sm:self-auto shadow-gold-glow"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'جاري الحفظ...' : 'حفظ التغييرات بالكامل'}</span>
        </button>
      </div>

      {message && (
        <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-200 text-xs font-bold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{message}</span>
        </div>
      )}

      {/* 1. Section Settings */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-[#C49A45]/30 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3">
          <Sparkles className="w-4 h-4 text-[#C49A45]" />
          <span>إعدادات وعنوان القسم في الصفحة الرئيسية</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1">
            <label className="text-gray-300 font-semibold">عنوان القسم بالعربية</label>
            <input
              type="text"
              value={settings.titleAr}
              onChange={(e) => setSettings({ ...settings, titleAr: e.target.value })}
              className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-white focus:border-[#C49A45] outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-gray-300 font-semibold">عنوان القسم بالإنجليزية</label>
            <input
              type="text"
              value={settings.titleEn}
              onChange={(e) => setSettings({ ...settings, titleEn: e.target.value })}
              className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-white focus:border-[#C49A45] outline-none"
              dir="ltr"
            />
          </div>

          <div className="space-y-1 sm:col-span-2">
            <label className="text-gray-300 font-semibold">الوصف الترويجي بالعربية</label>
            <input
              type="text"
              value={settings.subtitleAr}
              onChange={(e) => setSettings({ ...settings, subtitleAr: e.target.value })}
              className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-white focus:border-[#C49A45] outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-gray-300 font-semibold">الحد الأقصى لعدد المنتجات المعروضة في الصفحة الرئيسية</label>
            <input
              type="number"
              min="1"
              max="50"
              value={settings.limit}
              onChange={(e) =>
                setSettings({ ...settings, limit: parseInt(e.target.value) || 8 })
              }
              className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-white focus:border-[#C49A45] outline-none"
            />
          </div>

          <div className="pt-6">
            <label className="flex items-center gap-2.5 cursor-pointer text-white font-bold">
              <input
                type="checkbox"
                checked={settings.isActive}
                onChange={(e) => setSettings({ ...settings, isActive: e.target.checked })}
                className="w-4 h-4 accent-[#C49A45] rounded cursor-pointer"
              />
              <span>إظهار قسم المنتجات المميزة في الواجهة الأمامية</span>
            </label>
          </div>
        </div>
      </div>

      {/* 2. Order of Selected Products */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-[#C49A45]/30 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-3 gap-2">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#C49A45]" />
            <span>الترتيب الفعلي للمنتجات المختارة ({selectedProducts.length})</span>
          </h2>
          <span className="text-xs text-[#DFC27A]">
            استخدم الأسهم ⬆ ⬇ لتحديد ترتيب ظهور المنتجات أمام العملاء
          </span>
        </div>

        {selectedProducts.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-white/10 rounded-2xl">
            <p className="text-xs text-gray-400">
              لم تختر أي منتجات بعد. انقر على أي منتج من القائمة بالأسفل لإضافته إلى المختارات الحصرية.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
            {selectedProducts.map((p, index) => (
              <div
                key={p.id}
                className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:border-[#C49A45]/40 flex items-center justify-between text-xs transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-7 h-7 rounded-xl bg-[#C49A45]/20 border border-[#C49A45]/40 text-[#DFC27A] font-black flex items-center justify-center flex-shrink-0 text-xs">
                    {index + 1}
                  </span>
                  <div className="relative w-12 h-14 rounded-xl overflow-hidden bg-neutral-900 flex-shrink-0 border border-white/10">
                    <Image
                      src={p.images?.[0]?.url || 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=200'}
                      alt={p.nameAr}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white truncate block">{p.nameAr}</span>
                      {p.category && (
                        <span className="px-2 py-0.5 rounded-md bg-[#C49A45]/20 text-[#DFC27A] text-[10px] font-bold flex-shrink-0">
                          {p.category.nameAr}
                        </span>
                      )}
                    </div>
                    <span className="text-[#DFC27A] text-[11px] font-extrabold">{formatPrice(p.price, 'ar')}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0 mr-2">
                  <button
                    type="button"
                    onClick={() => moveUp(index)}
                    disabled={index === 0}
                    className="p-2 rounded-xl bg-white/5 hover:bg-[#C49A45]/20 text-gray-300 hover:text-white disabled:opacity-20 transition-colors"
                    title="تحريك للأعلى"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveDown(index)}
                    disabled={index === selectedProducts.length - 1}
                    className="p-2 rounded-xl bg-white/5 hover:bg-[#C49A45]/20 text-gray-300 hover:text-white disabled:opacity-20 transition-colors"
                    title="تحريك للأسفل"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeProduct(p.id)}
                    className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors"
                    title="إزالة من المختارات"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Manual Products Selector Grid from ALL Categories */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/10 pb-4 gap-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#C49A45]" />
              <span>اختر يدوياً من جميع تصنيفات المتجر ({allProducts.length} منتج متوفر)</span>
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              انقر على أي منتج لتحديده أو إلغاء اختياره. المنتجات المحددة تظهر بإطار وإضاءة ذهبية.
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ابحث بالاسم أو الكود أو التصنيف..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#181818] border border-white/10 rounded-xl pr-10 pl-4 py-2 text-xs text-white placeholder-gray-500 focus:border-[#C49A45] outline-none"
            />
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveCategorySlug('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeCategorySlug === 'all'
                ? 'bg-[#C49A45] text-black shadow-gold-glow'
                : 'bg-white/5 text-gray-300 hover:bg-white/10'
            }`}
          >
            <span>جميع التصنيفات</span>
            <span className="text-[10px] opacity-80">({allProducts.length})</span>
          </button>

          {categories.map((cat) => {
            const count = allProducts.filter((p) => p.category?.slug === cat.slug).length;
            const isCurrent = activeCategorySlug === cat.slug;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategorySlug(cat.slug)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  isCurrent
                    ? 'bg-[#C49A45] text-black shadow-gold-glow'
                    : 'bg-white/5 text-gray-300 hover:bg-white/10'
                }`}
              >
                <span>{cat.nameAr}</span>
                <span className="text-[10px] opacity-80">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {filteredProducts.map((p) => {
            const isSelected = selectedProductIds.includes(p.id);
            return (
              <div
                key={p.id}
                onClick={() => toggleProduct(p.id)}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center gap-3.5 select-none ${
                  isSelected
                    ? 'bg-[#C49A45]/20 border-[#C49A45] shadow-gold-glow ring-1 ring-[#C49A45]/50'
                    : 'bg-white/5 border-white/5 hover:border-white/20'
                }`}
              >
                <div className="relative w-14 h-16 rounded-xl overflow-hidden bg-neutral-900 flex-shrink-0 border border-white/10">
                  <Image
                    src={p.images?.[0]?.url || 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=200'}
                    alt={p.nameAr}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0 text-xs space-y-1">
                  <h4 className="font-bold text-white truncate">{p.nameAr}</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-[#DFC27A] font-extrabold">{formatPrice(p.price, 'ar')}</span>
                    {p.category && (
                      <span className="px-2 py-0.5 rounded-md bg-white/10 text-gray-300 text-[10px] font-semibold">
                        {p.category.nameAr}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-400">SKU: {p.sku}</p>
                </div>

                <div
                  className={`w-7 h-7 rounded-xl border flex items-center justify-center transition-all flex-shrink-0 ${
                    isSelected
                      ? 'bg-[#C49A45] border-[#C49A45] text-black shadow-md'
                      : 'border-white/20 text-transparent'
                  }`}
                >
                  <Check className="w-4 h-4 font-black" />
                </div>
              </div>
            );
          })}
        </div>

        {filteredProducts.length === 0 && (
          <div className="p-8 text-center text-xs text-gray-400">
            لا توجد منتجات مطابقة لهذا التصنيف أو البحث.
          </div>
        )}
      </div>
    </div>
  );
}
