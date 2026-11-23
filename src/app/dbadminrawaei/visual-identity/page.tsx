'use client';

import React, { useState, useEffect } from 'react';
import { Palette, Save, Check, Sparkles, Eye } from 'lucide-react';

export default function AdminVisualIdentityPage() {
  const [settings, setSettings] = useState({
    primary_gold: '#C49A45',
    dark_gold: '#98702B',
    white: '#FFFFFF',
    black: '#171717',
    ivory: '#F8F5EF',
    announcement_bar_ar: '✨ شحن مجاني لكافة محافظات مصر للطلبات فوق 800 جنيه | كود الخصم: WELCOME10 ✨',
    announcement_bar_en: '✨ Free Nationwide Delivery in Egypt for orders above 800 EGP | Coupon: WELCOME10 ✨',
    announcement_active: 'true',
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/admin/settings?group=identity');
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
      setMessage('تم حفظ إعدادات الهوية البصرية بنجاح!');
      setTimeout(() => setMessage(null), 3000);
    } catch {
      alert('خطأ أثناء الحفظ');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-2xl font-black text-black">إعدادات الهوية البصرية والتصميم</h1>
        <p className="text-xs text-neutral-600 mt-1">
          ألوان العلامة الفاخرة، شريط الإعلانات العلوي، ونظام Luxury Glassmorphism
        </p>
      </div>

      {message && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 text-xs font-black">
          {message}
        </div>
      )}

      {/* Palette Preview */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#DFC27A]/40 shadow-sm space-y-6">
        <h2 className="text-base font-black text-black flex items-center gap-2 border-b border-[#DFC27A]/20 pb-4">
          <Palette className="w-5 h-5 text-[#98702B]" />
          <span>لوحة الألوان الملكية المعتمدة (Luxury Palette)</span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-center text-xs">
          <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#DFC27A]/30 space-y-2">
            <div
              className="w-16 h-16 rounded-2xl mx-auto shadow-md border border-[#DFC27A]/40"
              style={{ backgroundColor: settings.primary_gold }}
            />
            <span className="font-black text-black block">Primary Gold</span>
            <span className="font-mono text-neutral-700 font-bold block">{settings.primary_gold}</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#DFC27A]/30 space-y-2">
            <div
              className="w-16 h-16 rounded-2xl mx-auto shadow-md border border-[#DFC27A]/40"
              style={{ backgroundColor: settings.dark_gold }}
            />
            <span className="font-black text-black block">Dark Gold</span>
            <span className="font-mono text-neutral-700 font-bold block">{settings.dark_gold}</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#DFC27A]/30 space-y-2">
            <div
              className="w-16 h-16 rounded-2xl mx-auto shadow-md border border-neutral-300"
              style={{ backgroundColor: settings.white }}
            />
            <span className="font-black text-black block">White</span>
            <span className="font-mono text-neutral-700 font-bold block">{settings.white}</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#DFC27A]/30 space-y-2">
            <div
              className="w-16 h-16 rounded-2xl mx-auto shadow-md border border-neutral-800"
              style={{ backgroundColor: settings.black }}
            />
            <span className="font-black text-black block">Black</span>
            <span className="font-mono text-neutral-700 font-bold block">{settings.black}</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#DFC27A]/30 space-y-2">
            <div
              className="w-16 h-16 rounded-2xl mx-auto shadow-md border border-[#DFC27A]/30"
              style={{ backgroundColor: settings.ivory }}
            />
            <span className="font-black text-black block">Ivory</span>
            <span className="font-mono text-neutral-700 font-bold block">{settings.ivory}</span>
          </div>
        </div>
      </div>

      {/* Announcement Bar Form */}
      <form
        onSubmit={handleSave}
        className="bg-white rounded-3xl p-6 sm:p-8 border border-[#DFC27A]/40 shadow-sm space-y-5"
      >
        <h2 className="text-base font-black text-black flex items-center gap-2 border-b border-[#DFC27A]/20 pb-4">
          <Sparkles className="w-5 h-5 text-[#98702B]" />
          <span>شريط الإعلانات العلوي في المتجر (Announcement Bar)</span>
        </h2>

        <div className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="text-black font-black block">نص الشريط بالعربية</label>
            <input
              type="text"
              value={settings.announcement_bar_ar}
              onChange={(e) => setSettings({ ...settings, announcement_bar_ar: e.target.value })}
              className="w-full bg-[#FAF8F5] border border-[#DFC27A]/40 rounded-xl px-4 py-2.5 text-xs text-black font-bold focus:outline-none focus:border-[#C49A45] focus:bg-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-black font-black block">نص الشريط بالإنجليزية</label>
            <input
              type="text"
              value={settings.announcement_bar_en}
              onChange={(e) => setSettings({ ...settings, announcement_bar_en: e.target.value })}
              className="w-full bg-[#FAF8F5] border border-[#DFC27A]/40 rounded-xl px-4 py-2.5 text-xs text-black font-bold focus:outline-none focus:border-[#C49A45] focus:bg-white"
              dir="ltr"
            />
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2.5 cursor-pointer text-black font-bold">
              <input
                type="checkbox"
                checked={settings.announcement_active === 'true'}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    announcement_active: e.target.checked ? 'true' : 'false',
                  })
                }
                className="w-4 h-4 accent-[#C49A45] rounded"
              />
              <span>تفعيل وإظهار شريط الإعلانات في أعلى المتجر</span>
            </label>
          </div>
        </div>

        <div className="pt-4 border-t border-[#DFC27A]/20 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="gold-button px-8 py-3 rounded-xl font-black text-black text-xs flex items-center gap-2 shadow-md hover:brightness-105 disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4 text-black" />
            <span>{saving ? 'جاري الحفظ...' : 'حفظ إعدادات الهوية والتصميم'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
