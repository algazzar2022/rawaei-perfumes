'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  Tag,
  Check,
  ArrowRight,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { formatPrice } from '@/lib/utils';

export default function CartPage() {
  const {
    items,
    updateQuantity,
    removeItem,
    clearCart,
    subtotal,
    discountAmount,
    shippingCost,
    total,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
  } = useCart();
  const { language, direction, t } = useLanguage();
  const router = useRouter();

  const [couponInput, setCouponInput] = useState('');
  const [couponMsg, setCouponMsg] = useState<{ text: string; isError: boolean } | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setIsApplying(true);
    setCouponMsg(null);
    const res = await applyCoupon(couponInput);
    setIsApplying(false);
    setCouponMsg({ text: res.message, isError: !res.success });
    if (res.success) setCouponInput('');
  };

  const isRtl = direction === 'rtl';

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="w-24 h-24 rounded-full bg-[#C49A45]/10 border border-[#C49A45]/30 flex items-center justify-center text-[#C49A45] mb-6">
          <ShoppingBag className="w-12 h-12" />
        </div>
        <h1 className="text-3xl font-black text-white mb-3">
          {t('حقيبة التسوق فارغة', 'Your Shopping Bag is Empty')}
        </h1>
        <p className="text-sm text-gray-400 max-w-md mb-8">
          {t(
            'لم تقم بإضافة أي عطر إلى حقيبتك حتى الآن. استكشف مجموعتنا الملكية واختر ما يعبر عن أناقتك.',
            'You haven’t added any fragrance to your bag yet. Explore our royal collections and elevate your presence.'
          )}
        </p>
        <Link
          href="/perfumes"
          className="gold-button px-8 py-3.5 rounded-full text-sm font-bold flex items-center gap-2 shadow-gold-glow"
        >
          <span>{t('تصفح العطور الآن', 'Browse Fragrances Now')}</span>
          {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-16 bg-gradient-to-b from-[#0E0E0E] via-black to-[#0E0E0E]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-black text-white">
            {t('حقيبة التسوق الفاخرة', 'Luxury Shopping Bag')}
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            {t(`لديك ${items.length} منتجات في الحقيبة`, `You have ${items.length} items in your bag`)}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
          {/* Items Table / Cards */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const mainImg =
                item.product.images?.[0]?.url ||
                '/logo.png';
              const title = language === 'ar' ? item.product.nameAr : item.product.nameEn;

              return (
                <div
                  key={item.id}
                  className="glass-card rounded-2xl p-5 border border-[#C49A45]/20 flex flex-col sm:flex-row items-center gap-5 justify-between"
                >
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="relative w-20 h-24 rounded-xl overflow-hidden bg-neutral-900 flex-shrink-0">
                      <Image
                        src={mainImg}
                        alt={title}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-white line-clamp-1">{title}</h3>
                      <p className="text-xs text-[#DFC27A] mt-0.5">
                        {item.sizeMl} {t('مل', 'ml')}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {t('سعر الحبة:', 'Unit:')} {formatPrice(item.unitPrice, language)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-white/5">
                    {/* Quantity control */}
                    <div className="flex items-center border border-white/10 rounded-xl bg-black/40 px-2 py-1">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-white"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-6 text-center text-xs font-bold text-white">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-white"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Total item price */}
                    <div className="text-right">
                      <span className="text-sm font-extrabold text-[#DFC27A]">
                        {formatPrice(item.unitPrice * item.quantity, language)}
                      </span>
                    </div>

                    {/* Delete button */}
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                      title={t('حذف', 'Remove')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={clearCart}
                className="text-xs text-red-400 hover:underline"
              >
                {t('تفريغ الحقيبة بالكامل', 'Clear entire bag')}
              </button>

              <Link
                href="/perfumes"
                className="text-xs text-[#DFC27A] hover:underline"
              >
                {t('متابعة التسوق', 'Continue Shopping')} →
              </Link>
            </div>
          </div>

          {/* Order Summary Card */}
          <div className="glass-card rounded-3xl p-6 border border-[#C49A45]/30 space-y-6">
            <h3 className="text-lg font-bold text-white border-b border-white/10 pb-4">
              {t('ملخص الطلب', 'Order Summary')}
            </h3>

            {/* Coupon Code Input */}
            <form onSubmit={handleApply} className="space-y-2">
              <label className="text-xs text-gray-300 block font-medium">
                {t('كوبون الخصم:', 'Coupon Code:')}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder={t('أدخل الكود (مثل WELCOME10)', 'Coupon code')}
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  className="flex-1 bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white uppercase focus:outline-none focus:border-[#C49A45]"
                />
                <button
                  type="submit"
                  disabled={isApplying}
                  className="gold-button px-4 py-2 rounded-xl text-xs font-bold"
                >
                  {isApplying ? t('جاري...', 'Applying...') : t('تطبيق', 'Apply')}
                </button>
              </div>
              {couponMsg && (
                <p
                  className={`text-xs ${couponMsg.isError ? 'text-red-400' : 'text-emerald-400'}`}
                >
                  {couponMsg.text}
                </p>
              )}
            </form>

            {appliedCoupon && (
              <div className="flex items-center justify-between bg-[#C49A45]/10 border border-[#C49A45]/30 px-3 py-2 rounded-xl text-xs">
                <span className="text-[#DFC27A] flex items-center gap-1.5 font-bold">
                  <Check className="w-4 h-4 text-emerald-400" />
                  {appliedCoupon.code}
                </span>
                <button
                  onClick={removeCoupon}
                  className="text-red-400 hover:underline text-[11px]"
                >
                  {t('إلغاء الخصم', 'Remove')}
                </button>
              </div>
            )}

            {/* Subtotals breakdown */}
            <div className="space-y-3 text-xs border-t border-white/10 pt-4">
              <div className="flex justify-between text-gray-300">
                <span>{t('المجموع الفرعي', 'Subtotal')}</span>
                <span className="font-semibold">{formatPrice(subtotal, language)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400 font-bold">
                  <span>{t('خصم الكوبون', 'Discount')}</span>
                  <span>-{formatPrice(discountAmount, language)}</span>
                </div>
              )}

              <div className="flex justify-between text-gray-300">
                <span>{t('الشحن والتوصيل', 'Shipping')}</span>
                <span className="font-semibold">
                  {shippingCost === 0 ? (
                    <span className="text-emerald-400">{t('مجاناً', 'Free')}</span>
                  ) : (
                    formatPrice(shippingCost, language)
                  )}
                </span>
              </div>

              <div className="flex justify-between text-base font-extrabold text-white pt-3 border-t border-white/10">
                <span>{t('المجموع الإجمالي', 'Total Amount')}</span>
                <span className="text-[#DFC27A] text-xl">{formatPrice(total, language)}</span>
              </div>
            </div>

            <button
              onClick={() => router.push('/checkout')}
              className="w-full gold-button py-3.5 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold shadow-gold-glow"
            >
              <span>{t('متابعة إتمام الطلب', 'Proceed to Checkout')}</span>
              {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
