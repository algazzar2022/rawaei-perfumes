'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  ShoppingBag,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  Printer,
  LogOut,
  Search,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Calendar,
  CreditCard,
  MapPin,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { formatPrice, formatDate } from '@/lib/utils';
import { OrderDto } from '@/lib/types';

export default function CustomerAccountPage() {
  const router = useRouter();
  const { language, direction, t } = useLanguage();

  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [loading, setLoading] = useState(true);

  // Quick Tracking Search by Order Number
  const [trackQuery, setTrackQuery] = useState('');
  const [trackedOrder, setTrackedOrder] = useState<OrderDto | null>(null);
  const [trackError, setTrackError] = useState<string | null>(null);
  const [trackLoading, setTrackLoading] = useState(false);

  useEffect(() => {
    async function loadAccount() {
      try {
        setLoading(true);
        // 1. Fetch current logged-in user
        const meRes = await fetch('/api/auth/me');
        const meData = await meRes.json();
        if (!meData.user) {
          router.push('/login');
          return;
        }
        setUser(meData.user);

        // 2. Fetch orders
        const ordRes = await fetch('/api/orders');
        const ordData = await ordRes.json();
        setOrders(ordData.orders || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadAccount();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch {
      router.push('/login');
    }
  };

  const handleTrackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackQuery.trim()) return;
    setTrackLoading(true);
    setTrackError(null);
    setTrackedOrder(null);
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(trackQuery.trim())}`);
      const data = await res.json();
      if (!res.ok || !data.order) {
        throw new Error(t('لم يتم العثور على طلب بهذا الرقم، تأكد من صحة الرمز', 'Order number not found'));
      }
      setTrackedOrder(data.order);
    } catch (err: any) {
      setTrackError(err.message || 'خطأ في تتبع الطلب');
    } finally {
      setTrackLoading(false);
    }
  };

  const isRtl = direction === 'rtl';

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[#F8F5EF]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-[#C49A45] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-[#98702B] font-bold">
            {t('جاري تحميل بيانات حسابك...', 'Loading your account...')}
          </p>
        </div>
      </div>
    );
  }

  // Stepper helper
  const getStepStatus = (status: string, stepIndex: number) => {
    // 0: Placed, 1: Processing, 2: Shipped, 3: Delivered
    let currentStep = 0;
    if (status === 'PROCESSING') currentStep = 1;
    if (status === 'SHIPPED') currentStep = 2;
    if (status === 'DELIVERED') currentStep = 3;
    if (status === 'CANCELLED') currentStep = -1;

    if (currentStep >= stepIndex) return 'completed';
    return 'pending';
  };

  return (
    <div className="min-h-screen py-12 bg-[#F8F5EF] text-[#171717]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Profile Card Header */}
        <div className="bg-white/95 rounded-3xl p-6 sm:p-8 border border-[#C49A45]/30 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#DFC27A] via-[#C49A45] to-[#98702B] p-0.5 shadow-md flex-shrink-0">
              <div className="w-full h-full bg-[#171717] rounded-[14px] flex items-center justify-center text-[#DFC27A]">
                <User className="w-8 h-8" />
              </div>
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#C49A45]/15 border border-[#C49A45]/30 text-[11px] font-bold text-[#98702B] mb-1">
                <Sparkles className="w-3 h-3" />
                <span>{t('عميل روائع المتميز', 'Royal Valued Client')}</span>
              </div>
              <h1 className="text-2xl font-black text-[#171717]">
                {user?.name}
              </h1>
              <p className="text-xs text-gray-500">
                {user?.email} • {user?.phone || ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/perfumes"
              className="gold-button px-5 py-2.5 rounded-xl text-xs font-bold shadow-sm"
            >
              {t('متابعة التسوق', 'Continue Shopping')}
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-red-50 text-xs font-bold text-gray-700 hover:text-red-600 transition-colors flex items-center gap-1.5"
            >
              <LogOut className="w-4 h-4" />
              <span>{t('تسجيل الخروج', 'Log Out')}</span>
            </button>
          </div>
        </div>

        {/* Instant Order Tracking Search */}
        <div className="bg-white/95 rounded-3xl p-6 sm:p-8 border border-[#C49A45]/30 shadow-md space-y-5">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-[#171717] flex items-center gap-2">
              <Truck className="w-5 h-5 text-[#C49A45]" />
              <span>{t('تتبع حالة الشحنة بالرمز', 'Track Order by Number')}</span>
            </h2>
            <p className="text-xs text-gray-500">
              {t(
                'أدخل رقم الطلب لتتبع خط سير الشحنة وموعد التوصيل المتوقع لحظياً',
                'Enter tracking number to follow your order delivery stage live'
              )}
            </p>
          </div>

          <form onSubmit={handleTrackSubmit} className="flex gap-2 max-w-lg">
            <div className="relative flex-1">
              <Search className="absolute top-1/2 -translate-y-1/2 right-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="RW-2026-XXXX"
                value={trackQuery}
                onChange={(e) => setTrackQuery(e.target.value)}
                className="w-full bg-[#FAF7F2] border border-[#DFC27A]/50 rounded-xl pr-10 pl-3 py-2.5 text-xs text-[#171717] font-mono focus:outline-none focus:border-[#C49A45]"
                dir="ltr"
              />
            </div>
            <button
              type="submit"
              disabled={trackLoading}
              className="gold-button px-6 py-2.5 rounded-xl text-xs font-bold shadow-sm"
            >
              {trackLoading ? t('جاري...', 'Searching...') : t('تتبع الشحنة', 'Track')}
            </button>
          </form>

          {trackError && (
            <p className="text-xs text-red-600 font-semibold">{trackError}</p>
          )}

          {/* Stepper Display for Tracked Order */}
          {trackedOrder && (
            <div className="mt-6 p-6 rounded-2xl bg-[#FAF7F2] border border-[#C49A45]/30 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200 pb-4">
                <div>
                  <span className="text-xs text-gray-500 block">{t('رقم الطلب:', 'Order ID:')}</span>
                  <span className="font-mono font-bold text-base text-[#98702B]">
                    {trackedOrder.orderNumber}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-500 block">{t('إجمالي الفاتورة:', 'Total:')}</span>
                  <span className="font-black text-sm text-[#171717]">
                    {formatPrice(trackedOrder.totalAmount, language)}
                  </span>
                </div>
              </div>

              {/* Visual 4-Step Stepper */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-full bg-emerald-500 text-white mx-auto flex items-center justify-center font-bold text-xs shadow-md">
                    ✓
                  </div>
                  <span className="text-xs font-bold text-[#171717] block">
                    {t('تم تأكيد الطلب', 'Order Placed')}
                  </span>
                  <span className="text-[10px] text-gray-400 block">
                    {formatDate(trackedOrder.createdAt, language)}
                  </span>
                </div>

                <div className="space-y-2">
                  <div
                    className={`w-10 h-10 rounded-full mx-auto flex items-center justify-center font-bold text-xs shadow-md ${
                      getStepStatus(trackedOrder.status, 1) === 'completed'
                        ? 'bg-emerald-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {getStepStatus(trackedOrder.status, 1) === 'completed' ? '✓' : '2'}
                  </div>
                  <span className="text-xs font-bold text-[#171717] block">
                    {t('قيد التجهيز والتغليف', 'Processing')}
                  </span>
                  <span className="text-[10px] text-gray-400 block">
                    {t('تغليف إهداء ملكي', 'Luxury Packing')}
                  </span>
                </div>

                <div className="space-y-2">
                  <div
                    className={`w-10 h-10 rounded-full mx-auto flex items-center justify-center font-bold text-xs shadow-md ${
                      getStepStatus(trackedOrder.status, 2) === 'completed'
                        ? 'bg-emerald-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {getStepStatus(trackedOrder.status, 2) === 'completed' ? '✓' : '3'}
                  </div>
                  <span className="text-xs font-bold text-[#171717] block">
                    {t('خرج مع المندوب للشحن', 'Out for Delivery')}
                  </span>
                  <span className="text-[10px] text-gray-400 block">
                    {trackedOrder.shippingCity}
                  </span>
                </div>

                <div className="space-y-2">
                  <div
                    className={`w-10 h-10 rounded-full mx-auto flex items-center justify-center font-bold text-xs shadow-md ${
                      getStepStatus(trackedOrder.status, 3) === 'completed'
                        ? 'bg-emerald-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {getStepStatus(trackedOrder.status, 3) === 'completed' ? '✓' : '4'}
                  </div>
                  <span className="text-xs font-bold text-[#171717] block">
                    {t('تم التوصيل بنجاح', 'Delivered')}
                  </span>
                  <span className="text-[10px] text-gray-400 block">
                    {t('استلم العميل', 'Delivered to Door')}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Order History */}
        <div className="bg-white/95 rounded-3xl p-6 sm:p-8 border border-[#C49A45]/30 shadow-md space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-[#171717] flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#C49A45]" />
                <span>{t('سجل طلباتي السابقة', 'Order History')}</span>
              </h2>
              <p className="text-xs text-gray-500">
                {t(`لديك ${orders.length} طلبات مسجلة`, `You have ${orders.length} placed orders`)}
              </p>
            </div>
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <Package className="w-12 h-12 text-gray-300 mx-auto" />
              <p className="text-sm font-bold text-gray-500">
                {t('لا توجد طلبات مسجلة بحسابك حتى الآن', 'No order history yet')}
              </p>
              <Link
                href="/perfumes"
                className="gold-button inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold shadow-sm"
              >
                <span>{t('استكشف عطورنا الفاخرة', 'Discover Fragrances')}</span>
                {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#C49A45]/20 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-[#98702B] text-sm">
                        {order.orderNumber}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDate(order.createdAt, language)}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          order.status === 'DELIVERED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : order.status === 'SHIPPED'
                            ? 'bg-blue-100 text-blue-800'
                            : order.status === 'PROCESSING'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {order.status}
                      </span>
                      <Link
                        href={`/order-success/${order.orderNumber}`}
                        className="text-xs text-[#98702B] hover:text-[#C49A45] font-bold underline flex items-center gap-1"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>{t('الفاتورة', 'Invoice')}</span>
                      </Link>
                    </div>
                  </div>

                  {/* Items Preview */}
                  <div className="space-y-2 text-xs">
                    {order.items?.map((item) => (
                      <div key={item.id} className="flex justify-between items-center text-gray-700">
                        <span>
                          {language === 'ar' ? item.productNameAr : item.productNameEn}{' '}
                          <span className="text-gray-400">({item.sizeMl} مل × {item.quantity})</span>
                        </span>
                        <span className="font-bold text-[#171717]">
                          {formatPrice(item.totalPrice, language)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-gray-200 flex justify-between items-center text-xs">
                    <span className="text-gray-500">
                      {t('عنوان التوصيل:', 'Destination:')} {order.shippingCity}
                    </span>
                    <span className="font-black text-[#171717] text-sm">
                      {t('المجموع:', 'Total:')} {formatPrice(order.totalAmount, language)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
