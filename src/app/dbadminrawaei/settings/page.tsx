'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Save, Check, Globe } from 'lucide-react';

export default function AdminGeneralSettingsPage() {
  const [settings, setSettings] = useState({
    site_name_ar: 'روائع للعطور',
    site_name_en: 'RAWAEI PERFUMES',
    tagline_ar: 'الفخامة في كل قطرة عطر',
    tagline_en: 'Royal Luxury in Every Drop',
    contact_phone: '+201001234567',
    contact_whatsapp: '+201001234567',
    contact_email: 'info@rawaei.com',
    contact_address_ar: 'جمهورية مصر العربية، القاهرة – التجمع الخامس، شارع التسعين الشمالي',
    contact_address_en: '90th St, New Cairo, Cairo, Egypt',
    currency: 'EGP',
    currency_symbol_ar: 'ج.م',
    social_instagram: 'https://instagram.com/rawaeiperfumes',
    social_facebook: 'https://facebook.com/rawaeiperfumes',
    social_tiktok: 'https://tiktok.com/@rawaeiperfumes',
    social_snapchat: 'https://snapchat.com/add/rawaei',
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/admin/settings');
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
      setMessage('تم حفظ الإعدادات العامة بنجاح!');
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
        <h1 className="text-2xl font-black text-black">إعدادات الموقع العامة</h1>
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
        {/* Basic Store Info */}
        <div className="space-y-4">
          <h2 className="text-base font-black text-black border-b border-[#DFC27A]/20 pb-3">
            المعلومات الأساسية للمتجر
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-black font-black block">اسم المتجر بالعربية</label>
              <input
                type="text"
                value={settings.site_name_ar}
                onChange={(e) => setSettings({ ...settings, site_name_ar: e.target.value })}
                className="w-full bg-[#FAF8F5] border border-[#DFC27A]/40 rounded-xl px-4 py-2.5 text-xs text-black font-bold focus:outline-none focus:border-[#C49A45] focus:bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-black font-black block">اسم المتجر بالإنجليزية</label>
              <input
                type="text"
                value={settings.site_name_en}
                onChange={(e) => setSettings({ ...settings, site_name_en: e.target.value })}
                className="w-full bg-[#FAF8F5] border border-[#DFC27A]/40 rounded-xl px-4 py-2.5 text-xs text-black font-bold focus:outline-none focus:border-[#C49A45] focus:bg-white"
                dir="ltr"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-black font-black block">شعار المتجر (Tagline) بالعربية</label>
              <input
                type="text"
                value={settings.tagline_ar}
                onChange={(e) => setSettings({ ...settings, tagline_ar: e.target.value })}
                className="w-full bg-[#FAF8F5] border border-[#DFC27A]/40 rounded-xl px-4 py-2.5 text-xs text-black font-bold focus:outline-none focus:border-[#C49A45] focus:bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-black font-black block">شعار المتجر (Tagline) بالإنجليزية</label>
              <input
                type="text"
                value={settings.tagline_en}
                onChange={(e) => setSettings({ ...settings, tagline_en: e.target.value })}
                className="w-full bg-[#FAF8F5] border border-[#DFC27A]/40 rounded-xl px-4 py-2.5 text-xs text-black font-bold focus:outline-none focus:border-[#C49A45] focus:bg-white"
                dir="ltr"
              />
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-4 pt-4 border-t border-[#DFC27A]/20">
          <h2 className="text-base font-black text-black border-b border-[#DFC27A]/20 pb-3">
            بيانات الاتصال والتواصل
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-black font-black block">رقم الهاتف الرسمي</label>
              <input
                type="text"
                value={settings.contact_phone}
                onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })}
                className="w-full bg-[#FAF8F5] border border-[#DFC27A]/40 rounded-xl px-4 py-2.5 text-xs text-black font-mono font-bold focus:outline-none focus:border-[#C49A45] focus:bg-white"
                dir="ltr"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-black font-black block">رقم خدمة العملاء (واتساب)</label>
              <input
                type="text"
                value={settings.contact_whatsapp}
                onChange={(e) => setSettings({ ...settings, contact_whatsapp: e.target.value })}
                className="w-full bg-[#FAF8F5] border border-[#DFC27A]/40 rounded-xl px-4 py-2.5 text-xs text-black font-mono font-bold focus:outline-none focus:border-[#C49A45] focus:bg-white"
                dir="ltr"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-black font-black block">البريد الإلكتروني الرسمي</label>
              <input
                type="email"
                value={settings.contact_email}
                onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                className="w-full bg-[#FAF8F5] border border-[#DFC27A]/40 rounded-xl px-4 py-2.5 text-xs text-black font-mono font-bold focus:outline-none focus:border-[#C49A45] focus:bg-white"
                dir="ltr"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-black font-black block">عنوان المعرض أو المقر الرئيسي</label>
              <input
                type="text"
                value={settings.contact_address_ar}
                onChange={(e) => setSettings({ ...settings, contact_address_ar: e.target.value })}
                className="w-full bg-[#FAF8F5] border border-[#DFC27A]/40 rounded-xl px-4 py-2.5 text-xs text-black font-bold focus:outline-none focus:border-[#C49A45] focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* Social Media Links */}
        <div className="space-y-4 pt-4 border-t border-[#DFC27A]/20">
          <h2 className="text-base font-black text-black border-b border-[#DFC27A]/20 pb-3">
            روابط منصات التواصل الاجتماعي
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-black font-black block">Instagram</label>
              <input
                type="url"
                value={settings.social_instagram}
                onChange={(e) => setSettings({ ...settings, social_instagram: e.target.value })}
                className="w-full bg-[#FAF8F5] border border-[#DFC27A]/40 rounded-xl px-4 py-2.5 text-xs text-black font-mono font-bold focus:outline-none focus:border-[#C49A45] focus:bg-white"
                dir="ltr"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-black font-black block">Facebook</label>
              <input
                type="url"
                value={settings.social_facebook}
                onChange={(e) => setSettings({ ...settings, social_facebook: e.target.value })}
                className="w-full bg-[#FAF8F5] border border-[#DFC27A]/40 rounded-xl px-4 py-2.5 text-xs text-black font-mono font-bold focus:outline-none focus:border-[#C49A45] focus:bg-white"
                dir="ltr"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-black font-black block">TikTok</label>
              <input
                type="url"
                value={settings.social_tiktok}
                onChange={(e) => setSettings({ ...settings, social_tiktok: e.target.value })}
                className="w-full bg-[#FAF8F5] border border-[#DFC27A]/40 rounded-xl px-4 py-2.5 text-xs text-black font-mono font-bold focus:outline-none focus:border-[#C49A45] focus:bg-white"
                dir="ltr"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-black font-black block">Snapchat</label>
              <input
                type="url"
                value={settings.social_snapchat}
                onChange={(e) => setSettings({ ...settings, social_snapchat: e.target.value })}
                className="w-full bg-[#FAF8F5] border border-[#DFC27A]/40 rounded-xl px-4 py-2.5 text-xs text-black font-mono font-bold focus:outline-none focus:border-[#C49A45] focus:bg-white"
                dir="ltr"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-[#DFC27A]/20 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="gold-button px-8 py-3 rounded-xl font-black text-black text-xs flex items-center gap-2 shadow-md hover:brightness-105 disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4 text-black" />
            <span>{saving ? 'جاري الحفظ...' : 'حفظ الإعدادات العامة'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
