'use client';

import React, { useState, useEffect } from 'react';
import { Palette, Save, Check, Sparkles, Plus, Trash2 } from 'lucide-react';

interface AnnouncementItem {
  id: string;
  textAr: string;
  textEn: string;
}

const DEFAULT_ANNOUNCEMENTS: AnnouncementItem[] = [
  {
    id: '1',
    textAr: 'شحن مجاني فاخر لكافة محافظات مصر للطلبات فوق 800 جنيه',
    textEn: 'Free Royal Delivery Across Egypt For Orders Above 800 EGP',
  },
  {
    id: '2',
    textAr: 'كود الخصم الحصري: WELCOME10',
    textEn: 'Exclusive Royal Coupon: WELCOME10',
  },
  {
    id: '3',
    textAr: 'ضمان أصالة وجودة ملكية 100% معتمدة لجميع المنتجات',
    textEn: '100% Certified Genuine Royal Quality',
  },
  {
    id: '4',
    textAr: 'دفع إلكتروني فوري وموثوق عبر انستاباي ومحافظ فودافون كاش',
    textEn: 'Instant Transfer via InstaPay & Vodafone Cash',
  },
];

export default function AdminVisualIdentityPage() {
  const [settings, setSettings] = useState({
    primary_gold: '#C49A45',
    dark_gold: '#98702B',
    white: '#FFFFFF',
    black: '#171717',
    ivory: '#F8F5EF',
    announcement_active: 'true',
  });

  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>(DEFAULT_ANNOUNCEMENTS);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/admin/settings?group=identity');
        const data = await res.json();
        if (data.settings) {
          setSettings((prev) => ({
            ...prev,
            primary_gold: data.settings.primary_gold || prev.primary_gold,
            dark_gold: data.settings.dark_gold || prev.dark_gold,
            white: data.settings.white || prev.white,
            black: data.settings.black || prev.black,
            ivory: data.settings.ivory || prev.ivory,
            announcement_active: data.settings.announcement_active !== undefined ? data.settings.announcement_active : 'true',
          }));

          // Parse announcement_items if present
          if (data.settings.announcement_items) {
            try {
              const parsed = JSON.parse(data.settings.announcement_items);
              if (Array.isArray(parsed) && parsed.length > 0) {
                setAnnouncements(parsed);
              }
            } catch (e) {
              console.error('Failed to parse announcement_items', e);
            }
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
    load();
  }, []);

  const handleAddAnnouncement = () => {
    setAnnouncements((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        textAr: '',
        textEn: '',
      },
    ]);
  };

  const handleRemoveAnnouncement = (id: string) => {
    if (announcements.length <= 1) {
      alert('يجب الإبقاء على إعلان واحد على الأقل في الشريط');
      return;
    }
    setAnnouncements((prev) => prev.filter((item) => item.id !== id));
  };

  const handleUpdateAnnouncement = (id: string, field: 'textAr' | 'textEn', val: string) => {
    setAnnouncements((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return { ...item, [field]: val };
        }
        return item;
      })
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      // Filter non-empty announcements
      const cleanAnnouncements = announcements.map((item, idx) => ({
        id: item.id || String(idx + 1),
        textAr: item.textAr.trim() || 'روائع للعطور',
        textEn: item.textEn.trim() || 'RAWAEI PERFUMES',
      }));

      const payload = [
        { key: 'primary_gold', value: settings.primary_gold, group: 'identity' },
        { key: 'dark_gold', value: settings.dark_gold, group: 'identity' },
        { key: 'white', value: settings.white, group: 'identity' },
        { key: 'black', value: settings.black, group: 'identity' },
        { key: 'ivory', value: settings.ivory, group: 'identity' },
        { key: 'announcement_active', value: settings.announcement_active, group: 'identity' },
        { key: 'announcement_items', value: JSON.stringify(cleanAnnouncements), group: 'identity' },
        { key: 'announcement_bar_ar', value: cleanAnnouncements.map((i) => i.textAr).join(' ✨ '), group: 'identity' },
        { key: 'announcement_bar_en', value: cleanAnnouncements.map((i) => i.textEn).join(' ✨ '), group: 'identity' },
      ];

      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('فشل الحفظ');
      setMessage('تم حفظ إعدادات الهوية ونصوص شريط الإعلانات بنجاح! ✓');
      setTimeout(() => setMessage(null), 3500);
    } catch {
      alert('خطأ أثناء الحفظ');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-2xl font-black text-black">إعدادات الهوية البصرية وشريط الإعلانات</h1>
      </div>

      {message && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 text-xs font-black flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{message}</span>
        </div>
      )}

      {/* 1. Palette Preview */}
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

      {/* 2. Announcement Bar Form (Multiple Items with Auto ✨ separator) */}
      <form
        onSubmit={handleSave}
        className="bg-white rounded-3xl p-6 sm:p-8 border border-[#DFC27A]/40 shadow-sm space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#DFC27A]/20 pb-4 gap-4">
          <div>
            <h2 className="text-base font-black text-black flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#98702B]" />
              <span>شريط الإعلانات العلوي في المتجر (Announcement Bar)</span>
            </h2>
          </div>

          <button
            type="button"
            onClick={handleAddAnnouncement}
            className="px-4 py-2 rounded-xl bg-[#FAF6EE] hover:bg-[#F3EAD5] border border-[#DFC27A]/50 text-xs font-black text-black flex items-center gap-1.5 self-start sm:self-auto transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#98702B]" />
            <span>إضافة نص إعلاني جديد</span>
          </button>
        </div>

        {/* Visibility Toggle */}
        <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#DFC27A]/30">
          <label className="flex items-center gap-2.5 cursor-pointer text-black font-black text-xs">
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


        {/* List of Announcement Items */}
        <div className="space-y-4 pt-2">
          <label className="text-xs font-black text-black block">
            قائمة نصوص الشريط الإعلاني ({announcements.length} إعلانات):
          </label>

          <div className="space-y-3">
            {announcements.map((item, index) => (
              <div
                key={item.id || index}
                className="p-4 sm:p-5 rounded-2xl bg-[#FAF8F5] border border-[#DFC27A]/30 space-y-3 relative group"
              >
                <div className="flex items-center justify-between border-b border-[#DFC27A]/15 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-white border border-[#DFC27A]/40 text-[#98702B] font-black text-xs flex items-center justify-center">
                      {index + 1}
                    </span>
                    <span className="text-xs font-black text-black">
                      نص الإعلان #{index + 1}
                    </span>
                  </div>

                  {announcements.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveAnnouncement(item.id)}
                      className="text-red-600 hover:text-red-700 text-xs font-bold flex items-center gap-1 p-1 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                      title="حذف هذا النص"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>حذف</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <label className="text-black font-bold block text-[11px]">
                      النص بالعربية *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: شحن مجاني لكافة محافظات مصر للطلبات فوق 800 جنيه"
                      value={item.textAr}
                      onChange={(e) =>
                        handleUpdateAnnouncement(item.id, 'textAr', e.target.value)
                      }
                      className="w-full bg-white border border-[#DFC27A]/40 rounded-xl px-3.5 py-2 text-xs text-black font-bold placeholder-[#777777] focus:outline-none focus:border-[#C49A45]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-black font-bold block text-[11px]">
                      النص بالإنجليزية (English Text)
                    </label>
                    <input
                      type="text"
                      placeholder="Example: Free Royal Delivery Across Egypt For Orders Above 800 EGP"
                      value={item.textEn}
                      onChange={(e) =>
                        handleUpdateAnnouncement(item.id, 'textEn', e.target.value)
                      }
                      className="w-full bg-white border border-[#DFC27A]/40 rounded-xl px-3.5 py-2 text-xs text-black font-bold placeholder-[#777777] focus:outline-none focus:border-[#C49A45]"
                      dir="ltr"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleAddAnnouncement}
            className="w-full py-3 rounded-2xl bg-[#FAF8F5] hover:bg-[#FAF6EE] border-2 border-dashed border-[#DFC27A]/50 text-xs font-black text-black flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#98702B]" />
            <span>إضافة نص إعلاني آخر للشريط</span>
          </button>
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-[#DFC27A]/20 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="gold-button px-8 py-3 rounded-xl font-black text-black text-xs flex items-center gap-2 shadow-md hover:brightness-105 disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4 text-black" />
            <span>{saving ? 'جاري الحفظ...' : 'حفظ شريط الإعلانات وكافة الإعدادات'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
