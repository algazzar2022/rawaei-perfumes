'use client';

import React, { useState, useEffect } from 'react';
import { Truck, CreditCard, Save, Check, Smartphone, Sparkles, PhoneCall } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

export default function AdminShippingPaymentPage() {
  const [shippingMethods, setShippingMethods] = useState<any[]>([]);
  const [paymentSettings, setPaymentSettings] = useState({
    payment_instapay_number: '01001234567',
    payment_vodafone_cash_number: '01009876543',
    payment_account_name: 'روائع للعطور (RAWAEI)',
  });

  const [loading, setLoading] = useState(true);
  const [savingShipping, setSavingShipping] = useState(false);
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

      setShippingMethods(shipData.shippingMethods || []);
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

  const handleUpdateShipping = async (sm: any) => {
    try {
      setSavingShipping(true);
      const res = await fetch('/api/admin/shipping', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sm),
      });
      if (!res.ok) throw new Error('فشل التحديث');
      alert('تم تحديث طريقة الشحن بنجاح!');
      fetchData();
    } catch {
      alert('خطأ أثناء التحديث');
    } finally {
      setSavingShipping(false);
    }
  };

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

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-2xl font-black text-white">إدارة وسائل الشحن والدفع</h1>
        <p className="text-xs text-gray-400 mt-1">
          تحديد أسعار الشحن، فترات التوصيل، حد الشحن المجاني، وأرقام التحويل الإلكتروني (انستاباي وفودافون كاش)
        </p>
      </div>

      {/* 1. Electronic Payment Numbers Control (InstaPay & Vodafone Cash) */}
      <form onSubmit={handleSavePaymentSettings} className="glass-card rounded-3xl p-6 sm:p-8 border border-[#C49A45]/30 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-4 gap-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-[#C49A45]" />
              <span>أرقام وحسابات التحويل الإلكتروني (انستاباي & فودافون كاش)</span>
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              هذه الأرقام تظهر للعملاء في صفحة الدفع مباشرة لنسخها والتحويل عليها
            </p>
          </div>

          <button
            type="submit"
            disabled={savingPayment}
            className="gold-button px-6 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-gold-glow self-start sm:self-auto"
          >
            <Save className="w-4 h-4" />
            <span>{savingPayment ? 'جاري الحفظ...' : 'حفظ أرقام الدفع'}</span>
          </button>
        </div>

        {paymentMessage && (
          <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-200 text-xs font-bold flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{paymentMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
          {/* InstaPay Number */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <div className="flex items-center gap-2 text-white font-bold">
              <span className="w-2 h-2 rounded-full bg-[#C49A45]" />
              <label>رقم هاتف انستاباي (InstaPay)</label>
            </div>
            <p className="text-[11px] text-gray-400">
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
              className="w-full bg-[#181818] border border-white/15 focus:border-[#C49A45] rounded-xl px-3.5 py-2.5 text-white font-bold text-sm tracking-wider outline-none"
              dir="ltr"
            />
          </div>

          {/* Vodafone Cash Number */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <div className="flex items-center gap-2 text-white font-bold">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <label>رقم محفظة فودافون كاش / محافظ إلكترونية</label>
            </div>
            <p className="text-[11px] text-gray-400">
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
              className="w-full bg-[#181818] border border-white/15 focus:border-[#C49A45] rounded-xl px-3.5 py-2.5 text-white font-bold text-sm tracking-wider outline-none"
              dir="ltr"
            />
          </div>

          {/* Account Name */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <div className="flex items-center gap-2 text-white font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <label>اسم صاحب الحساب / المستلم</label>
            </div>
            <p className="text-[11px] text-gray-400">
              الاسم الذي يظهر للعميل في التطبيق للتأكد من صحة التحويل
            </p>
            <input
              type="text"
              value={paymentSettings.payment_account_name}
              onChange={(e) =>
                setPaymentSettings({ ...paymentSettings, payment_account_name: e.target.value })
              }
              placeholder="روائع للعطور (RAWAEI)"
              className="w-full bg-[#181818] border border-white/15 focus:border-[#C49A45] rounded-xl px-3.5 py-2.5 text-white font-bold text-sm outline-none"
            />
          </div>
        </div>
      </form>

      {/* 2. Shipping Methods */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-[#C49A45]/30 space-y-6">
        <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-white/10 pb-4">
          <Truck className="w-5 h-5 text-[#C49A45]" />
          <span>طرق الشحن والتوصيل المدعومة داخل مصر</span>
        </h2>

        <div className="space-y-4">
          {shippingMethods.map((sm, idx) => (
            <div
              key={sm.id}
              className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#DFC27A] text-sm">
                  {sm.nameAr}
                </span>
                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    sm.isActive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
                  }`}
                >
                  {sm.isActive ? 'مفعل' : 'معطل'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-gray-300">سعر الشحن الأساسي (ج.م)</label>
                  <input
                    type="number"
                    value={sm.cost}
                    onChange={(e) => {
                      const copy = [...shippingMethods];
                      copy[idx].cost = parseFloat(e.target.value) || 0;
                      setShippingMethods(copy);
                    }}
                    className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-white font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-gray-300">شحن مجاني للطلبات فوق (ج.م)</label>
                  <input
                    type="number"
                    value={sm.freeShippingAbove || ''}
                    onChange={(e) => {
                      const copy = [...shippingMethods];
                      copy[idx].freeShippingAbove = parseFloat(e.target.value) || null;
                      setShippingMethods(copy);
                    }}
                    placeholder="800"
                    className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-white font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-gray-300">مدة التوصيل المقدرة</label>
                  <input
                    type="text"
                    value={sm.estimatedDays || ''}
                    onChange={(e) => {
                      const copy = [...shippingMethods];
                      copy[idx].estimatedDays = e.target.value;
                      setShippingMethods(copy);
                    }}
                    className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <label className="flex items-center gap-2 cursor-pointer text-gray-300">
                  <input
                    type="checkbox"
                    checked={sm.isActive}
                    onChange={(e) => {
                      const copy = [...shippingMethods];
                      copy[idx].isActive = e.target.checked;
                      setShippingMethods(copy);
                    }}
                    className="accent-[#C49A45]"
                  />
                  <span>تفعيل طريقة الشحن هذه</span>
                </label>

                <button
                  type="button"
                  onClick={() => handleUpdateShipping(sm)}
                  className="gold-button px-5 py-1.5 rounded-xl font-bold text-xs"
                >
                  حفظ التعديل
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
