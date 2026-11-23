'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowLeft, ArrowRight, Tag, Check, Sparkles } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { formatPrice } from '@/lib/utils';

export default function CartDrawer() {
  const {
    items,
    updateQuantity,
    removeItem,
    isCartOpen,
    setIsCartOpen,
    subtotal,
    discountAmount,
    shippingCost,
    total,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
  } = useCart();
  const { language, direction, t } = useLanguage();

  const [couponInput, setCouponInput] = useState('');
  const [couponMessage, setCouponMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setIsApplying(true);
    setCouponMessage(null);
    const res = await applyCoupon(couponInput);
    setIsApplying(false);
    setCouponMessage({ text: res.message, isError: !res.success });
    if (res.success) setCouponInput('');
  };

  const isRtl = direction === 'rtl';

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          />

          {/* Drawer Container */}
          <motion.div
            initial={{ x: isRtl ? '-100%' : '100%' }}
            animate={{ x: 0 }}
            exit={{ x: isRtl ? '-100%' : '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className={`fixed top-0 bottom-0 ${
              isRtl ? 'left-0' : 'right-0'
            } z-50 w-full max-w-md bg-[#FCFAF7] border-l border-r border-[#C49A45]/30 shadow-2xl flex flex-col`}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-4 sm:px-6 sm:py-5 border-b border-[#C49A45]/20 bg-white">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#C49A45]/15 border border-[#C49A45]/30 flex items-center justify-center text-[#98702B]">
                  <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-[#171717]">
                    {t('حقيبة التسوق الفاخرة', 'Luxury Shopping Bag')}
                  </h3>
                  <span className="text-xs text-[#98702B] font-semibold">
                    {items.length} {t('منتجات', 'items')}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-600 hover:text-black transition-colors"
                aria-label="Close cart"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            {/* Free Shipping Progress */}
            <div className="px-4 py-3 sm:px-6 sm:py-3.5 bg-[#F5EFE6] border-b border-[#C49A45]/15">
              <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
                <span className="text-[#171717] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#C49A45]" />
                  {subtotal >= 800
                    ? t('تهانينا! حصلت على شحن مجاني فاخر', 'Congratulations! Free Delivery unlocked')
                    : t(
                        `أضف ${formatPrice(800 - subtotal, language)} للحصول على شحن مجاني`,
                        `Add ${formatPrice(800 - subtotal, language)} for free delivery`
                      )}
                </span>
                <span className="text-[#98702B] font-bold">
                  {Math.min(100, Math.round((subtotal / 800) * 100))}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#C49A45] to-[#98702B] transition-all duration-500 rounded-full"
                  style={{ width: `${Math.min(100, (subtotal / 800) * 100)}%` }}
                />
              </div>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto px-4 py-3 sm:px-6 sm:py-4 space-y-3 sm:space-y-3.5">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <div className="w-20 h-20 rounded-full bg-[#C49A45]/10 border border-[#C49A45]/20 flex items-center justify-center text-[#C49A45] mb-4">
                    <ShoppingBag className="w-10 h-10 opacity-70" />
                  </div>
                  <h4 className="text-lg font-bold text-[#171717] mb-2">
                    {t('حقيبتك فارغة حالياً', 'Your bag is empty')}
                  </h4>
                  <p className="text-sm text-neutral-500 mb-6 max-w-xs">
                    {t(
                      'استكشف مجموعاتنا الفاخرة من العطور والعود وأضف لمسة من السحر لطلباتك.',
                      'Explore our royal fragrances and add an exquisite touch to your cart.'
                    )}
                  </p>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="gold-button px-6 py-2.5 rounded-full text-sm font-bold shadow-md"
                  >
                    {t('ابدأ التسوق الآن', 'Start Shopping')}
                  </button>
                </div>
              ) : (
                items.map((item) => {
                  const mainImg = item.product.images?.[0]?.url || 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=300';
                  const title = language === 'ar' ? item.product.nameAr : item.product.nameEn;
                  return (
                    <div
                      key={item.id}
                      className="flex gap-4 p-3.5 rounded-2xl bg-white border border-[#C49A45]/20 shadow-sm hover:border-[#C49A45]/50 transition-all"
                    >
                      <div className="relative w-20 h-24 rounded-xl overflow-hidden bg-[#FAF7F2] flex-shrink-0">
                        <Image
                          src={mainImg}
                          alt={title}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </div>

                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-sm font-bold text-[#171717] line-clamp-1">
                              {title}
                            </h4>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-neutral-400 hover:text-red-500 transition-colors p-1"
                              aria-label="Remove item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="text-xs text-[#98702B] font-medium mt-0.5">
                            {item.sizeMl} {t('مل', 'ml')}
                          </p>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          <span className="text-sm font-black text-[#171717]">
                            {formatPrice(item.unitPrice * item.quantity, language)}
                          </span>

                          <div className="flex items-center gap-2 border border-[#C49A45]/30 rounded-lg bg-[#FAF7F2] px-2 py-1">
                            <button
                              onClick={() => updateQuantity(item.id, -1)}
                              className="w-5 h-5 flex items-center justify-center text-neutral-600 hover:text-black font-bold"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-xs font-bold px-1 text-[#171717]">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, 1)}
                              className="w-5 h-5 flex items-center justify-center text-neutral-600 hover:text-black font-bold"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer with Coupon, Summary, and Checkout */}
            {items.length > 0 && (
              <div className="border-t border-[#C49A45]/20 bg-white p-4 sm:p-6 space-y-3 sm:space-y-4">
                {/* Coupon Code Input */}
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute top-1/2 -translate-y-1/2 right-3 w-4 h-4 text-neutral-400" />
                    <input
                      type="text"
                      placeholder={t('أدخل كود الخصم (مثل WELCOME10)', 'Coupon code')}
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      className="w-full bg-[#FAF7F2] border border-[#C49A45]/30 rounded-xl pr-9 pl-3 py-2 text-xs text-[#171717] placeholder-neutral-400 focus:outline-none focus:border-[#C49A45]"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isApplying}
                    className="gold-button px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap shadow-sm"
                  >
                    {isApplying ? t('جاري...', 'Applying...') : t('تطبيق', 'Apply')}
                  </button>
                </form>

                {couponMessage && (
                  <p
                    className={`text-xs font-medium ${
                      couponMessage.isError ? 'text-red-600' : 'text-emerald-600'
                    }`}
                  >
                    {couponMessage.text}
                  </p>
                )}

                {appliedCoupon && (
                  <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl text-xs">
                    <span className="text-emerald-700 flex items-center gap-1.5 font-bold">
                      <Check className="w-4 h-4 text-emerald-600" />
                      {t('تم تفعيل الكوبون:', 'Coupon active:')} {appliedCoupon.code}
                    </span>
                    <button
                      onClick={removeCoupon}
                      className="text-red-600 hover:underline text-[11px] font-semibold"
                    >
                      {t('إلغاء', 'Remove')}
                    </button>
                  </div>
                )}

                {/* Subtotals */}
                <div className="space-y-2 pt-2 text-xs">
                  <div className="flex justify-between text-neutral-600 font-medium">
                    <span>{t('المجموع الفرعي', 'Subtotal')}</span>
                    <span>{formatPrice(subtotal, language)}</span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-bold">
                      <span>{t('خصم الكوبون', 'Discount')}</span>
                      <span>-{formatPrice(discountAmount, language)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-neutral-600 font-medium">
                    <span>{t('الشحن والتوصيل', 'Shipping')}</span>
                    <span>
                      {shippingCost === 0 ? (
                        <span className="text-emerald-600 font-bold">
                          {t('مجاناً', 'Free')}
                        </span>
                      ) : (
                        formatPrice(shippingCost, language)
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm font-black text-[#171717] pt-2 border-t border-[#C49A45]/20">
                    <span>{t('المجموع النهائي', 'Total')}</span>
                    <span className="text-[#98702B] text-base font-black">
                      {formatPrice(total, language)}
                    </span>
                  </div>
                </div>

                {/* Checkout Link */}
                <Link
                  href="/checkout"
                  onClick={() => setIsCartOpen(false)}
                  className="w-full gold-button py-3.5 rounded-xl flex items-center justify-center gap-2 text-sm font-bold text-white shadow-md hover:shadow-lg transition-all"
                >
                  <span>{t('متابعة الدفع الآمن', 'Proceed to Secure Checkout')}</span>
                  {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
