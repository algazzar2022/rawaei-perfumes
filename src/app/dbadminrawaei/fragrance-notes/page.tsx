'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { Plus, Edit2, Trash2, ArrowRight, Droplets, Sparkles, Search, Check, RefreshCw } from 'lucide-react';
import { FragranceNoteDto } from '@/lib/types';
import MediaUploader from '@/components/admin/MediaUploader';
import { autoTranslate } from '@/lib/translate';

const NOTE_CATEGORIES = [
  'الكل',
  'أخشاب',
  'عنبر ومسك',
  'زهور',
  'حمضيات',
  'توابل وبخور',
  'جلود',
  'فواكه ومذاقات',
  'أخرى',
];

export default function AdminFragranceNotesPage() {
  const [notes, setNotes] = useState<FragranceNoteDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('الكل');

  // View Mode: 'LIST' | 'FORM' (no popups)
  const [viewMode, setViewMode] = useState<'LIST' | 'FORM'>('LIST');
  const [editingNote, setEditingNote] = useState<FragranceNoteDto | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nameAr: '',
    nameEn: '',
    category: 'أخشاب',
    image: '',
  });

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/fragrance-notes');
      const data = await res.json();
      setNotes(data.notes || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const openCreateForm = () => {
    setEditingNote(null);
    setFormData({
      nameAr: '',
      nameEn: '',
      category: 'أخشاب',
      image: '',
    });
    setFormError(null);
    setViewMode('FORM');
  };

  const openEditForm = (note: FragranceNoteDto) => {
    setEditingNote(note);
    setFormData({
      nameAr: note.nameAr,
      nameEn: note.nameEn || '',
      category: note.category || 'أخشاب',
      image: note.image || '',
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
        throw new Error('يرجى إدخال اسم النوتة العطرية');
      }

      // Auto-translate Arabic name to English
      let translatedNameEn = formData.nameEn.trim();
      try {
        const trans = await autoTranslate(formData.nameAr.trim());
        if (trans) translatedNameEn = trans;
      } catch (err) {
        console.warn('Translation warning:', err);
      }

      const payload = {
        nameAr: formData.nameAr.trim(),
        nameEn: translatedNameEn || formData.nameAr.trim(),
        category: formData.category,
        image: formData.image.trim() || null,
      };

      const url = editingNote ? `/api/fragrance-notes/${editingNote.id}` : '/api/fragrance-notes';
      const method = editingNote ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'حدث خطأ أثناء حفظ النوتة');
      }

      await fetchNotes();
      setViewMode('LIST');
    } catch (err: any) {
      setFormError(err.message || 'فشل حفظ النوتة العطرية');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`هل أنت متأكد من حذف النوتة العطرية "${name}"؟`)) return;

    try {
      const res = await fetch(`/api/fragrance-notes/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'فشل حذف النوتة');
      setNotes((prev) => prev.filter((n) => n.id !== id));
    } catch (err: any) {
      alert(err.message || 'حدث خطأ أثناء الحذف');
    }
  };

  // Filter notes by search & category
  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      const matchesSearch =
        !searchQuery.trim() ||
        note.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (note.nameEn && note.nameEn.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory =
        selectedCategory === 'الكل' || (note.category && note.category === selectedCategory);

      return matchesSearch && matchesCategory;
    });
  }, [notes, searchQuery, selectedCategory]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#C49A45]/20 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#FAF7F2] border border-[#C49A45]/30 flex items-center justify-center text-[#C49A45]">
            <Droplets className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-black">مكتبة النوتات العطرية</h1>
            <p className="text-xs text-stone-500 font-bold mt-0.5">
              إدارة نوتات الهرم العطري الملكي لربطها بمنتجات العطور ومنع التكرار
            </p>
          </div>
        </div>

        {viewMode === 'LIST' ? (
          <button
            onClick={openCreateForm}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B38F26] text-black font-black text-sm shadow-md hover:brightness-105 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة نوتة جديدة للمكتبة</span>
          </button>
        ) : (
          <button
            onClick={() => setViewMode('LIST')}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 font-bold text-sm hover:bg-stone-50 transition-all"
          >
            <ArrowRight className="w-4 h-4" />
            <span>العودة لقائمة النوتات</span>
          </button>
        )}
      </div>

      {/* 2. Form View (No Popups) */}
      {viewMode === 'FORM' && (
        <form
          onSubmit={handleSave}
          className="bg-white rounded-2xl border border-[#C49A45]/30 shadow-md p-6 sm:p-8 space-y-6"
        >
          <div className="border-b border-stone-100 pb-4">
            <h2 className="text-lg font-black text-black">
              {editingNote ? `تعديل النوتة: ${editingNote.nameAr}` : 'إضافة نوتة عطرية جديدة للمكتبة'}
            </h2>
          </div>

          {formError && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Arabic Name */}
            <div>
              <label className="block text-xs font-black text-black mb-2">
                اسم النوتة العطرية (بالعربية) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.nameAr}
                onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                placeholder="مثال: دهن العود المعتق، خشب الصندل، الورد الطائفي..."
                className="w-full h-11 px-4 text-sm font-bold bg-[#FAF8F5] border border-stone-200 rounded-xl focus:outline-none focus:border-[#C49A45] text-black"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-black text-black mb-2">
                تصنيف النوتة العطرية <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full h-11 px-4 text-sm font-bold bg-[#FAF8F5] border border-stone-200 rounded-xl focus:outline-none focus:border-[#C49A45] text-black"
              >
                {NOTE_CATEGORIES.filter((c) => c !== 'الكل').map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Image Uploader */}
            <div className="md:col-span-2">
              <label className="block text-xs font-black text-black mb-2">
                صورة النوتة العطرية (صورة دائرية عالية الجودة تظهر في الهرم العطري)
              </label>
              <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-2xl bg-[#FAF8F5] border border-stone-200">
                <div className="relative w-24 h-24 rounded-full border-2 border-[#C49A45] shadow-md overflow-hidden bg-white flex-shrink-0 flex items-center justify-center">
                  {formData.image ? (
                    <Image
                      src={formData.image}
                      alt={formData.nameAr || 'صورة النوتة'}
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  ) : (
                    <Droplets className="w-10 h-10 text-stone-300" />
                  )}
                </div>

                <div className="w-full flex-1">
                  <MediaUploader
                    label="رفع صورة النوتة العطرية"
                    value={formData.image}
                    onChange={(url) => setFormData({ ...formData, image: url })}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
            <button
              type="button"
              onClick={() => setViewMode('LIST')}
              className="px-5 py-2.5 rounded-xl border border-stone-300 text-stone-700 font-bold text-sm hover:bg-stone-50"
            >
              إلغاء والعودة
            </button>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-7 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B38F26] text-black font-black text-sm shadow-md hover:brightness-105 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{saving ? 'جاري الترجمة والحفظ...' : 'ترجمة وحفظ'}</span>
            </button>
          </div>
        </form>
      )}

      {/* 3. List View */}
      {viewMode === 'LIST' && (
        <div className="space-y-4">
          {/* Controls: Search & Category filter */}
          <div className="bg-white p-4 rounded-2xl border border-[#C49A45]/20 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ابحث بالاسم العربي أو الإنجليزي للنوتة..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pr-10 pl-4 text-xs font-bold bg-[#FAF8F5] border border-stone-200 rounded-xl focus:outline-none focus:border-[#C49A45] text-black"
              />
            </div>

            {/* Category tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
              {NOTE_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-[#C49A45] text-black shadow-sm'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Notes Grid */}
          {loading ? (
            <div className="bg-white p-12 rounded-2xl border border-stone-200 flex flex-col items-center justify-center gap-3">
              <RefreshCw className="w-8 h-8 text-[#C49A45] animate-spin" />
              <p className="text-xs font-bold text-stone-500">جاري تحميل مكتبة النوتات...</p>
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-stone-200 text-center space-y-3">
              <Droplets className="w-12 h-12 text-stone-300 mx-auto" />
              <p className="text-sm font-black text-black">لا توجد نوتات عطرية مطابقة للبحث</p>
              <button
                onClick={openCreateForm}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FAF7F2] border border-[#C49A45]/40 text-black text-xs font-black hover:bg-[#FAF7F2]/80"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة أول نوتة الآن</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {filteredNotes.map((note) => (
                <div
                  key={note.id}
                  className="bg-white rounded-2xl border border-stone-200 hover:border-[#C49A45]/60 hover:shadow-md transition-all p-4 flex flex-col items-center text-center group"
                >
                  {/* Note circular image */}
                  <div className="relative w-20 h-20 rounded-full border-2 border-[#C49A45]/40 group-hover:border-[#C49A45] group-hover:scale-105 transition-all shadow-sm overflow-hidden bg-[#FAF7F2] mb-3 flex items-center justify-center">
                    {note.image ? (
                      <Image
                        src={note.image}
                        alt={note.nameAr}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    ) : (
                      <Droplets className="w-8 h-8 text-stone-300" />
                    )}
                  </div>

                  {/* Note info */}
                  <h3 className="text-xs font-black text-black line-clamp-1 mb-0.5">
                    {note.nameAr}
                  </h3>
                  <p className="text-[10px] font-bold text-stone-400 line-clamp-1 mb-2">
                    {note.nameEn || '-'}
                  </p>

                  <span className="inline-block px-2 py-0.5 rounded-full bg-[#FAF7F2] border border-[#C49A45]/20 text-[10px] font-bold text-stone-600 mb-3">
                    {note.category || 'نوتة عطرية'}
                  </span>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 w-full pt-2 border-t border-stone-100 justify-center">
                    <button
                      onClick={() => openEditForm(note)}
                      title="تعديل"
                      className="p-1.5 rounded-lg text-stone-500 hover:text-black hover:bg-stone-100 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(note.id, note.nameAr)}
                      title="حذف"
                      className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
