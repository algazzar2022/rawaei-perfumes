'use client';

import React, { useState, useEffect } from 'react';
import { FileText, Save, Check, ExternalLink } from 'lucide-react';

export default function AdminPagesManager() {
  const [pages, setPages] = useState<any[]>([]);
  const [selectedSlug, setSelectedSlug] = useState('about-us');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Form State
  const [titleAr, setTitleAr] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [contentAr, setContentAr] = useState('');
  const [contentEn, setContentEn] = useState('');

  const fetchPages = async () => {
    try {
      const res = await fetch('/api/admin/pages');
      const data = await res.json();
      const list = data.pages || [];
      setPages(list);
      const current = list.find((p: any) => p.slug === selectedSlug) || list[0];
      if (current) {
        setSelectedSlug(current.slug);
        setTitleAr(current.titleAr);
        setTitleEn(current.titleEn);
        setContentAr(current.contentAr);
        setContentEn(current.contentEn);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const handleSelectPage = (slug: string) => {
    setSelectedSlug(slug);
    const p = pages.find((item) => item.slug === slug);
    if (p) {
      setTitleAr(p.titleAr);
      setTitleEn(p.titleEn);
      setContentAr(p.contentAr);
      setContentEn(p.contentEn);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/pages', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: selectedSlug,
          titleAr,
          titleEn,
          contentAr,
          contentEn,
          isActive: true,
        }),
      });
      if (!res.ok) throw new Error('فشل الحفظ');
      setMessage('تم حفظ محتوى الصفحة بنجاح!');
      setTimeout(() => setMessage(null), 3000);
      fetchPages();
    } catch {
      alert('خطأ أثناء حفظ الصفحة');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-black">إدارة صفحات الموقع الثابتة (CMS)</h1>
          <p className="text-xs text-neutral-600 mt-1">
            تعديل صفحات (من نحن، سياسة الخصوصية، الشروط والأحكام، وسياسة الشحن والاسترجاع)
          </p>
        </div>

        <a
          href={`/page/${selectedSlug}`}
          target="_blank"
          className="px-4 py-2 rounded-xl bg-white hover:bg-[#FAF8F5] border border-[#DFC27A]/40 text-xs font-bold text-black flex items-center gap-1.5 self-start sm:self-auto shadow-sm"
        >
          <ExternalLink className="w-3.5 h-3.5 text-[#98702B]" />
          <span>معاينة الصفحة المباشرة</span>
        </a>
      </div>

      {message && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 text-xs font-black">
          {message}
        </div>
      )}

      {/* Pages Tabs */}
      <div className="flex flex-wrap gap-2">
        {pages.map((p) => (
          <button
            key={p.slug}
            type="button"
            onClick={() => handleSelectPage(p.slug)}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              selectedSlug === p.slug
                ? 'gold-button text-black shadow-sm'
                : 'bg-white border border-neutral-300 text-neutral-800 hover:bg-neutral-100'
            }`}
          >
            {p.titleAr}
          </button>
        ))}
      </div>

      {/* Editor Form */}
      <form
        onSubmit={handleSave}
        className="bg-white rounded-3xl p-6 sm:p-8 border border-[#DFC27A]/40 shadow-sm space-y-5"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1.5">
            <label className="text-black font-black block">عنوان الصفحة بالعربية</label>
            <input
              type="text"
              required
              value={titleAr}
              onChange={(e) => setTitleAr(e.target.value)}
              className="w-full bg-[#FAF8F5] border border-[#DFC27A]/40 rounded-xl px-4 py-2.5 text-xs text-black font-bold focus:outline-none focus:border-[#C49A45] focus:bg-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-black font-black block">عنوان الصفحة بالإنجليزية</label>
            <input
              type="text"
              required
              value={titleEn}
              onChange={(e) => setTitleEn(e.target.value)}
              className="w-full bg-[#FAF8F5] border border-[#DFC27A]/40 rounded-xl px-4 py-2.5 text-xs text-black font-bold focus:outline-none focus:border-[#C49A45] focus:bg-white"
              dir="ltr"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-black font-black block">محتوى الصفحة بالعربية (HTML مدعوم)</label>
            <textarea
              rows={8}
              value={contentAr}
              onChange={(e) => setContentAr(e.target.value)}
              className="w-full bg-[#FAF8F5] border border-[#DFC27A]/40 rounded-xl p-3 text-black font-mono text-xs focus:outline-none focus:border-[#C49A45] focus:bg-white leading-relaxed"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-black font-black block">محتوى الصفحة بالإنجليزية (HTML مدعوم)</label>
            <textarea
              rows={6}
              value={contentEn}
              onChange={(e) => setContentEn(e.target.value)}
              className="w-full bg-[#FAF8F5] border border-[#DFC27A]/40 rounded-xl p-3 text-black font-mono text-xs focus:outline-none focus:border-[#C49A45] focus:bg-white leading-relaxed"
              dir="ltr"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-[#DFC27A]/20 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="gold-button px-8 py-3 rounded-xl font-black text-black text-xs flex items-center gap-2 shadow-md hover:brightness-105 disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4 text-black" />
            <span>{saving ? 'جاري الحفظ...' : 'حفظ ونشر التعديلات'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
