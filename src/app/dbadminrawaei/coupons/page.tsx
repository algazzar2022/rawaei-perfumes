'use client';

import React, { useState, useEffect } from 'react';
import { TicketPercent, Plus, Trash2, Check, X, Tag, ArrowRight } from 'lucide-react';
import { formatPrice, formatDate } from '@/lib/utils';

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // View Mode: 'LIST' or 'FORM' (no popups)
  const [viewMode, setViewMode] = useState<'LIST' | 'FORM'>('LIST');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    code: '',
    discountType: 'PERCENTAGE',
    discountValue: '',
    minOrderValue: '200',
    maxDiscount: '',
    usageLimit: '100',
    expiresAt: '',
    isActive: true,
  });

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/coupons');
      const data = await res.json();
      setCoupons(data.coupons || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const openCreateForm = () => {
    setFormData({
      code: '',
      discountType: 'PERCENTAGE',
      discountValue: '',
      minOrderValue: '200',
      maxDiscount: '',
      usageLimit: '100',
      expiresAt: '',
      isActive: true,
    });
    setFormError(null);
    setViewMode('FORM');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);

    try {
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'فشل إضافة الكوبون');

      setViewMode('LIST');
      fetchCoupons();
    } catch (err: any) {
      setFormError(err.message || 'خطأ أثناء حفظ الكوبون');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* ============================================================== */}
      {/* 1. FORM VIEW (Create Coupon)                                   */}
      {/* ============================================================== */}
      {viewMode === 'FORM' ? (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#DFC27A]/40 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <button
                type="button"
                onClick={() => setViewMode('LIST')}
                className="inline-flex items-center gap-2 text-xs font-black text-black hover:text-[#98702B] mb-2 transition-colors cursor-pointer"
              >
                <ArrowRight className="w-4 h-4 text-black" />
                <span>العودة إلى جدول الكوبونات</span>
              </button>
              <h1 className="text-2xl font-black text-black flex items-center gap-2">
                <TicketPercent className="w-6 h-6 text-[#98702B]" />
                <span>إنشاء كود وقسيمة خصم جديدة</span>
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setViewMode('LIST')}
                className="px-5 py-2.5 rounded-xl bg-[#FAF8F5] hover:bg-neutral-200 border border-neutral-300 text-xs font-bold text-black transition-colors cursor-pointer"
              >
                إلغاء والرجوع
              </button>
              <button
                type="submit"
                form="coupon-form"
                disabled={saving}
                className="gold-button px-6 py-2.5 rounded-xl text-xs font-black text-black shadow-md hover:brightness-105 disabled:opacity-50 cursor-pointer"
              >
                {saving ? 'جاري الحفظ...' : 'تفعيل الكوبون'}
              </button>
            </div>
          </div>

          {formError && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-300 text-red-900 text-xs font-bold">
              {formError}
            </div>
          )}

          <form
            id="coupon-form"
            onSubmit={handleSave}
            className="bg-white rounded-3xl p-6 sm:p-8 border border-[#DFC27A]/40 shadow-sm space-y-6 text-xs"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-black font-black text-xs block">كود الخصم (Promo Code) *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: RAWAEI15"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full bg-[#FAF8F5] border border-[#DFC27A]/40 rounded-xl px-4 py-2.5 text-xs text-black font-mono font-black placeholder-[#777777] focus:outline-none focus:border-[#C49A45] focus:bg-white"
                  dir="ltr"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-black font-black text-xs block">نوع الخصم *</label>
                <select
                  value={formData.discountType}
                  onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                  className="w-full bg-[#FAF8F5] border border-[#DFC27A]/40 rounded-xl px-4 py-2.5 text-xs text-black font-bold focus:outline-none focus:border-[#C49A45] focus:bg-white"
                >
                  <option value="PERCENTAGE">نسبة مئوية (%)</option>
                  <option value="FIXED">مبلغ ثابت (ج.م)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-black font-black text-xs block">قيمة الخصم *</label>
                <input
                  type="number"
                  required
                  step="0.01"
                  placeholder="مثال: 15"
                  value={formData.discountValue}
                  onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                  className="w-full bg-[#FAF8F5] border border-[#DFC27A]/40 rounded-xl px-4 py-2.5 text-xs text-black font-bold placeholder-[#777777] focus:outline-none focus:border-[#C49A45] focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-black font-black text-xs block">الحد الأدنى لقيمة الطلب (ج.م)</label>
                <input
                  type="number"
                  placeholder="200"
                  value={formData.minOrderValue}
                  onChange={(e) => setFormData({ ...formData, minOrderValue: e.target.value })}
                  className="w-full bg-[#FAF8F5] border border-[#DFC27A]/40 rounded-xl px-4 py-2.5 text-xs text-black font-bold placeholder-[#777777] focus:outline-none focus:border-[#C49A45] focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-black font-black text-xs block">أقصى حد للاستخدام (مرات)</label>
                <input
                  type="number"
                  placeholder="100"
                  value={formData.usageLimit}
                  onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                  className="w-full bg-[#FAF8F5] border border-[#DFC27A]/40 rounded-xl px-4 py-2.5 text-xs text-black font-bold placeholder-[#777777] focus:outline-none focus:border-[#C49A45] focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-black font-black text-xs block">تاريخ الانتهاء (اختياري)</label>
                <input
                  type="date"
                  value={formData.expiresAt}
                  onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                  className="w-full bg-[#FAF8F5] border border-[#DFC27A]/40 rounded-xl px-4 py-2.5 text-xs text-black font-bold focus:outline-none focus:border-[#C49A45] focus:bg-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-2 sm:col-span-2">
                <label className="flex items-center gap-2 cursor-pointer text-black font-bold">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 accent-[#C49A45]"
                  />
                  <span>تفعيل الكوبون للعمل فوراً في المتجر</span>
                </label>
              </div>
            </div>

            <div className="pt-6 border-t border-[#DFC27A]/30 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setViewMode('LIST')}
                className="px-5 py-2.5 rounded-xl bg-[#FAF8F5] hover:bg-neutral-200 border border-neutral-300 text-xs font-bold text-black transition-colors cursor-pointer"
              >
                إلغاء والرجوع
              </button>
              <button
                type="submit"
                disabled={saving}
                className="gold-button px-6 py-2.5 rounded-xl text-xs font-black text-black shadow-md hover:brightness-105 disabled:opacity-50 cursor-pointer"
              >
                {saving ? 'جاري الحفظ...' : 'تفعيل الكوبون'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* ============================================================== */
        /* 2. LIST VIEW (Coupons Table)                                   */
        /* ============================================================== */
        <>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-black">إدارة الكوبونات وقسائم الخصم</h1>
            </div>

            <button
              onClick={openCreateForm}
              className="gold-button px-5 py-2.5 rounded-xl text-xs font-black text-black flex items-center gap-2 self-start sm:self-auto shadow-md hover:brightness-105 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-black" />
              <span>إنشاء كود خصم جديد</span>
            </button>
          </div>

          {/* Coupons Table */}
          <div className="bg-white rounded-3xl border border-[#DFC27A]/40 overflow-hidden shadow-md">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-right">
                <thead className="bg-[#FAF6EE] border-b-2 border-[#DFC27A]/30 text-black">
                  <tr>
                    <th className="p-4 font-black text-black">كود الخصم</th>
                    <th className="p-4 font-black text-black">نوع الخصم</th>
                    <th className="p-4 font-black text-black">قيمة الخصم</th>
                    <th className="p-4 font-black text-black">الحد الأدنى للطلب</th>
                    <th className="p-4 font-black text-black">الاستخدام</th>
                    <th className="p-4 font-black text-black">تاريخ الانتهاء</th>
                    <th className="p-4 font-black text-black text-center">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DFC27A]/15 text-black">
                  {coupons.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-neutral-500 font-bold">
                        لا توجد كوبونات خصم حالياً.
                      </td>
                    </tr>
                  ) : (
                    coupons.map((c) => (
                      <tr key={c.id} className="hover:bg-[#FAF8F5] transition-colors">
                        <td className="p-4">
                          <span className="font-mono font-black text-sm text-[#98702B] px-3 py-1 rounded-xl bg-[#FAF6EE] border border-[#DFC27A]/40 inline-block">
                            {c.code}
                          </span>
                        </td>
                        <td className="p-4 font-bold text-black">
                          {c.discountType === 'PERCENTAGE' ? 'نسبة مئوية (%)' : 'مبلغ ثابت (ج.م)'}
                        </td>
                        <td className="p-4 font-black text-black text-sm">
                          {c.discountType === 'PERCENTAGE'
                            ? `${c.discountValue}%`
                            : `${c.discountValue} ج.م`}
                        </td>
                        <td className="p-4 text-neutral-700 font-bold">
                          {c.minOrderValue ? `${c.minOrderValue} ج.م` : 'بدون حد أدنى'}
                        </td>
                        <td className="p-4">
                          <span className="text-black font-black">{c.usedCount}</span>
                          <span className="text-neutral-500 font-bold">
                            {c.usageLimit ? ` / ${c.usageLimit}` : ' (غير محدود)'}
                          </span>
                        </td>
                        <td className="p-4 text-neutral-600 font-semibold">
                          {c.expiresAt ? formatDate(c.expiresAt, 'ar') : 'صالح دائماً'}
                        </td>
                        <td className="p-4 text-center">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-[11px] font-black ${
                              c.isActive
                                ? 'bg-emerald-100 text-emerald-950 border border-emerald-300'
                                : 'bg-red-100 text-red-950 border border-red-300'
                            }`}
                          >
                            {c.isActive ? 'مفعل ✓' : 'معطل ✕'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
