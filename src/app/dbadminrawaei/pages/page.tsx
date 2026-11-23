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
          <h1 className="text-2xl font-black text-white">إدارة صفحات الموقع الثابتة (CMS)</h1>
          <p className="text-xs text-gray-400 mt-1">
            تعديل صفحات (من نحن، سياسة الخصوصية، الشروط والأحكام، وسياسة الشحن والاسترجاع)
          </p>
        </div>

        <a
          href={`/page/${selectedSlug}`}
          target="_blank"
          className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-gray-300 flex items-center gap-1.5 self-start sm:self-auto"
        >
          <ExternalLink className="w-3.5 h-3.5 text-[#C49A45]" />
          <span>معاينة الصفحة المباشرة</span>
        </a>
      </div>

      {message && (
        <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-200 text-xs font-bold">
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
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              selectedSlug === p.slug
                ? 'bg-[#C49A45] text-black shadow-gold-glow'
                : 'bg-white/5 text-gray-300 hover:text-white'
            }`}
          >
            {p.titleAr}
          </button>
        ))}
      </div>

      {/* Editor Form */}
      <form
        onSubmit={handleSave}
        className="glass-card rounded-3xl p-6 sm:p-8 border border-[#C49A45]/30 space-y-5"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1">
            <label className="text-gray-300 font-semibold">عنوان الصفحة بالعربية</label>
            <input
              type="text"
              required
              value={titleAr}
              onChange={(e) => setTitleAr(e.target.value)}
              className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-gray-300 font-semibold">عنوان الصفحة بالإنجليزية</label>
            <input
              type="text"
              required
              value={titleEn}
              onChange={(e) => setTitleEn(e.target.value)}
              className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-white"
              dir="ltr"
            />
          </div>

          <div className="space-y-1 sm:col-span-2">
            <label className="text-gray-300 font-semibold">محتوى الصفحة بالعربية (HTML مدعوم)</label>
            <textarea
              rows={8}
              value={contentAr}
              onChange={(e) => setContentAr(e.target.value)}
              className="w-full bg-[#181818] border border-white/10 rounded-xl p-3 text-white font-mono text-xs"
            />
          </div>

          <div className="space-y-1 sm:col-span-2">
            <label className="text-gray-300 font-semibold">محتوى الصفحة بالإنجليزية (HTML مدعوم)</label>
            <textarea
              rows={6}
              value={contentEn}
              onChange={(e) => setContentEn(e.target.value)}
              className="w-full bg-[#181818] border border-white/10 rounded-xl p-3 text-white font-mono text-xs"
              dir="ltr"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-white/10 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="gold-button px-8 py-3 rounded-xl font-bold text-xs flex items-center gap-2 shadow-gold-glow"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'جاري الحفظ...' : 'حفظ الصفحة'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
