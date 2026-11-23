'use client';

import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Search,
  Filter,
  Eye,
  CheckCircle,
  Truck,
  Clock,
  XCircle,
  Printer,
  ArrowRight,
  User,
  MapPin,
  CreditCard,
  FileText,
} from 'lucide-react';
import { OrderDto } from '@/lib/types';
import { formatPrice, formatDate } from '@/lib/utils';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Page View Mode: 'LIST' or 'DETAIL' (no popups)
  const [viewMode, setViewMode] = useState<'LIST' | 'DETAIL'>('LIST');
  const [selectedOrder, setSelectedOrder] = useState<OrderDto | null>(null);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [newPaymentStatus, setNewPaymentStatus] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/orders');
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const openOrderDetail = (order: OrderDto) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setNewPaymentStatus(order.paymentStatus);
    setAdminNotes(order.adminNotes || '');
    setViewMode('DETAIL');
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setUpdating(true);

    try {
      const res = await fetch(`/api/orders/${selectedOrder.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          paymentStatus: newPaymentStatus,
          adminNotes,
        }),
      });

      if (!res.ok) throw new Error('فشل تحديث حالة الطلب');
      fetchOrders();
      setSelectedOrder({
        ...selectedOrder,
        status: newStatus,
        paymentStatus: newPaymentStatus,
        adminNotes,
      });
      alert('تم تحديث حالة الطلب بنجاح');
    } catch (err: any) {
      alert(err.message || 'خطأ في التحديث');
    } finally {
      setUpdating(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchStatus = statusFilter === 'ALL' || o.status === statusFilter;
    const matchQuery =
      !searchQuery.trim() ||
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerPhone.includes(searchQuery);
    return matchStatus && matchQuery;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* ============================================================== */}
      {/* 1. ORDER DETAIL VIEW (Full Page Invoice & Management)          */}
      {/* ============================================================== */}
      {viewMode === 'DETAIL' && selectedOrder ? (
        <div className="space-y-6">
          {/* Top Return & Action Bar */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#DFC27A]/40 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <button
                type="button"
                onClick={() => setViewMode('LIST')}
                className="inline-flex items-center gap-2 text-xs font-black text-black hover:text-[#98702B] mb-2 transition-colors cursor-pointer"
              >
                <ArrowRight className="w-4 h-4 text-black" />
                <span>العودة إلى جدول الطلبات</span>
              </button>
              <h1 className="text-2xl font-black text-black flex items-center gap-2">
                <ShoppingBag className="w-6 h-6 text-[#98702B]" />
                <span>فاتورة وتفاصيل الطلب #{selectedOrder.orderNumber}</span>
              </h1>
              <p className="text-xs text-neutral-600 mt-1">
                تاريخ تسجيل الطلب: {formatDate(selectedOrder.createdAt, 'ar')}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2.5 rounded-xl bg-[#FAF8F5] hover:bg-neutral-200 border border-neutral-300 text-xs font-black text-black flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4 text-[#98702B]" />
                <span>طباعة البوليصة والفاتورة</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('LIST')}
                className="gold-button px-6 py-2.5 rounded-xl text-xs font-black text-black shadow-md hover:brightness-105 cursor-pointer"
              >
                رجوع للقائمة
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Customer & Shipping Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Customer Box */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#DFC27A]/40 shadow-sm space-y-5 text-xs">
                <h3 className="text-base font-black text-black flex items-center gap-2 border-b border-[#DFC27A]/20 pb-3">
                  <User className="w-4 h-4 text-[#98702B]" />
                  <span>بيانات العميل والشحن</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#DFC27A]/30 space-y-1.5">
                    <span className="text-neutral-600 font-bold block">اسم العميل:</span>
                    <p className="font-black text-black text-sm">{selectedOrder.customerName}</p>
                    <span className="text-neutral-600 font-bold block pt-2">رقم الهاتف:</span>
                    <p className="font-black text-black font-mono text-sm" dir="ltr">{selectedOrder.customerPhone}</p>
                    {selectedOrder.customerEmail && (
                      <>
                        <span className="text-neutral-600 font-bold block pt-2">البريد الإلكتروني:</span>
                        <p className="font-bold text-black">{selectedOrder.customerEmail}</p>
                      </>
                    )}
                  </div>

                  <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#DFC27A]/30 space-y-1.5">
                    <span className="text-neutral-600 font-bold block">المدينة والوجهة:</span>
                    <p className="font-black text-black text-sm">{selectedOrder.shippingCity}</p>
                    <span className="text-neutral-600 font-bold block pt-2">العنوان بالتفصيل:</span>
                    <p className="font-bold text-black leading-relaxed">{selectedOrder.shippingAddress}</p>
                    <span className="text-neutral-600 font-bold block pt-2">طريقة الدفع:</span>
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-950 border border-amber-300">
                      {selectedOrder.paymentMethod === 'cod'
                        ? 'الدفع نقدًا عند الاستلام'
                        : selectedOrder.paymentMethod === 'instapay'
                        ? 'تحويل عبر تطبيق انستاباي (InstaPay)'
                        : selectedOrder.paymentMethod === 'vodafone_cash'
                        ? 'تحويل عبر محفظة فودافون كاش'
                        : selectedOrder.paymentMethod}
                    </span>
                  </div>
                </div>

                {selectedOrder.customerNotes && (
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 space-y-1">
                    <span className="font-black text-amber-950 block">ملاحظات العميل مع الطلب:</span>
                    <p className="font-bold text-neutral-900 leading-relaxed">{selectedOrder.customerNotes}</p>
                  </div>
                )}
              </div>

              {/* Items Ordered Table */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#DFC27A]/40 shadow-sm space-y-4 text-xs">
                <h3 className="text-base font-black text-black flex items-center gap-2 border-b border-[#DFC27A]/20 pb-3">
                  <ShoppingBag className="w-4 h-4 text-[#98702B]" />
                  <span>المنتجات والعطور المطلوبة في هذه الشحنة</span>
                </h3>

                <div className="divide-y divide-[#DFC27A]/20 border border-[#DFC27A]/30 rounded-2xl overflow-hidden">
                  {selectedOrder.items?.map((item) => (
                    <div key={item.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#FAF8F5] transition-colors">
                      <div>
                        <h4 className="font-black text-black text-sm">{item.productNameAr}</h4>
                        <span className="text-neutral-600 font-bold text-xs mt-0.5 block">
                          الحجم: {item.sizeMl} مل | السعر للقطعة: {formatPrice(item.unitPrice, 'ar')}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="px-3 py-1 rounded-lg bg-[#FAF6EE] text-black font-black border border-[#DFC27A]/40">
                          الكمية: {item.quantity}
                        </span>
                        <span className="font-black text-black text-base min-w-[100px] text-left">
                          {formatPrice(item.totalPrice, 'ar')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Financial Summary & Status Control */}
            <div className="space-y-6">
              {/* Financial Summary Card */}
              <div className="bg-white rounded-3xl p-6 border border-[#DFC27A]/40 shadow-sm space-y-4 text-xs">
                <h3 className="text-base font-black text-black flex items-center gap-2 border-b border-[#DFC27A]/20 pb-3">
                  <CreditCard className="w-4 h-4 text-[#98702B]" />
                  <span>الملخص المالي للفاتورة</span>
                </h3>

                <div className="space-y-2.5">
                  <div className="flex justify-between text-neutral-700 font-bold">
                    <span>المجموع الفرعي:</span>
                    <span className="font-black text-black">{formatPrice(selectedOrder.subtotal, 'ar')}</span>
                  </div>

                  {selectedOrder.discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-800 font-black">
                      <span>خصم الكوبون ({selectedOrder.couponCode}):</span>
                      <span>-{formatPrice(selectedOrder.discountAmount, 'ar')}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-neutral-700 font-bold">
                    <span>رسوم الشحن والتوصيل:</span>
                    <span className="font-black text-black">{formatPrice(selectedOrder.shippingCost, 'ar')}</span>
                  </div>

                  <div className="pt-3 border-t-2 border-[#DFC27A]/30 flex justify-between items-center text-sm">
                    <span className="font-black text-black">الإجمالي المطلوب:</span>
                    <span className="font-black text-black text-lg">
                      {formatPrice(selectedOrder.totalAmount, 'ar')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Update Card */}
              <div className="bg-white rounded-3xl p-6 border border-[#DFC27A]/40 shadow-sm space-y-4 text-xs">
                <h3 className="text-base font-black text-black flex items-center gap-2 border-b border-[#DFC27A]/20 pb-3">
                  <CheckCircle className="w-4 h-4 text-[#98702B]" />
                  <span>تحديث حالة الطلب والشحن</span>
                </h3>

                <form onSubmit={handleUpdateStatus} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-black font-black block">حالة الشحنة والطلب:</label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-full bg-[#FAF8F5] border border-[#DFC27A]/40 rounded-xl px-3 py-2.5 text-xs text-black font-bold focus:outline-none focus:border-[#C49A45] focus:bg-white"
                    >
                      <option value="PENDING">PENDING (بانتظار التأكيد)</option>
                      <option value="PROCESSING">PROCESSING (قيد التجهيز والتغليف)</option>
                      <option value="SHIPPED">SHIPPED (خرج مع المندوب للشحن)</option>
                      <option value="DELIVERED">DELIVERED (تم التوصيل بنجاح)</option>
                      <option value="CANCELLED">CANCELLED (تم الإلغاء)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-black font-black block">حالة الدفع المالية:</label>
                    <select
                      value={newPaymentStatus}
                      onChange={(e) => setNewPaymentStatus(e.target.value)}
                      className="w-full bg-[#FAF8F5] border border-[#DFC27A]/40 rounded-xl px-3 py-2.5 text-xs text-black font-bold focus:outline-none focus:border-[#C49A45] focus:bg-white"
                    >
                      <option value="PENDING">PENDING (معلق / عند الاستلام)</option>
                      <option value="PAID">PAID (مدفوع ومؤكد)</option>
                      <option value="FAILED">FAILED (فشل التحويل أو الدفع)</option>
                      <option value="REFUNDED">REFUNDED (مسترجع للعميل)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-black font-black block">ملاحظات الإدارة الداخلية:</label>
                    <textarea
                      rows={3}
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="رقم بوليصة الشحن مع المندوب، ملاحظات الاتصال..."
                      className="w-full bg-[#FAF8F5] border border-[#DFC27A]/40 rounded-xl p-3 text-xs text-black font-bold focus:outline-none focus:border-[#C49A45] focus:bg-white"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={updating}
                    className="w-full gold-button py-2.5 rounded-xl text-xs font-black text-black shadow-md hover:brightness-105 disabled:opacity-50 cursor-pointer"
                  >
                    {updating ? 'جاري حفظ التحديث...' : 'حفظ حالة الطلب'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ============================================================== */
        /* 2. ORDERS LIST VIEW (Table with filters)                       */
        /* ============================================================== */
        <>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-black">إدارة الطلبات والشحنات</h1>
              <p className="text-xs text-neutral-600 mt-1">
                متابعة جميع طلبات المتجر، تحديث حالات الشحن والتوصيل، واستعراض الفواتير
              </p>
            </div>
          </div>

          {/* Filter and Search Bar */}
          <div className="bg-white rounded-2xl p-4 border border-[#DFC27A]/40 shadow-sm flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute top-1/2 -translate-y-1/2 right-3 w-4 h-4 text-neutral-500" />
              <input
                type="text"
                placeholder="بحث برقم الطلب، اسم العميل، الجوال..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#FAF8F5] border border-[#DFC27A]/40 rounded-xl pr-10 pl-3 py-2.5 text-xs text-black font-bold placeholder-[#666666] focus:outline-none focus:border-[#C49A45] focus:bg-white"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#FAF8F5] border border-[#DFC27A]/40 rounded-xl px-4 py-2.5 text-xs text-black font-bold focus:outline-none focus:border-[#C49A45] focus:bg-white"
            >
              <option value="ALL">جميع الحالات</option>
              <option value="PENDING">بانتظار التأكيد (PENDING)</option>
              <option value="PROCESSING">قيد التجهيز (PROCESSING)</option>
              <option value="SHIPPED">تم الشحن (SHIPPED)</option>
              <option value="DELIVERED">تم التوصيل (DELIVERED)</option>
              <option value="CANCELLED">ملغي (CANCELLED)</option>
            </select>
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-3xl border border-[#DFC27A]/40 overflow-hidden shadow-md">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-right">
                <thead className="bg-[#FAF6EE] border-b-2 border-[#DFC27A]/30 text-black">
                  <tr>
                    <th className="p-4 font-black text-black">رقم الطلب</th>
                    <th className="p-4 font-black text-black">العميل</th>
                    <th className="p-4 font-black text-black">المدينة</th>
                    <th className="p-4 font-black text-black">التاريخ</th>
                    <th className="p-4 font-black text-black">المنتجات</th>
                    <th className="p-4 font-black text-black">المبلغ</th>
                    <th className="p-4 font-black text-black">طريقة الدفع</th>
                    <th className="p-4 font-black text-black text-center">حالة الطلب</th>
                    <th className="p-4 font-black text-black text-center">إجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DFC27A]/15 text-black">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-neutral-500 font-bold">
                        لا توجد طلبات مطابقة للبحث أو الفلتر.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((o) => (
                      <tr key={o.id} className="hover:bg-[#FAF8F5] transition-colors">
                        <td className="p-4 font-mono font-black text-[#98702B]">
                          #{o.orderNumber}
                        </td>
                        <td className="p-4">
                          <div className="font-black text-black text-sm">{o.customerName}</div>
                          <div className="text-[11px] text-neutral-600 font-mono font-bold" dir="ltr">{o.customerPhone}</div>
                        </td>
                        <td className="p-4 font-bold text-black">{o.shippingCity}</td>
                        <td className="p-4 text-neutral-600 font-semibold">{formatDate(o.createdAt, 'ar')}</td>
                        <td className="p-4 font-black text-black">
                          {o.items?.length || 0} عطور
                        </td>
                        <td className="p-4 font-black text-black text-sm">
                          {formatPrice(o.totalAmount, 'ar')}
                        </td>
                        <td className="p-4">
                          {o.paymentMethod === 'cod' ? (
                            <span className="inline-block px-2.5 py-1 rounded-md bg-neutral-100 text-neutral-900 border border-neutral-300 font-black text-[11px]">
                              عند الاستلام
                            </span>
                          ) : o.paymentMethod === 'instapay' ? (
                            <span className="inline-block px-2.5 py-1 rounded-md bg-purple-100 text-purple-950 border border-purple-300 font-black text-[11px]">
                              انستاباي ⚡
                            </span>
                          ) : o.paymentMethod === 'vodafone_cash' ? (
                            <span className="inline-block px-2.5 py-1 rounded-md bg-red-100 text-red-950 border border-red-300 font-black text-[11px]">
                              فودافون كاش 📱
                            </span>
                          ) : (
                            <span className="inline-block px-2.5 py-1 rounded-md bg-neutral-100 text-black border border-neutral-300 font-black text-[11px]">
                              {o.paymentMethod}
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-[11px] font-black ${
                              o.status === 'DELIVERED'
                                ? 'bg-emerald-100 text-emerald-950 border border-emerald-300'
                                : o.status === 'SHIPPED'
                                ? 'bg-blue-100 text-blue-950 border border-blue-300'
                                : o.status === 'PROCESSING'
                                ? 'bg-purple-100 text-purple-950 border border-purple-300'
                                : o.status === 'CANCELLED'
                                ? 'bg-red-100 text-red-950 border border-red-300'
                                : 'bg-amber-100 text-amber-950 border border-amber-300'
                            }`}
                          >
                            {o.status === 'DELIVERED'
                              ? 'تم التوصيل ✓'
                              : o.status === 'SHIPPED'
                              ? 'تم الشحن 🚚'
                              : o.status === 'PROCESSING'
                              ? 'قيد التجهيز 📦'
                              : o.status === 'CANCELLED'
                              ? 'ملغي ✕'
                              : 'بانتظار التأكيد ⏳'}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => openOrderDetail(o)}
                            className="px-4 py-1.5 rounded-xl bg-amber-50 hover:bg-[#C49A45] text-amber-950 hover:text-black border border-amber-300 transition-colors font-black text-xs shadow-sm cursor-pointer"
                          >
                            عرض الفاتورة
                          </button>
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
