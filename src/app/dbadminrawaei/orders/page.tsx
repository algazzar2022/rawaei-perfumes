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
  X,
  AlertCircle,
} from 'lucide-react';
import { OrderDto } from '@/lib/types';
import { formatPrice, formatDate } from '@/lib/utils';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Order Modal
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

  const openOrderModal = (order: OrderDto) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setNewPaymentStatus(order.paymentStatus);
    setAdminNotes(order.adminNotes || '');
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
      alert('تم تحديث الطلب بنجاح!');
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">إدارة الطلبات والشحنات</h1>
          <p className="text-xs text-gray-400 mt-1">
            متابعة جميع طلبات المتجر، تحديث حالات الشحن والتوصيل، وطباعة الفواتير
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card rounded-2xl p-4 border border-white/10 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute top-1/2 -translate-y-1/2 right-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="بحث برقم الطلب، اسم العميل، الجوال..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#171717] border border-white/10 rounded-xl pr-9 pl-3 py-2 text-xs text-white focus:outline-none focus:border-[#C49A45]"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-[#171717] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C49A45]"
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
      <div className="glass-card rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-right">
            <thead className="bg-[#151515] border-b border-white/5 text-gray-400">
              <tr>
                <th className="p-4 font-semibold">رقم الطلب</th>
                <th className="p-4 font-semibold">العميل</th>
                <th className="p-4 font-semibold">المدينة</th>
                <th className="p-4 font-semibold">التاريخ</th>
                <th className="p-4 font-semibold">المنتجات</th>
                <th className="p-4 font-semibold">المبلغ</th>
                <th className="p-4 font-semibold">طريقة الدفع</th>
                <th className="p-4 font-semibold">حالة الطلب</th>
                <th className="p-4 font-semibold text-center">إجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-gray-200">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-gray-400">
                    لا توجد طلبات مطابقة للبحث أو الفلتر.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 font-mono font-bold text-[#DFC27A]">
                      {o.orderNumber}
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-white">{o.customerName}</div>
                      <div className="text-[11px] text-gray-400">{o.customerPhone}</div>
                    </td>
                    <td className="p-4 text-gray-300">{o.shippingCity}</td>
                    <td className="p-4 text-gray-400">{formatDate(o.createdAt, 'ar')}</td>
                    <td className="p-4">
                      <span className="font-semibold text-white">
                        {o.items?.length || 0} عطور
                      </span>
                    </td>
                    <td className="p-4 font-extrabold text-[#DFC27A]">
                      {formatPrice(o.totalAmount, 'ar')}
                    </td>
                    <td className="p-4 text-black font-semibold">
                      {o.paymentMethod === 'cod' ? (
                        <span className="px-2.5 py-1 rounded-md bg-neutral-100 text-neutral-900 border border-neutral-300 font-bold">عند الاستلام</span>
                      ) : o.paymentMethod === 'instapay' ? (
                        <span className="px-2.5 py-1 rounded-md bg-purple-100 text-purple-950 border border-purple-300 font-bold">انستاباي ⚡</span>
                      ) : o.paymentMethod === 'vodafone_cash' ? (
                        <span className="px-2.5 py-1 rounded-md bg-red-100 text-red-950 border border-red-300 font-bold">فودافون كاش 📱</span>
                      ) : (
                        o.paymentMethod
                      )}
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
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
                        {o.status}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => openOrderModal(o)}
                        className="px-3.5 py-1.5 rounded-xl bg-amber-50 hover:bg-[#C49A45] text-amber-950 hover:text-black border border-amber-300 transition-colors font-black shadow-sm"
                      >
                        عرض وإدارة
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Single Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-[#141414] border border-[#C49A45]/30 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-[#C49A45]" />
                  <span>تفاصيل الطلب: {selectedOrder.orderNumber}</span>
                </h2>
                <span className="text-xs text-gray-400">
                  تاريخ التسجيل: {formatDate(selectedOrder.createdAt, 'ar')}
                </span>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer & Address Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-white/5 text-xs">
              <div>
                <span className="text-gray-400 block mb-1">بيانات العميل:</span>
                <p className="font-bold text-white text-sm">{selectedOrder.customerName}</p>
                <p className="text-gray-300 mt-0.5">{selectedOrder.customerPhone}</p>
                <p className="text-gray-300">{selectedOrder.customerEmail}</p>
              </div>
              <div>
                <span className="text-gray-400 block mb-1">عنوان التوصيل:</span>
                <p className="font-bold text-white">{selectedOrder.shippingCity}</p>
                <p className="text-gray-300">{selectedOrder.shippingAddress}</p>
                <div className="mt-2 pt-2 border-t border-white/10">
                  <span className="text-gray-400 block mb-0.5">طريقة الدفع:</span>
                  <span className="font-bold text-[#DFC27A]">
                    {selectedOrder.paymentMethod === 'cod'
                      ? 'الدفع عند الاستلام'
                      : selectedOrder.paymentMethod === 'instapay'
                      ? 'تحويل عبر انستاباي (InstaPay)'
                      : selectedOrder.paymentMethod === 'vodafone_cash'
                      ? 'تحويل عبر محفظة فودافون كاش'
                      : selectedOrder.paymentMethod}
                  </span>
                </div>
                {selectedOrder.customerNotes && (
                  <p className="text-amber-300 mt-2 p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 leading-relaxed">
                    {selectedOrder.customerNotes}
                  </p>
                )}
              </div>
            </div>

            {/* Items Ordered List */}
            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-white">المنتجات المطلوبة:</h4>
              <div className="divide-y divide-white/5 border border-white/5 rounded-2xl overflow-hidden">
                {selectedOrder.items?.map((item) => (
                  <div key={item.id} className="p-3 flex items-center justify-between">
                    <div>
                      <h5 className="font-bold text-white">{item.productNameAr}</h5>
                      <span className="text-gray-400">
                        الحجم: {item.sizeMl} مل | العدد: {item.quantity}
                      </span>
                    </div>
                    <span className="font-bold text-[#DFC27A]">
                      {formatPrice(item.totalPrice, 'ar')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial summary */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2 text-xs">
              <div className="flex justify-between text-gray-300">
                <span>المجموع الفرعي:</span>
                <span>{formatPrice(selectedOrder.subtotal, 'ar')}</span>
              </div>
              {selectedOrder.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400 font-bold">
                  <span>خصم الكوبون ({selectedOrder.couponCode}):</span>
                  <span>-{formatPrice(selectedOrder.discountAmount, 'ar')}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-300">
                <span>الشحن:</span>
                <span>{formatPrice(selectedOrder.shippingCost, 'ar')}</span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-white pt-2 border-t border-white/10">
                <span>المجموع الإجمالي:</span>
                <span className="text-[#DFC27A] text-base">
                  {formatPrice(selectedOrder.totalAmount, 'ar')}
                </span>
              </div>
            </div>

            {/* Status Update Form */}
            <form onSubmit={handleUpdateStatus} className="space-y-4 pt-2 border-t border-white/10 text-xs">
              <h4 className="font-bold text-white text-sm">تحديث حالة الطلب والدفع:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-gray-300">حالة الطلب الحالية</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#C49A45]"
                  >
                    <option value="PENDING">PENDING (بانتظار التأكيد)</option>
                    <option value="PROCESSING">PROCESSING (قيد التجهيز والتغليف)</option>
                    <option value="SHIPPED">SHIPPED (خرج مع المندوب للشحن)</option>
                    <option value="DELIVERED">DELIVERED (تم التوصيل للعميل)</option>
                    <option value="CANCELLED">CANCELLED (ملغي)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-gray-300">حالة الدفع</label>
                  <select
                    value={newPaymentStatus}
                    onChange={(e) => setNewPaymentStatus(e.target.value)}
                    className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#C49A45]"
                  >
                    <option value="PENDING">PENDING (معلق / عند الاستلام)</option>
                    <option value="PAID">PAID (مدفوع ومؤكد)</option>
                    <option value="FAILED">FAILED (فشل الدفع)</option>
                    <option value="REFUNDED">REFUNDED (مسترجع)</option>
                  </select>
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-gray-300">ملاحظات الإدارة الداخلية</label>
                  <input
                    type="text"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="تم تسليم الشحنة لمندوب سمسا رقم..."
                    className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-3">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4 text-[#C49A45]" />
                  <span>طباعة بوليصة الشحن</span>
                </button>

                <button
                  type="submit"
                  disabled={updating}
                  className="gold-button px-6 py-2.5 rounded-xl font-bold"
                >
                  {updating ? 'جاري الحفظ...' : 'حفظ التحديثات'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
