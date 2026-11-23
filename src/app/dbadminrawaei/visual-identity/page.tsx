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
        <h1 className="text-2xl font-black text-white">إعدادات الهوية البصرية والتصميم</h1>
        <p className="text-xs text-gray-400 mt-1">
          ألوان العلامة الفاخرة، شريط الإعلانات العلوي، ونظام Luxury Glassmorphism
        </p>
      </div>

      {message && (
        <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-200 text-xs font-bold">
          {message}
        </div>
      )}

      {/* Palette Preview */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-[#C49A45]/30 space-y-6">
        <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-white/10 pb-4">
          <Palette className="w-5 h-5 text-[#C49A45]" />
          <span>لوحة الألوان الملكية المعتمدة (Luxury Palette)</span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-center text-xs">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <div
              className="w-16 h-16 rounded-2xl mx-auto shadow-md border border-white/10"
              style={{ backgroundColor: settings.primary_gold }}
            />
            <span className="font-bold text-white block">Primary Gold</span>
            <span className="font-mono text-gray-400 block">{settings.primary_gold}</span>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <div
              className="w-16 h-16 rounded-2xl mx-auto shadow-md border border-white/10"
              style={{ backgroundColor: settings.dark_gold }}
            />
            <span className="font-bold text-white block">Dark Gold</span>
            <span className="font-mono text-gray-400 block">{settings.dark_gold}</span>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <div
              className="w-16 h-16 rounded-2xl mx-auto shadow-md border border-white/10"
              style={{ backgroundColor: settings.white }}
            />
            <span className="font-bold text-white block">White</span>
            <span className="font-mono text-gray-400 block">{settings.white}</span>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <div
              className="w-16 h-16 rounded-2xl mx-auto shadow-md border border-white/10"
              style={{ backgroundColor: settings.black }}
            />
            <span className="font-bold text-white block">Black</span>
            <span className="font-mono text-gray-400 block">{settings.black}</span>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <div
              className="w-16 h-16 rounded-2xl mx-auto shadow-md border border-white/10"
              style={{ backgroundColor: settings.ivory }}
            />
            <span className="font-bold text-white block">Ivory</span>
            <span className="font-mono text-gray-400 block">{settings.ivory}</span>
          </div>
        </div>
      </div>

      {/* Announcement Bar Form */}
      <form
        onSubmit={handleSave}
        className="glass-card rounded-3xl p-6 sm:p-8 border border-[#C49A45]/30 space-y-5"
      >
        <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-white/10 pb-4">
          <Sparkles className="w-5 h-5 text-[#C49A45]" />
          <span>شريط الإعلانات العلوي في المتجر (Announcement Bar)</span>
        </h2>

        <div className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="text-gray-300 font-semibold">نص الشريط بالعربية</label>
            <input
              type="text"
              value={settings.announcement_bar_ar}
              onChange={(e) => setSettings({ ...settings, announcement_bar_ar: e.target.value })}
              className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-gray-300 font-semibold">نص الشريط بالإنجليزية</label>
            <input
              type="text"
              value={settings.announcement_bar_en}
              onChange={(e) => setSettings({ ...settings, announcement_bar_en: e.target.value })}
              className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-white"
              dir="ltr"
            />
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-white font-bold">
              <input
                type="checkbox"
                checked={settings.announcement_active === 'true'}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    announcement_active: e.target.checked ? 'true' : 'false',
                  })
                }
                className="accent-[#C49A45]"
              />
              <span>تفعيل وإظهار شريط الإعلانات في أعلى المتجر</span>
            </label>
          </div>
        </div>

        <div className="pt-4 border-t border-white/10 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="gold-button px-8 py-3 rounded-xl font-bold text-xs flex items-center gap-2 shadow-gold-glow"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'جاري الحفظ...' : 'حفظ إعدادات الهوية والشريط'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
