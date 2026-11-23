'use client';

import React, { useState, useEffect } from 'react';
import { Search, Save, Check, Globe } from 'lucide-react';

export default function AdminSEOSettings() {
  const [settings, setSettings] = useState({
    seo_meta_title: '',
    seo_meta_description: '',
    seo_keywords: '',
    seo_og_image: '',
    google_analytics_id: '',
    robots_index: 'true',
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/admin/settings?group=seo');
        const data = await res.json();
        if (data.settings) {
          setSettings((prev) => ({ ...prev, ...data.settings }));
        }
      } catch (e) {
        console.error(e);
      }
    }
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error('فشل الحفظ');
      setMessage('تم حفظ إعدادات SEO والأرشفة بنجاح!');
      setTimeout(() => setMessage(null), 3000);
    } catch {
      alert('خطأ أثناء الحفظ');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-black text-black">إعدادات محركات البحث وSEO</h1>
        <p className="text-xs text-neutral-600 mt-1">
          تهيئة الكلمات المفتاحية، عناوين الميتا، وبطاقات OpenGraph لمحركات البحث مثل Google
        </p>
      </div>

      {message && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 text-xs font-black">
          {message}
        </div>
      )}

      <form
        onSubmit={handleSave}
        className="bg-white rounded-3xl p-6 sm:p-8 border border-[#DFC27A]/40 shadow-sm space-y-6"
      >
        <div className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="text-black font-black block">عنوان الموقع الرئيسي في جوجل (Meta Title)</label>
            <input
              type="text"
              value={settings.seo_meta_title}
              onChange={(e) => setSettings({ ...settings, seo_meta_title: e.target.value })}
              className="w-full bg-[#FAF8F5] border border-[#DFC27A]/40 rounded-xl px-4 py-2.5 text-xs text-black font-bold focus:outline-none focus:border-[#C49A45] focus:bg-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-black font-black block">وصف الموقع لمحركات البحث (Meta Description)</label>
            <textarea
              rows={3}
              value={settings.seo_meta_description}
              onChange={(e) => setSettings({ ...settings, seo_meta_description: e.target.value })}
              className="w-full bg-[#FAF8F5] border border-[#DFC27A]/40 rounded-xl p-3 text-xs text-black font-bold focus:outline-none focus:border-[#C49A45] focus:bg-white leading-relaxed"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-black font-black block">الكلمات الدلالية المفتاحية (Keywords)</label>
            <input
              type="text"
              value={settings.seo_keywords}
              onChange={(e) => setSettings({ ...settings, seo_keywords: e.target.value })}
              className="w-full bg-[#FAF8F5] border border-[#DFC27A]/40 rounded-xl px-4 py-2.5 text-xs text-black font-bold focus:outline-none focus:border-[#C49A45] focus:bg-white"
            />
            <span className="text-[11px] text-neutral-500 font-bold">افصل بين الكلمات بفواصل (مثل: عطور رجالية, بخور وعود, متجر عطور مصري)</span>
          </div>

          <div className="space-y-1.5">
            <label className="text-black font-black block">معرف إحصائيات جوجل (Google Analytics ID)</label>
            <input
              type="text"
              placeholder="G-XXXXXXXXXX"
              value={settings.google_analytics_id}
              onChange={(e) => setSettings({ ...settings, google_analytics_id: e.target.value })}
              className="w-full bg-[#FAF8F5] border border-[#DFC27A]/40 rounded-xl px-4 py-2.5 text-xs text-black font-mono font-bold focus:outline-none focus:border-[#C49A45] focus:bg-white"
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
            <span>{saving ? 'جاري الحفظ...' : 'حفظ إعدادات SEO'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
