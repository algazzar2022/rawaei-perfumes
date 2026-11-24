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
import { autoTranslate } from '@/lib/translate';

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
      let translatedTitleEn = settings.titleEn;
      try {
        if (settings.titleAr?.trim()) {
          const trans = await autoTranslate(settings.titleAr.trim());
          if (trans) translatedTitleEn = trans;
        }
      } catch (err) {
        console.warn('Featured title translation warning:', err);
      }

      const res = await fetch('/api/featured-products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productIds: selectedProductIds,
          ...settings,
          titleEn: translatedTitleEn || settings.titleAr,
        }),
      });

      if (!res.ok) throw new Error('فشل حفظ التعديلات');
      setMessage('تمت الترجمة وحفظ إعدادات وترتيب قسم المنتجات المميزة بنجاح!');
      setTimeout(() => setMessage(null), 3500);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'خطأ في الحفظ');
    } finally {
      setSaving(false);
    }
  };

  const selectedProducts = useMemo(() => {
    return selectedProductIds
      .map((id) => allProducts.find((p) => p.id === id))
      .filter(Boolean) as ProductDto[];
  }, [selectedProductIds, allProducts]);

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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-[#98702B] text-xs font-black mb-2 border border-[#DFC27A]/40">
            <Sparkles className="w-3.5 h-3.5 text-[#98702B]" />
            <span>إدارة قسم مختارات حصرية</span>
          </div>
          <h1 className="text-2xl font-black text-black">المنتجات المميزة (من جميع التصنيفات)</h1>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="gold-button px-7 py-2.5 rounded-xl text-xs font-black text-black flex items-center gap-2 self-start sm:self-auto shadow-md hover:brightness-105 disabled:opacity-50 cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-black" />
          <span>{saving ? 'جارٍ الترجمة والحفظ... ✨' : 'ترجمة وحفظ'}</span>
        </button>
      </div>

      {message && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 text-xs font-black flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{message}</span>
        </div>
      )}

      {/* 1. Section Settings */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#DFC27A]/40 shadow-sm space-y-4">
        <h2 className="text-base font-black text-black flex items-center gap-2 border-b border-[#DFC27A]/20 pb-3">
          <Sparkles className="w-4 h-4 text-[#98702B]" />
          <span>إعدادات وعنوان القسم في الصفحة الرئيسية</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-black font-black block">عنوان القسم بالعربية</label>
            <input
              type="text"
              value={settings.titleAr}
              onChange={(e) => setSettings({ ...settings, titleAr: e.target.value })}
              className="w-full bg-[#FAF8F5] border border-[#DFC27A]/40 rounded-xl px-4 py-2.5 text-xs text-black font-bold focus:border-[#C49A45] focus:bg-white outline-none"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-black font-black block">الوصف الترويجي بالعربية</label>
            <input
              type="text"
              value={settings.subtitleAr}
              onChange={(e) => setSettings({ ...settings, subtitleAr: e.target.value })}
              className="w-full bg-[#FAF8F5] border border-[#DFC27A]/40 rounded-xl px-4 py-2.5 text-xs text-black font-bold focus:border-[#C49A45] focus:bg-white outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-black font-black block">الحد الأقصى لعدد المنتجات المعروضة</label>
            <input
              type="number"
              min="1"
              max="50"
              value={settings.limit}
              onChange={(e) =>
                setSettings({ ...settings, limit: parseInt(e.target.value) || 8 })
              }
              className="w-full bg-[#FAF8F5] border border-[#DFC27A]/40 rounded-xl px-4 py-2.5 text-xs text-black font-bold focus:border-[#C49A45] focus:bg-white outline-none"
            />
          </div>

          <div className="pt-6">
            <label className="flex items-center gap-2.5 cursor-pointer text-black font-bold">
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
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#DFC27A]/40 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#DFC27A]/20 pb-3 gap-2">
          <h2 className="text-base font-black text-black flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#98702B]" />
            <span>الترتيب الفعلي للمنتجات المختارة ({selectedProducts.length})</span>
          </h2>
          <span className="text-xs text-[#98702B] font-bold">
            استخدم الأسهم ⬆ ⬇ لتحديد ترتيب ظهور المنتجات أمام العملاء
          </span>
        </div>

        {selectedProducts.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-[#DFC27A]/40 rounded-2xl bg-[#FAF8F5]">
            <p className="text-xs text-neutral-600 font-bold">
              لم تختر أي منتجات بعد. انقر على أي منتج من القائمة بالأسفل لإضافته إلى المختارات الحصرية.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
            {selectedProducts.map((p, index) => (
              <div
                key={p.id}
                className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#DFC27A]/30 hover:border-[#98702B] flex items-center justify-between text-xs transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-7 h-7 rounded-xl bg-amber-100 border border-[#DFC27A]/40 text-[#98702B] font-black flex items-center justify-center flex-shrink-0 text-xs">
                    {index + 1}
                  </span>
                  <div className="relative w-12 h-14 rounded-xl overflow-hidden bg-white flex-shrink-0 border border-[#DFC27A]/30">
                    <Image
                      src={p.images?.[0]?.url || '/logo.png'}
                      alt={p.nameAr}
                      fill
                      className="object-contain p-1"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-black truncate block">{p.nameAr}</span>
                      {p.category && (
                        <span className="px-2 py-0.5 rounded-md bg-white border border-[#DFC27A]/30 text-[#98702B] text-[10px] font-bold flex-shrink-0">
                          {p.category.nameAr}
                        </span>
                      )}
                    </div>
                    <span className="text-black text-[11px] font-black">{formatPrice(p.price, 'ar')}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0 mr-2">
                  <button
                    type="button"
                    onClick={() => moveUp(index)}
                    disabled={index === 0}
                    className="p-2 rounded-xl bg-white hover:bg-neutral-200 border border-neutral-300 text-black disabled:opacity-20 transition-colors cursor-pointer"
                    title="تحريك للأعلى"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveDown(index)}
                    disabled={index === selectedProducts.length - 1}
                    className="p-2 rounded-xl bg-white hover:bg-neutral-200 border border-neutral-300 text-black disabled:opacity-20 transition-colors cursor-pointer"
                    title="تحريك للأسفل"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeProduct(p.id)}
                    className="p-2 rounded-xl bg-red-50 hover:bg-red-600 text-red-600 hover:text-white border border-red-200 transition-colors cursor-pointer"
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
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#DFC27A]/40 shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#DFC27A]/20 pb-4 gap-4">
          <div>
            <h2 className="text-base font-black text-black flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#98702B]" />
              <span>اختر يدوياً من جميع تصنيفات المتجر ({allProducts.length} منتج متوفر)</span>
            </h2>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-neutral-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ابحث بالاسم أو الكود أو التصنيف..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#FAF8F5] border border-[#DFC27A]/40 rounded-xl pr-10 pl-4 py-2.5 text-xs text-black font-bold placeholder-[#777777] focus:border-[#C49A45] focus:bg-white outline-none"
            />
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <button
            type="button"
            onClick={() => setActiveCategorySlug('all')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeCategorySlug === 'all'
                ? 'gold-button text-black shadow-sm'
                : 'bg-[#FAF8F5] border border-neutral-300 text-neutral-800 hover:bg-neutral-100'
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
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                  isCurrent
                    ? 'gold-button text-black shadow-sm'
                    : 'bg-[#FAF8F5] border border-neutral-300 text-neutral-800 hover:bg-neutral-100'
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
                    ? 'bg-amber-50 border-[#DFC27A] shadow-sm ring-1 ring-[#DFC27A]'
                    : 'bg-[#FAF8F5] border-neutral-200 hover:border-[#DFC27A]/50'
                }`}
              >
                <div className="relative w-14 h-16 rounded-xl overflow-hidden bg-white flex-shrink-0 border border-[#DFC27A]/30">
                  <Image
                    src={p.images?.[0]?.url || '/logo.png'}
                    alt={p.nameAr}
                    fill
                    className="object-contain p-1"
                  />
                </div>

                <div className="flex-1 min-w-0 text-xs space-y-1">
                  <h4 className="font-black text-black truncate">{p.nameAr}</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-black font-black">{formatPrice(p.price, 'ar')}</span>
                    {p.category && (
                      <span className="px-2 py-0.5 rounded-md bg-white border border-[#DFC27A]/30 text-[#98702B] text-[10px] font-bold">
                        {p.category.nameAr}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-neutral-500 font-mono font-bold">SKU: {p.sku}</p>
                </div>

                <div
                  className={`w-7 h-7 rounded-xl border flex items-center justify-center transition-all flex-shrink-0 ${
                    isSelected
                      ? 'gold-button text-black shadow-sm font-black'
                      : 'border-neutral-300 text-transparent bg-white'
                  }`}
                >
                  <Check className="w-4 h-4 font-black" />
                </div>
              </div>
            );
          })}
        </div>

        {filteredProducts.length === 0 && (
          <div className="p-8 text-center text-xs text-neutral-500 font-bold">
            لا توجد منتجات مطابقة لهذا التصنيف أو البحث.
          </div>
        )}
      </div>
    </div>
  );
}
