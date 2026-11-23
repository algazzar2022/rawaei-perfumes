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
        <h1 className="text-2xl font-black text-white">إعدادات محركات البحث وSEO</h1>
        <p className="text-xs text-gray-400 mt-1">
          تهيئة الكلمات المفتاحية، عناوين الميتا، وبطاقات OpenGraph لمحركات البحث مثل Google
        </p>
      </div>

      {message && (
        <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-200 text-xs font-bold">
          {message}
        </div>
      )}

      <form
        onSubmit={handleSave}
        className="glass-card rounded-3xl p-6 sm:p-8 border border-[#C49A45]/30 space-y-6"
      >
        <div className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="text-gray-300 font-semibold">عنوان الموقع الرئيسي في جوجل (Meta Title)</label>
            <input
              type="text"
              value={settings.seo_meta_title}
              onChange={(e) => setSettings({ ...settings, seo_meta_title: e.target.value })}
              className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2.5 text-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-gray-300 font-semibold">وصف الموقع لمحركات البحث (Meta Description)</label>
            <textarea
              rows={3}
              value={settings.seo_meta_description}
              onChange={(e) => setSettings({ ...settings, seo_meta_description: e.target.value })}
              className="w-full bg-[#181818] border border-white/10 rounded-xl p-3 text-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-gray-300 font-semibold">الكلمات الدلالية المفتاحية (Keywords)</label>
            <input
              type="text"
              value={settings.seo_keywords}
              onChange={(e) => setSettings({ ...settings, seo_keywords: e.target.value })}
              className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-white"
            />
            <span className="text-[11px] text-gray-400">افصل بين الكلمات بفواصل (مثل: عطور, دهن عود, الرياض)</span>
          </div>

          <div className="space-y-1">
            <label className="text-gray-300 font-semibold">معرف إحصائيات جوجل (Google Analytics ID)</label>
            <input
              type="text"
              placeholder="G-XXXXXXXXXX"
              value={settings.google_analytics_id}
              onChange={(e) => setSettings({ ...settings, google_analytics_id: e.target.value })}
              className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-white font-mono"
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
            <span>{saving ? 'جاري الحفظ...' : 'حفظ إعدادات SEO'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
