'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Truck,
  CreditCard,
  Save,
  Check,
  Smartphone,
  Sparkles,
  PhoneCall,
  Search,
  CheckCircle,
  AlertCircle,
  RotateCcw,
  Zap,
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';

export default function AdminShippingPaymentPage() {
  const [shippingMethods, setShippingMethods] = useState<any[]>([]);
  const [initialMethods, setInitialMethods] = useState<any[]>([]);
  const [editedIds, setEditedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savingAll, setSavingAll] = useState(false);
  const [shippingMessage, setShippingMessage] = useState<string | null>(null);

  // Bulk Free Shipping Threshold input
  const [bulkThreshold, setBulkThreshold] = useState('800');
  const [applyingBulk, setApplyingBulk] = useState(false);

  // Payment settings state
  const [paymentSettings, setPaymentSettings] = useState({
    payment_instapay_number: '01001234567',
    payment_vodafone_cash_number: '01009876543',
    payment_account_name: 'روائع للعطور (RAWAEI)',
  });

  const [loading, setLoading] = useState(true);
  const [savingPayment, setSavingPayment] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [shipRes, setRes] = await Promise.all([
        fetch('/api/admin/shipping'),
        fetch('/api/admin/settings?group=payment'),
      ]);
      const shipData = await shipRes.json();
      const setData = await setRes.json();

      const methods = shipData.shippingMethods || [];
      setShippingMethods(methods);
      setInitialMethods(JSON.parse(JSON.stringify(methods)));
      setEditedIds(new Set());

      if (setData.settings) {
        setPaymentSettings((prev) => ({
          ...prev,
          payment_instapay_number: setData.settings.payment_instapay_number || prev.payment_instapay_number,
          payment_vodafone_cash_number: setData.settings.payment_vodafone_cash_number || prev.payment_vodafone_cash_number,
          payment_account_name: setData.settings.payment_account_name || prev.payment_account_name,
        }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Update a field for a single governorate
  const handleFieldChange = (id: string, field: string, value: any) => {
    setShippingMethods((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return { ...item, [field]: value };
        }
        return item;
      })
    );

    setEditedIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  // Save a single governorate row
  const handleSaveRow = async (id: string) => {
    const item = shippingMethods.find((m) => m.id === id);
    if (!item) return;

    setSavingId(id);
    setShippingMessage(null);

    try {
      const res = await fetch('/api/admin/shipping', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: item.id,
          nameAr: item.nameAr,
          nameEn: item.nameEn,
          cost: parseFloat(item.cost) || 0,
          freeShippingAbove: item.freeShippingAbove !== '' && item.freeShippingAbove !== null ? parseFloat(item.freeShippingAbove) : null,
          estimatedDays: item.estimatedDays,
          isActive: item.isActive,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'فشل تحديث المحافظة');

      setEditedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });

      setShippingMessage(`تم حفظ أسعار شحن محافظة (${item.nameAr}) بنجاح في قاعدة البيانات ✓`);
      setTimeout(() => setShippingMessage(null), 3500);
    } catch (err: any) {
      alert(err.message || 'حدث خطأ أثناء الحفظ');
    } finally {
      setSavingId(null);
    }
  };

  // Save all modified governorates
  const handleSaveAllEdited = async () => {
    if (editedIds.size === 0) return;
    setSavingAll(true);
    setShippingMessage(null);

    try {
      const itemsToUpdate = shippingMethods.filter((m) => editedIds.has(m.id));

      const res = await fetch('/api/admin/shipping', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: itemsToUpdate }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'فشل حفظ التعديلات');

      setEditedIds(new Set());
      setShippingMessage(`تم حفظ وتحديث ${itemsToUpdate.length} محافظات بنجاح في قاعدة البيانات والطلبات ✓`);
      setTimeout(() => setShippingMessage(null), 4000);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'حدث خطأ أثناء الحفظ');
    } finally {
      setSavingAll(false);
    }
  };

  // Apply unified free shipping threshold across all governorates
  const handleApplyBulkFreeShipping = async () => {
    const val = parseFloat(bulkThreshold);
    if (isNaN(val) || val <= 0) {
      alert('يرجى إدخال مبلغ صحيح');
      return;
    }

    if (!confirm(`هل أنت متأكد من تطبيق حد الشحن المجاني (${val} ج.م) على كافة محافظات مصر الـ 27 دفعة واحدة؟`)) return;

    setApplyingBulk(true);
    try {
      const res = await fetch('/api/admin/shipping', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bulkFreeShippingAbove: val }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'فشل تطبيق الحد');

      setShippingMessage(`تم تطبيق حد الشحن المجاني (${val} ج.م) على كافة محافظات مصر الـ 27 بنجاح!`);
      setTimeout(() => setShippingMessage(null), 4000);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'خطأ أثناء تطبيق الحد');
    } finally {
      setApplyingBulk(false);
    }
  };

  // Reset unsaved changes
  const handleResetChanges = () => {
    setShippingMethods(JSON.parse(JSON.stringify(initialMethods)));
    setEditedIds(new Set());
  };

  // Save payment numbers
  const handleSavePaymentSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingPayment(true);
      setPaymentMessage(null);

      const payload = [
        { key: 'payment_instapay_number', value: paymentSettings.payment_instapay_number, group: 'payment' },
        { key: 'payment_vodafone_cash_number', value: paymentSettings.payment_vodafone_cash_number, group: 'payment' },
        { key: 'payment_account_name', value: paymentSettings.payment_account_name, group: 'payment' },
      ];

      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('فشل حفظ الإعدادات');
      setPaymentMessage('تم حفظ وتحديث أرقام الدفع الإلكتروني بنجاح!');
      setTimeout(() => setPaymentMessage(null), 3500);
    } catch (err: any) {
      alert(err.message || 'خطأ في الحفظ');
    } finally {
      setSavingPayment(false);
    }
  };

  // Filtered governorates based on search query
  const filteredGovernorates = useMemo(() => {
    if (!searchQuery.trim()) return shippingMethods;
    const q = searchQuery.trim().toLowerCase();
    return shippingMethods.filter(
      (m) =>
        m.nameAr.toLowerCase().includes(q) ||
        m.nameEn.toLowerCase().includes(q) ||
        (m.estimatedDays && m.estimatedDays.toLowerCase().includes(q))
    );
  }, [shippingMethods, searchQuery]);

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-2xl font-black text-black">إدارة وسائل الشحن والدفع (مصر فقط)</h1>
        <p className="text-xs text-neutral-600 mt-1">
          المتجر يشحن حصرياً داخل جمهورية مصر العربية – حدد تكلفة الشحن، حد الشحن المجاني، ومدة التوصيل لكل محافظة
        </p>
      </div>

      {/* ============================================================== */}
      {/* 1. ELECTRONIC PAYMENT ACCOUNTS                                  */}
      {/* ============================================================== */}
      <form onSubmit={handleSavePaymentSettings} className="bg-white rounded-3xl p-6 sm:p-8 border border-[#DFC27A]/40 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#DFC27A]/20 pb-4 gap-4">
          <div>
            <h2 className="text-base font-black text-black flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-[#98702B]" />
              <span>أرقام وحسابات التحويل الإلكتروني (انستاباي & فودافون كاش)</span>
            </h2>
            <p className="text-xs text-neutral-600 mt-0.5">
              هذه الأرقام تظهر للعملاء في صفحة الدفع مباشرة لنسخها والتحويل عليها
            </p>
          </div>

          <button
            type="submit"
            disabled={savingPayment}
            className="gold-button px-6 py-2.5 rounded-xl text-xs font-black text-black flex items-center gap-2 shadow-md hover:brightness-105 disabled:opacity-50 self-start sm:self-auto cursor-pointer"
          >
            <Save className="w-4 h-4 text-black" />
            <span>{savingPayment ? 'جاري الحفظ...' : 'حفظ أرقام الدفع'}</span>
          </button>
        </div>

        {paymentMessage && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 text-xs font-black flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{paymentMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
          {/* InstaPay */}
          <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#DFC27A]/30 space-y-2">
            <div className="flex items-center gap-2 text-black font-black">
              <span className="w-2.5 h-2.5 rounded-full bg-[#98702B]" />
              <label>رقم هاتف انستاباي (InstaPay)</label>
            </div>
            <p className="text-[11px] text-neutral-600">
              الرقم المسجل في تطبيق InstaPay الذي سيقوم العميل بالتحويل عليه
            </p>
            <input
              type="text"
              required
              value={paymentSettings.payment_instapay_number}
              onChange={(e) =>
                setPaymentSettings({ ...paymentSettings, payment_instapay_number: e.target.value })
              }
              placeholder="010XXXXXXXX"
              className="w-full bg-white border border-[#DFC27A]/40 focus:border-[#C49A45] rounded-xl px-3.5 py-2.5 text-black font-black text-sm tracking-wider outline-none"
              dir="ltr"
            />
          </div>

          {/* Vodafone Cash */}
          <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#DFC27A]/30 space-y-2">
            <div className="flex items-center gap-2 text-black font-black">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
              <label>رقم محفظة فودافون كاش / محافظ إلكترونية</label>
            </div>
            <p className="text-[11px] text-neutral-600">
              رقم المحفظة الذكية للتحويل (فودافون كاش، اتصالات، أورنج، وي)
            </p>
            <input
              type="text"
              required
              value={paymentSettings.payment_vodafone_cash_number}
              onChange={(e) =>
                setPaymentSettings({ ...paymentSettings, payment_vodafone_cash_number: e.target.value })
              }
              placeholder="010XXXXXXXX"
              className="w-full bg-white border border-[#DFC27A]/40 focus:border-[#C49A45] rounded-xl px-3.5 py-2.5 text-black font-black text-sm tracking-wider outline-none"
              dir="ltr"
            />
          </div>

          {/* Account Name */}
          <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#DFC27A]/30 space-y-2">
            <div className="flex items-center gap-2 text-black font-black">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
              <label>اسم صاحب الحساب / المستلم</label>
            </div>
            <p className="text-[11px] text-neutral-600">
              الاسم الذي يظهر للعميل في التطبيق للتأكد من صحة التحويل
            </p>
            <input
              type="text"
              value={paymentSettings.payment_account_name}
              onChange={(e) =>
                setPaymentSettings({ ...paymentSettings, payment_account_name: e.target.value })
              }
              placeholder="روائع للعطور (RAWAEI)"
              className="w-full bg-white border border-[#DFC27A]/40 focus:border-[#C49A45] rounded-xl px-3.5 py-2.5 text-black font-black text-sm outline-none"
            />
          </div>
        </div>
      </form>

      {/* ============================================================== */}
      {/* 2. EGYPTIAN GOVERNORATES SHIPPING RATES (27 GOVERNORATES)      */}
      {/* ============================================================== */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#DFC27A]/40 shadow-sm space-y-6">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#DFC27A]/20 pb-5 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 border border-[#DFC27A]/40 text-[#98702B] text-xs font-black mb-2">
              <Truck className="w-3.5 h-3.5 text-[#98702B]" />
              <span>الشحن المحلي المعتمد داخل مصر</span>
            </div>
            <h2 className="text-xl font-black text-black">
              أسعار الشحن لمحافظات مصر الـ 27 (Governorates Shipping Rates)
            </h2>
            <p className="text-xs text-neutral-600 mt-1">
              عدّل سعر الشحن أو مدة التوصيل أو حد الشحن المجاني لأي محافظة، وسيظهر زر الحفظ وتنعكس الأسعار فورياً في شاشة الدفع والطلبات
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            {editedIds.size > 0 && (
              <button
                type="button"
                onClick={handleResetChanges}
                className="px-4 py-2.5 rounded-xl bg-[#FAF8F5] hover:bg-neutral-200 border border-neutral-300 text-xs font-bold text-black flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>إلغاء التعديلات</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleSaveAllEdited}
              disabled={editedIds.size === 0 || savingAll}
              className={`px-6 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
                editedIds.size > 0
                  ? 'gold-button text-black shadow-md animate-pulse'
                  : 'bg-neutral-100 text-neutral-400 border border-neutral-200 cursor-not-allowed'
              }`}
            >
              <Save className="w-4 h-4" />
              <span>
                {savingAll
                  ? 'جاري حفظ التعديلات...'
                  : editedIds.size > 0
                  ? `حفظ جميع التعديلات (${editedIds.size} محافظات)`
                  : 'حفظ جميع التعديلات'}
              </span>
            </button>
          </div>
        </div>

        {/* Success Message Banner */}
        {shippingMessage && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 text-xs font-black flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{shippingMessage}</span>
          </div>
        )}

        {/* Quick Tools & Filter Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-2xl bg-[#FAF8F5] border border-[#DFC27A]/30 items-center">
          {/* 1. Search Box */}
          <div className="relative md:col-span-1">
            <Search className="w-4 h-4 text-neutral-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ابحث باسم المحافظة (مثال: القاهرة، سوهاج...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-[#DFC27A]/40 rounded-xl pr-10 pl-3 py-2 text-xs text-black font-bold placeholder-[#777777] focus:outline-none focus:border-[#C49A45]"
            />
          </div>

          {/* 2. Bulk Free Shipping Tool */}
          <div className="md:col-span-2 flex flex-col sm:flex-row sm:items-center justify-end gap-3 text-xs">
            <span className="font-bold text-black flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-[#98702B]" />
              <span>تطبيق حد شحن مجاني موحد:</span>
            </span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={bulkThreshold}
                onChange={(e) => setBulkThreshold(e.target.value)}
                placeholder="800"
                className="w-24 bg-white border border-[#DFC27A]/40 rounded-xl px-3 py-1.5 text-xs text-black font-black text-center focus:outline-none focus:border-[#C49A45]"
              />
              <span className="text-black font-bold">ج.م</span>
              <button
                type="button"
                onClick={handleApplyBulkFreeShipping}
                disabled={applyingBulk}
                className="px-4 py-1.5 rounded-xl bg-white hover:bg-neutral-100 border border-[#DFC27A]/50 text-xs font-black text-black shadow-sm transition-colors cursor-pointer"
              >
                {applyingBulk ? 'جاري التطبيق...' : 'تطبيق على الـ 27 محافظة'}
              </button>
            </div>
          </div>
        </div>

        {/* Governorates Table */}
        <div className="bg-white rounded-3xl border border-[#DFC27A]/40 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right">
              <thead className="bg-[#FAF6EE] border-b-2 border-[#DFC27A]/30 text-black">
                <tr>
                  <th className="p-3.5 font-black text-black text-center w-12">#</th>
                  <th className="p-3.5 font-black text-black">اسم المحافظة</th>
                  <th className="p-3.5 font-black text-black">سعر الشحن (ج.م)</th>
                  <th className="p-3.5 font-black text-black">شحن مجاني للطلبات فوق (ج.م)</th>
                  <th className="p-3.5 font-black text-black">مدة التوصيل المقدرة</th>
                  <th className="p-3.5 font-black text-black text-center">التفعيل</th>
                  <th className="p-3.5 font-black text-black text-center">حفظ التعديل</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DFC27A]/15 text-black">
                {filteredGovernorates.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-neutral-500 font-bold">
                      لا توجد محافظات مطابقة لبحثك.
                    </td>
                  </tr>
                ) : (
                  filteredGovernorates.map((gov, idx) => {
                    const isEdited = editedIds.has(gov.id);
                    const isSavingThis = savingId === gov.id;

                    return (
                      <tr
                        key={gov.id}
                        className={`transition-colors ${
                          isEdited ? 'bg-amber-50/70' : 'hover:bg-[#FAF8F5]'
                        }`}
                      >
                        {/* Number */}
                        <td className="p-3.5 text-center font-bold text-neutral-500">
                          {idx + 1}
                        </td>

                        {/* Name */}
                        <td className="p-3.5">
                          <div className="font-black text-black text-sm flex items-center gap-2">
                            <span>{gov.nameAr}</span>
                            {isEdited && (
                              <span className="px-2 py-0.5 rounded-md bg-amber-200 text-amber-950 font-black text-[10px]">
                                تم التعديل
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-neutral-500 font-medium" dir="ltr">
                            {gov.nameEn}
                          </span>
                        </td>

                        {/* Cost */}
                        <td className="p-3.5">
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              min="0"
                              step="1"
                              value={gov.cost}
                              onChange={(e) =>
                                handleFieldChange(gov.id, 'cost', parseFloat(e.target.value) || 0)
                              }
                              className={`w-24 border rounded-xl px-3 py-1.5 text-xs font-black text-center focus:outline-none focus:border-[#C49A45] ${
                                isEdited
                                  ? 'bg-white border-[#DFC27A] text-black font-black ring-1 ring-[#DFC27A]'
                                  : 'bg-[#FAF8F5] border-neutral-300 text-black'
                              }`}
                            />
                            <span className="text-black font-bold">ج.م</span>
                          </div>
                        </td>

                        {/* Free Shipping Above */}
                        <td className="p-3.5">
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              min="0"
                              step="1"
                              value={gov.freeShippingAbove !== null ? gov.freeShippingAbove : ''}
                              onChange={(e) =>
                                handleFieldChange(
                                  gov.id,
                                  'freeShippingAbove',
                                  e.target.value !== '' ? parseFloat(e.target.value) : null
                                )
                              }
                              placeholder="800"
                              className={`w-28 border rounded-xl px-3 py-1.5 text-xs font-black text-center focus:outline-none focus:border-[#C49A45] ${
                                isEdited
                                  ? 'bg-white border-[#DFC27A] text-black font-black ring-1 ring-[#DFC27A]'
                                  : 'bg-[#FAF8F5] border-neutral-300 text-black'
                              }`}
                            />
                            <span className="text-black font-bold">ج.م</span>
                          </div>
                        </td>

                        {/* Estimated Days */}
                        <td className="p-3.5">
                          <input
                            type="text"
                            value={gov.estimatedDays || ''}
                            onChange={(e) =>
                              handleFieldChange(gov.id, 'estimatedDays', e.target.value)
                            }
                            placeholder="مثال: 24-48 ساعة"
                            className={`w-36 border rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none focus:border-[#C49A45] ${
                              isEdited
                                ? 'bg-white border-[#DFC27A] text-black ring-1 ring-[#DFC27A]'
                                : 'bg-[#FAF8F5] border-neutral-300 text-black'
                            }`}
                          />
                        </td>

                        {/* Active Toggle */}
                        <td className="p-3.5 text-center">
                          <label className="inline-flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={gov.isActive}
                              onChange={(e) =>
                                handleFieldChange(gov.id, 'isActive', e.target.checked)
                              }
                              className="accent-[#C49A45] w-4 h-4 cursor-pointer"
                            />
                            <span
                              className={`text-[11px] font-black ${
                                gov.isActive ? 'text-emerald-700' : 'text-neutral-400'
                              }`}
                            >
                              {gov.isActive ? 'مفعل' : 'معطل'}
                            </span>
                          </label>
                        </td>

                        {/* Save Button for this Row */}
                        <td className="p-3.5 text-center">
                          <button
                            type="button"
                            onClick={() => handleSaveRow(gov.id)}
                            disabled={isSavingThis || !isEdited}
                            className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                              isEdited
                                ? 'gold-button text-black shadow-sm hover:brightness-105'
                                : 'bg-neutral-100 text-neutral-400 border border-neutral-200 cursor-default opacity-60'
                            }`}
                            title="حفظ تعديلات هذه المحافظة في قاعدة البيانات"
                          >
                            {isSavingThis ? 'جاري...' : 'حفظ'}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom Save Bar (Sticky when changes exist) */}
        {editedIds.size > 0 && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-700 flex-shrink-0" />
              <span className="text-xs font-black text-amber-950">
                لديك {editedIds.size} محافظات تم تعديل أسعارها ولم تُحفظ بعد! اضغط حفظ لاعتمادها فورياً في المتجر وقاعدة البيانات.
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetChanges}
                className="px-4 py-2 rounded-xl bg-white border border-neutral-300 text-xs font-bold text-black hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                تراجع
              </button>
              <button
                type="button"
                onClick={handleSaveAllEdited}
                disabled={savingAll}
                className="gold-button px-6 py-2 rounded-xl text-xs font-black text-black shadow-md hover:brightness-105 cursor-pointer"
              >
                {savingAll ? 'جاري الحفظ...' : `حفظ التعديلات (${editedIds.size}) الآن`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
