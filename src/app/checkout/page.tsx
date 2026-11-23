'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  ShieldCheck,
  Check,
  ArrowRight,
  ArrowLeft,
  Lock,
  Smartphone,
  Copy,
  Info,
  Truck,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { formatPrice } from '@/lib/utils';

export default function CheckoutPage() {
  const { items, subtotal, discountAmount, shippingCost, total, appliedCoupon, clearCart } =
    useCart();
  const { language, direction, t } = useLanguage();
  const router = useRouter();

  // Egyptian Governorates - Clean names only without any extra text
  const egyptianGovernorates = [
    'القاهرة',
    'الجيزة',
    'الإسكندرية',
    'القليوبية',
    'الدقهلية',
    'الغربية',
    'الشرقية',
    'المنوفية',
    'البحيرة',
    'كفر الشيخ',
    'دمياط',
    'بورسعيد',
    'الإسماعيلية',
    'السويس',
    'الفيوم',
    'بني سويف',
    'المنيا',
    'أسيوط',
    'سوهاج',
    'قنا',
    'الأقصر',
    'أسوان',
    'البحر الأحمر',
    'جنوب سيناء',
    'شمال سيناء',
    'مطروح',
    'الوادي الجديد',
  ];

  // Form states - Strictly 2 payment methods: instapay and vodafone_cash
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    shippingGovernorate: 'القاهرة',
    shippingCity: '',
    shippingAddress: '',
    shippingMethod: 'standard',
    paymentMethod: 'instapay' as 'instapay' | 'vodafone_cash',
    transferSenderPhone: '',
    customerNotes: '',
  });

  // Dynamic Egyptian Governorates from database
  const [shippingGovernorates, setShippingGovernorates] = useState<any[]>([]);

  // Admin configurable payment settings
  const [paymentSettings, setPaymentSettings] = useState({
    instapayNumber: '01001234567',
    vodafoneNumber: '01009876543',
    accountName: 'روائع للعطور (RAWAEI)',
  });

  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch admin payment numbers and governorate shipping rates
  useEffect(() => {
    async function loadCheckoutData() {
      try {
        const [payRes, shipRes] = await Promise.all([
          fetch('/api/admin/settings?group=payment'),
          fetch('/api/shipping'),
        ]);
        const payData = await payRes.json();
        const shipData = await shipRes.json();

        if (payData.settings) {
          setPaymentSettings({
            instapayNumber: payData.settings.payment_instapay_number || '01001234567',
            vodafoneNumber: payData.settings.payment_vodafone_cash_number || '01009876543',
            accountName: payData.settings.payment_account_name || 'روائع للعطور (RAWAEI)',
          });
        }

        if (shipData.shippingMethods && shipData.shippingMethods.length > 0) {
          setShippingGovernorates(shipData.shippingMethods);
        }
      } catch (err) {
        console.error('Failed to load checkout settings', err);
      }
    }
    loadCheckoutData();
  }, []);

  // Determine active governorate object and dynamic shipping rate
  const selectedGov = React.useMemo(() => {
    return shippingGovernorates.find(
      (g) => g.nameAr === formData.shippingGovernorate || g.nameAr.includes(formData.shippingGovernorate)
    );
  }, [shippingGovernorates, formData.shippingGovernorate]);

  const effectiveShippingCost = React.useMemo(() => {
    if (items.length === 0) return 0;
    if (!selectedGov) return subtotal >= 800 ? 0 : 50;
    const freeAbove = selectedGov.freeShippingAbove !== null && selectedGov.freeShippingAbove !== undefined
      ? selectedGov.freeShippingAbove
      : 800;
    if (subtotal >= freeAbove) return 0;
    return selectedGov.cost;
  }, [selectedGov, subtotal, items.length]);

  const effectiveTotal = Math.max(0, subtotal - discountAmount + effectiveShippingCost);

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2500);
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      router.push('/products');
      return;
    }

    if (
      !formData.customerName.trim() ||
      !formData.customerEmail.trim() ||
      !formData.customerPhone.trim() ||
      !formData.shippingGovernorate.trim() ||
      !formData.shippingCity.trim() ||
      !formData.shippingAddress.trim()
    ) {
      setErrorMessage(t('يرجى ملء جميع الحقول المطلوبة (المحافظة، المدينة، والعنوان التفصيلي)', 'Please complete all required fields'));
      return;
    }

    if (!formData.transferSenderPhone.trim()) {
      setErrorMessage(
        formData.paymentMethod === 'instapay'
          ? 'يرجى إدخال رقم هاتفك المحول منه عبر تطبيق انستاباي لتأكيد الطلب'
          : 'يرجى إدخال رقم محفظتك المحول منها عبر فودافون كاش لتأكيد الطلب'
      );
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          items: items.map((i) => ({
            productId: i.productId,
            sizeMl: i.sizeMl,
            quantity: i.quantity,
          })),
          couponCode: appliedCoupon?.code || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'فشل إتمام الطلب');
      }

      // Success! Clear cart and redirect
      clearCart();
      router.push(`/order-success/${data.orderNumber}`);
    } catch (err: any) {
      setErrorMessage(err.message || 'حدث خطأ أثناء حفظ الطلب، يرجى المحاولة ثانية');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isRtl = direction === 'rtl';

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 bg-[#F8F5EF]">
        <h2 className="text-2xl font-bold text-[#171717] mb-2">{t('لا توجد منتجات للدفع', 'No items in cart')}</h2>
        <Link href="/products" className="gold-button px-6 py-2.5 rounded-full text-xs font-bold mt-4 shadow-md">
          {t('تصفح المتجر', 'Browse Store')}
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 sm:py-14 bg-[#F8F5EF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C49A45]/15 border border-[#C49A45]/30 text-[11px] sm:text-xs font-bold text-[#98702B]">
            <Lock className="w-3.5 h-3.5 text-[#C49A45]" />
            <span>{t('إتمام الطلب والدفع المشفر الآمن 100%', '100% Encrypted & Secure Checkout')}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-[#171717]">
            {t('تأكيد الطلب الفاخر', 'Complete Your Royal Order')}
          </h1>
        </div>

        {errorMessage && (
          <div className="max-w-4xl mx-auto mb-6 sm:mb-8 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
            <span>⚠️</span>
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-10 items-start">
          {/* Customer & Shipping Data (Left/Center) */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            {/* 1. Contact Information */}
            <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-[#C49A45]/25 shadow-sm space-y-4 sm:space-y-5">
              <h3 className="text-base sm:text-lg font-bold text-[#171717] flex items-center gap-2 border-b border-[#C49A45]/15 pb-3">
                <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#C49A45] text-white text-xs font-black flex items-center justify-center">
                  1
                </span>
                <span>{t('معلومات العميل والتواصل', 'Contact Information')}</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-neutral-700 font-semibold">
                    {t('الاسم بالكامل *', 'Full Name *')}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={t('محمد علي...', 'John Doe')}
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-[#C49A45]/30 rounded-xl px-4 py-2.5 text-xs text-[#171717] focus:outline-none focus:border-[#C49A45]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-neutral-700 font-semibold">
                    {t('رقم الهاتف المحمول (واتساب) *', 'Phone / WhatsApp *')}
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="010XXXXXXXX"
                    value={formData.customerPhone}
                    onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-[#C49A45]/30 rounded-xl px-4 py-2.5 text-xs text-[#171717] focus:outline-none focus:border-[#C49A45]"
                    dir="ltr"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs text-neutral-700 font-semibold">
                    {t('البريد الإلكتروني لتأكيد الفاتورة *', 'Email Address *')}
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={formData.customerEmail}
                    onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-[#C49A45]/30 rounded-xl px-4 py-2.5 text-xs text-[#171717] focus:outline-none focus:border-[#C49A45]"
                  />
                </div>
              </div>
            </div>

            {/* 2. Shipping Address */}
            <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-[#C49A45]/25 shadow-sm space-y-4 sm:space-y-5">
              <h3 className="text-base sm:text-lg font-bold text-[#171717] flex items-center gap-2 border-b border-[#C49A45]/15 pb-3">
                <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#C49A45] text-white text-xs font-black flex items-center justify-center">
                  2
                </span>
                <span>{t('عنوان التوصيل والشحن داخل مصر', 'Shipping Address in Egypt')}</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. Governorate Dropdown (Loaded from Database with live rates) */}
                <div className="space-y-1.5">
                  <label className="text-xs text-neutral-700 font-semibold">
                    {t('المحافظة *', 'Governorate *')}
                  </label>
                  <select
                    value={formData.shippingGovernorate}
                    onChange={(e) => setFormData({ ...formData, shippingGovernorate: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-[#C49A45]/30 rounded-xl px-4 py-2.5 text-xs text-[#171717] focus:outline-none focus:border-[#C49A45] font-semibold"
                  >
                    {shippingGovernorates.length > 0
                      ? shippingGovernorates.map((gov) => (
                          <option key={gov.id} value={gov.nameAr}>
                            {gov.nameAr} ({gov.cost} ج.م)
                          </option>
                        ))
                      : egyptianGovernorates.map((gov) => (
                          <option key={gov} value={gov}>
                            {gov}
                          </option>
                        ))}
                  </select>

                  {selectedGov && (
                    <div className="mt-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-neutral-800 space-y-1">
                      <div className="flex items-center justify-between font-bold">
                        <span className="flex items-center gap-1.5 text-black">
                          <Truck className="w-3.5 h-3.5 text-[#98702B]" />
                          <span>توصيل {selectedGov.nameAr}:</span>
                        </span>
                        <span className="font-black text-black">
                          {effectiveShippingCost === 0 ? (
                            <span className="text-emerald-700 font-black">شحن مجاني 🎉</span>
                          ) : (
                            `${selectedGov.cost} ج.م`
                          )}
                        </span>
                      </div>
                      <div className="text-[10px] text-neutral-600 flex items-center justify-between">
                        <span>مدة التوصيل: {selectedGov.estimatedDays || '2-4 أيام عمل'}</span>
                        {selectedGov.freeShippingAbove && (
                          <span className="text-[#98702B] font-bold">
                            (مجاني فوق {selectedGov.freeShippingAbove} ج.م)
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. City Input (User types themselves) */}
                <div className="space-y-1.5">
                  <label className="text-xs text-neutral-700 font-semibold">
                    {t('المدينة / المركز *', 'City / District *')}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={t('اكتب اسم مدينتك أو المركز (مثال: المنصورة، طنطا، مدينة نصر... )', 'e.g. Mansoura, Nasr City, etc.')}
                    value={formData.shippingCity}
                    onChange={(e) => setFormData({ ...formData, shippingCity: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-[#C49A45]/30 rounded-xl px-4 py-2.5 text-xs text-[#171717] focus:outline-none focus:border-[#C49A45]"
                  />
                </div>

                {/* 3. Detailed Street Address */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs text-neutral-700 font-semibold">
                    {t('العنوان التفصيلي (الشارع، رقم العمارة، رقم الشقة، علامة مميزة) *', 'Detailed Street Address *')}
                  </label>
                  <textarea
                    required
                    rows={2}
                    placeholder={t('مثال: شارع الجمهورية، برج الصفا، الدور الرابع، شقة 12، بجوار صيدلية...', 'Street name, building number, apartment, landmark...')}
                    value={formData.shippingAddress}
                    onChange={(e) => setFormData({ ...formData, shippingAddress: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-[#C49A45]/30 rounded-xl px-4 py-2.5 text-xs text-[#171717] focus:outline-none focus:border-[#C49A45]"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs text-neutral-700 font-semibold">
                    {t('ملاحظات إضافية للتوصيل (اختياري)', 'Special delivery notes (optional)')}
                  </label>
                  <input
                    type="text"
                    placeholder={t('مثال: يرجى الاتصال قبل الوصول بنصف ساعة...', 'Optional delivery instructions')}
                    value={formData.customerNotes}
                    onChange={(e) => setFormData({ ...formData, customerNotes: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-[#C49A45]/30 rounded-xl px-4 py-2.5 text-xs text-[#171717] focus:outline-none focus:border-[#C49A45]"
                  />
                </div>
              </div>
            </div>

            {/* 3. Payment Method (Strictly 2 Methods: InstaPay & Vodafone Cash) */}
            <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-[#C49A45]/25 shadow-sm space-y-4 sm:space-y-6">
              <h3 className="text-base sm:text-lg font-bold text-[#171717] flex items-center gap-2 border-b border-[#C49A45]/15 pb-3">
                <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#C49A45] text-white text-xs font-black flex items-center justify-center">
                  3
                </span>
                <span>{t('طريقة الدفع الإلكتروني', 'Payment Method')}</span>
              </h3>

              <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#FAF7F2] via-white to-[#FAF7F2] border-2 border-[#C49A45]/50 shadow-md space-y-4 sm:space-y-6">
                {/* Guide Text */}
                <div className="space-y-1 border-b border-[#C49A45]/20 pb-3">
                  <p className="text-xs sm:text-sm font-bold text-[#171717] leading-relaxed">
                    اختر وسيلة الدفع المناسبة، وانسخ رقم الحساب لإتمام التحويل، ثم أدخل رقمك المحول منه لتأكيد طلبك:
                  </p>
                </div>

                {/* 2 Choices: InstaPay vs Vodafone Cash */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Option 1: InstaPay */}
                  <label
                    onClick={() => setFormData({ ...formData, paymentMethod: 'instapay' })}
                    className={`p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
                      formData.paymentMethod === 'instapay'
                        ? 'bg-[#C49A45]/20 border-[#C49A45] shadow-md ring-2 ring-[#C49A45]'
                        : 'bg-white border-[#C49A45]/20 hover:border-[#C49A45]/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-[#C49A45]/20 text-[#98702B] flex items-center justify-center">
                          <Smartphone className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-black text-[#171717]">
                          انستاباي (InstaPay)
                        </span>
                      </div>
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#C49A45] text-white">
                        فوري ⚡
                      </span>
                    </div>
                    <p className="text-xs text-neutral-600">
                      تحويل فوري بدون أي مصاريف إضافية
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="instapay"
                        checked={formData.paymentMethod === 'instapay'}
                        onChange={() => setFormData({ ...formData, paymentMethod: 'instapay' })}
                        className="accent-[#C49A45] w-4 h-4"
                      />
                      <span className="text-[11px] font-bold text-[#98702B]">اختيار انستاباي</span>
                    </div>
                  </label>

                  {/* Option 2: Vodafone Cash */}
                  <label
                    onClick={() => setFormData({ ...formData, paymentMethod: 'vodafone_cash' })}
                    className={`p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
                      formData.paymentMethod === 'vodafone_cash'
                        ? 'bg-[#C49A45]/20 border-[#C49A45] shadow-md ring-2 ring-[#C49A45]'
                        : 'bg-white border-[#C49A45]/20 hover:border-[#C49A45]/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
                          <Smartphone className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-black text-[#171717]">
                          فودافون كاش
                        </span>
                      </div>
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-red-600 text-white">
                        محفظة كاش 📱
                      </span>
                    </div>
                    <p className="text-xs text-neutral-600">
                      تحويل لمحفظة فودافون كاش بسهولة
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="vodafone_cash"
                        checked={formData.paymentMethod === 'vodafone_cash'}
                        onChange={() => setFormData({ ...formData, paymentMethod: 'vodafone_cash' })}
                        className="accent-red-600 w-4 h-4"
                      />
                      <span className="text-[11px] font-bold text-red-600">اختيار فودافون كاش</span>
                    </div>
                  </label>
                </div>

                {/* Transfer Details Box */}
                {formData.paymentMethod === 'instapay' ? (
                  /* InstaPay Transfer Box */
                  <div className="p-5 rounded-2xl bg-white border border-[#C49A45]/30 space-y-4 animate-fadeIn">
                    <div>
                      <label className="text-xs font-bold text-neutral-700 block mb-1.5">
                        رقم الهاتف المسجل في تطبيق انستاباي (InstaPay) للتحويل عليه:
                      </label>
                      <div className="flex items-center justify-between bg-[#FAF7F2] border border-[#C49A45]/40 rounded-xl px-4 py-3">
                        <span className="font-mono text-base sm:text-lg font-black text-[#171717] tracking-wider" dir="ltr">
                          {paymentSettings.instapayNumber}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(paymentSettings.instapayNumber, 'instapay')}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#C49A45] hover:bg-[#98702B] text-white text-xs font-bold transition-all shadow-sm"
                        >
                          {copiedType === 'instapay' ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>تم النسخ ✓</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>نسخ الرقم</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Reminder / Tip */}
                    <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs leading-relaxed flex items-start gap-2">
                      <span className="text-base flex-shrink-0">💡</span>
                      <span>
                        يرجى تحويل إجمالي المبلغ <strong>({formatPrice(effectiveTotal, language)})</strong> عبر تطبيق انستاباي إلى رقم الهاتف أعلاه ثم إدخال رقم هاتفك المحول منه لتأكيد الطلب.
                      </span>
                    </div>

                    {/* Sender Phone Input */}
                    <div className="space-y-1.5 pt-1">
                      <label className="text-xs text-neutral-800 font-bold flex items-center justify-between">
                        <span>رقم هاتفك المحول منه عبر انستاباي *</span>
                        <span className="text-[11px] text-red-600 font-normal">إجباري للتحقق</span>
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="010XXXXXXXX"
                        value={formData.transferSenderPhone}
                        onChange={(e) => setFormData({ ...formData, transferSenderPhone: e.target.value })}
                        className="w-full bg-[#FAF7F2] border-2 border-[#C49A45]/40 focus:border-[#C49A45] rounded-xl px-4 py-2.5 text-xs text-[#171717] font-bold tracking-wider outline-none"
                        dir="ltr"
                      />
                    </div>
                  </div>
                ) : (
                  /* Vodafone Cash Transfer Box */
                  <div className="p-5 rounded-2xl bg-white border border-[#C49A45]/30 space-y-4 animate-fadeIn">
                    <div>
                      <label className="text-xs font-bold text-neutral-700 block mb-1.5">
                        رقم محفظة فودافون كاش للتحويل عليه:
                      </label>
                      <div className="flex items-center justify-between bg-[#FAF7F2] border border-[#C49A45]/40 rounded-xl px-4 py-3">
                        <span className="font-mono text-base sm:text-lg font-black text-[#171717] tracking-wider" dir="ltr">
                          {paymentSettings.vodafoneNumber}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(paymentSettings.vodafoneNumber, 'vodafone')}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#C49A45] hover:bg-[#98702B] text-white text-xs font-bold transition-all shadow-sm"
                        >
                          {copiedType === 'vodafone' ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>تم النسخ ✓</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>نسخ الرقم</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Reminder / Tip */}
                    <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs leading-relaxed flex items-start gap-2">
                      <span className="text-base flex-shrink-0">💡</span>
                      <span>
                        يرجى تحويل إجمالي المبلغ <strong>({formatPrice(effectiveTotal, language)})</strong> عبر محفظة فودافون كاش إلى الرقم أعلاه ثم إدخال رقم محفظتك المحول منها لتأكيد الطلب.
                      </span>
                    </div>

                    {/* Sender Phone Input */}
                    <div className="space-y-1.5 pt-1">
                      <label className="text-xs text-neutral-800 font-bold flex items-center justify-between">
                        <span>رقم محفظتك المحول منها عبر فودافون كاش *</span>
                        <span className="text-[11px] text-red-600 font-normal">إجباري للتحقق</span>
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="010XXXXXXXX"
                        value={formData.transferSenderPhone}
                        onChange={(e) => setFormData({ ...formData, transferSenderPhone: e.target.value })}
                        className="w-full bg-[#FAF7F2] border-2 border-[#C49A45]/40 focus:border-[#C49A45] rounded-xl px-4 py-2.5 text-xs text-[#171717] font-bold tracking-wider outline-none"
                        dir="ltr"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Order Summary (Right Column) */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-[#C49A45]/30 shadow-sm space-y-4 sm:space-y-6 sticky top-24">
            <h3 className="text-lg font-bold text-[#171717] border-b border-[#C49A45]/15 pb-4">
              {t('محتويات الطلب', 'Order Items')} ({items.length})
            </h3>

            {/* Items list preview */}
            <div className="max-h-60 overflow-y-auto space-y-3 divide-y divide-[#C49A45]/15 pr-1">
              {items.map((item) => (
                <div key={item.id} className="pt-2 flex items-center gap-3">
                  <div className="relative w-12 h-14 rounded-lg overflow-hidden bg-[#FAF7F2] flex-shrink-0">
                    <Image
                      src={
                        item.product.images?.[0]?.url ||
                        '/logo.png'
                      }
                      alt={item.product.nameAr}
                      fill
                      className="object-cover"
                      sizes="50px"
                    />
                  </div>
                  <div className="flex-1 min-w-0 text-xs">
                    <h4 className="text-[#171717] font-bold truncate">
                      {language === 'ar' ? item.product.nameAr : item.product.nameEn}
                    </h4>
                    <span className="text-neutral-500">
                      {item.quantity} × {formatPrice(item.unitPrice, language)} ({item.sizeMl} {t('مل', 'ml')})
                    </span>
                  </div>
                  <span className="text-xs font-black text-[#98702B]">
                    {formatPrice(item.unitPrice * item.quantity, language)}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-3 pt-4 border-t border-[#C49A45]/15 text-xs">
              <div className="flex justify-between text-neutral-600">
                <span>{t('المجموع الفرعي', 'Subtotal')}</span>
                <span className="font-bold text-[#171717]">{formatPrice(subtotal, language)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>
                    {t('خصم الكوبون', 'Coupon Discount')} ({appliedCoupon?.code})
                  </span>
                  <span>-{formatPrice(discountAmount, language)}</span>
                </div>
              )}

              <div className="flex justify-between text-neutral-600">
                <span>{t('رسوم الشحن والتوصيل', 'Shipping')} ({formData.shippingGovernorate})</span>
                <span className="font-bold text-[#171717]">
                  {effectiveShippingCost === 0 ? (
                    <span className="text-emerald-600 font-black">{t('شحن مجاني ✨', 'Free Shipping')}</span>
                  ) : (
                    formatPrice(effectiveShippingCost, language)
                  )}
                </span>
              </div>

              <div className="pt-3 border-t border-[#C49A45]/30 flex justify-between items-center text-sm sm:text-base font-black text-[#171717]">
                <span>{t('الإجمالي المستحق', 'Total Amount')}</span>
                <span className="text-lg font-black text-[#98702B]">
                  {formatPrice(effectiveTotal, language)}
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full gold-button py-3.5 rounded-full text-xs sm:text-sm font-black shadow-gold-glow flex items-center justify-center gap-2 group transition-all"
            >
              <span>
                {isSubmitting
                  ? t('جاري تأكيد وتسجيل الطلب...', 'Processing Order...')
                  : t('تأكيد الطلب والتحويل الآن', 'Confirm Order & Transfer')}
              </span>
              {isRtl ? (
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              ) : (
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              )}
            </button>

            {/* Security Guarantee Badge */}
            <div className="pt-2 text-center text-[11px] text-neutral-500 space-y-1">
              <div className="flex items-center justify-center gap-1.5 text-emerald-700 font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>{t('معاملة مؤكدة ومحمية 100%', '100% Guaranteed & Verified')}</span>
              </div>
              <p>{t('جميع المنتجات أصلية 100% ومضمونة الثبات والفوحان الملكي', '100% authentic royal perfumery guaranteed')}</p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
