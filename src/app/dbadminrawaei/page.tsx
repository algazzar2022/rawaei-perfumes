import React from 'react';
import Link from 'next/link';
import {
  DollarSign,
  ShoppingBag,
  Package,
  Users,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  Clock,
  CheckCircle,
  Truck,
  Sparkles,
} from 'lucide-react';
import prisma from '@/lib/prisma';
import { formatPrice, formatDate } from '@/lib/utils';

export const revalidate = 0;

export default async function AdminDashboardPage() {
  // Fetch real statistics from database
  const orders = await prisma.order.findMany({
    select: {
      id: true,
      orderNumber: true,
      customerName: true,
      totalAmount: true,
      status: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  const totalOrders = orders.length;
  const totalSales = orders
    .filter((o) => o.status !== 'CANCELLED')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const totalProducts = await prisma.product.count({ where: { isActive: true } });
  const totalCustomers = await prisma.customer.count();

  const lowStockProducts = await prisma.product.findMany({
    where: { stock: { lte: 10 }, isActive: true },
    select: { id: true, nameAr: true, stock: true, sku: true, price: true },
    take: 5,
  });

  const recentOrders = orders.slice(0, 6);

  const pendingOrders = orders.filter((o) => o.status === 'PENDING').length;
  const processingOrders = orders.filter((o) => o.status === 'PROCESSING').length;
  const shippedOrders = orders.filter((o) => o.status === 'SHIPPED').length;
  const deliveredOrders = orders.filter((o) => o.status === 'DELIVERED').length;

  return (
    <div className="space-y-8">
      {/* Top Banner Greeting */}
      <div className="p-6 sm:p-8 rounded-3xl glass-card border border-[#C49A45]/30 relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative z-10 space-y-1.5">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-[#DFC27A]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>نظام روائع للعطور – لوحة القيادة المركزية</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            مرحباً بك في إدارة المتجر
          </h1>
          <p className="text-xs sm:text-sm text-gray-400">
            تابع مبيعاتك، مخزون العطور الفاخرة، وحالات الشحن والطلبات بصورة حية ولحظية.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <Link
            href="/dbadminrawaei/products"
            className="gold-button px-5 py-2.5 rounded-xl text-xs font-bold shadow-gold-glow"
          >
            + إضافة عطر جديد
          </Link>
          <Link
            href="/dbadminrawaei/banners"
            className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white transition-colors"
          >
            إدارة البانرات
          </Link>
        </div>

        {/* Ambient background glow */}
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-[#C49A45]/10 rounded-full blur-[90px] pointer-events-none" />
      </div>

      {/* 4 Core Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Sales */}
        <div className="glass-card rounded-2xl p-6 border border-[#C49A45]/20 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400">إجمالي المبيعات</span>
            <div className="w-10 h-10 rounded-xl bg-[#C49A45]/15 text-[#DFC27A] flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#DFC27A]">
            {formatPrice(totalSales, 'ar')}
          </div>
          <p className="text-[11px] text-gray-400">من كافة الطلبات المؤكدة</p>
        </div>

        {/* Total Orders */}
        <div className="glass-card rounded-2xl p-6 border border-[#C49A45]/20 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400">إجمالي الطلبات</span>
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">{totalOrders}</div>
          <p className="text-[11px] text-gray-400">
            {pendingOrders} طلبات بانتظار المراجعة
          </p>
        </div>

        {/* Active Products */}
        <div className="glass-card rounded-2xl p-6 border border-[#C49A45]/20 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400">المنتجات النشطة</span>
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">{totalProducts}</div>
          <p className="text-[11px] text-gray-400">عطور ودهن عود ومجموعات</p>
        </div>

        {/* Total Customers */}
        <div className="glass-card rounded-2xl p-6 border border-[#C49A45]/20 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400">إجمالي العملاء</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">{totalCustomers}</div>
          <p className="text-[11px] text-gray-400">عملاء مسجلين ومشتريين</p>
        </div>
      </div>

      {/* Orders Status Breakdown Badges */}
      <div className="glass-card rounded-2xl p-5 border border-white/5">
        <h3 className="text-xs font-bold text-gray-400 mb-3">حالات الطلبات الحالية:</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
            <span className="text-amber-300 font-semibold">بانتظار التأكيد:</span>
            <span className="font-bold text-white text-base">{pendingOrders}</span>
          </div>
          <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-between">
            <span className="text-blue-300 font-semibold">قيد التجهيز:</span>
            <span className="font-bold text-white text-base">{processingOrders}</span>
          </div>
          <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-between">
            <span className="text-purple-300 font-semibold">خرج للشحن:</span>
            <span className="font-bold text-white text-base">{shippedOrders}</span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
            <span className="text-emerald-300 font-semibold">تم التوصيل بنجاح:</span>
            <span className="font-bold text-white text-base">{deliveredOrders}</span>
          </div>
        </div>
      </div>

      {/* Two Columns: Recent Orders & Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders (2 cols) */}
        <div className="lg:col-span-2 glass-card rounded-3xl p-6 border border-[#C49A45]/20 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-[#C49A45]" />
              <span>أحدث الطلبات الواردة</span>
            </h3>
            <Link
              href="/dbadminrawaei/orders"
              className="text-xs text-[#DFC27A] hover:underline"
            >
              عرض جميع الطلبات ←
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <p className="text-xs text-gray-400 py-8 text-center">
              لا توجد طلبات مسجلة بعد. عند إتمام أول طلب سيظهر هنا مباشرة!
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-right">
                <thead>
                  <tr className="border-b border-white/5 text-gray-400">
                    <th className="py-2.5 font-semibold">رقم الطلب</th>
                    <th className="py-2.5 font-semibold">العميل</th>
                    <th className="py-2.5 font-semibold">التاريخ</th>
                    <th className="py-2.5 font-semibold">المبلغ</th>
                    <th className="py-2.5 font-semibold">الحالة</th>
                    <th className="py-2.5 font-semibold">إجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-gray-200">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 font-mono font-bold text-[#DFC27A]">
                        {order.orderNumber}
                      </td>
                      <td className="py-3 font-medium text-white">{order.customerName}</td>
                      <td className="py-3 text-gray-400">{formatDate(order.createdAt, 'ar')}</td>
                      <td className="py-3 font-bold">{formatPrice(order.totalAmount, 'ar')}</td>
                      <td className="py-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            order.status === 'DELIVERED'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : order.status === 'SHIPPED'
                              ? 'bg-blue-500/20 text-blue-300'
                              : order.status === 'PROCESSING'
                              ? 'bg-purple-500/20 text-purple-300'
                              : order.status === 'CANCELLED'
                              ? 'bg-red-500/20 text-red-300'
                              : 'bg-amber-500/20 text-amber-300'
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3">
                        <Link
                          href={`/dbadminrawaei/orders?order=${order.orderNumber}`}
                          className="text-[#DFC27A] hover:underline"
                        >
                          عرض التفاصيل
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Low Stock Alerts (1 col) */}
        <div className="glass-card rounded-3xl p-6 border border-[#C49A45]/20 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>تنبيهات انخفاض المخزون</span>
            </h3>
            <Link
              href="/dbadminrawaei/inventory"
              className="text-xs text-[#DFC27A] hover:underline"
            >
              المستودع ←
            </Link>
          </div>

          {lowStockProducts.length === 0 ? (
            <p className="text-xs text-gray-400 py-8 text-center">
              جميع المنتجات تتمتع بمخزون كافٍ ومثالي.
            </p>
          ) : (
            <div className="space-y-3">
              {lowStockProducts.map((p) => (
                <div
                  key={p.id}
                  className="p-3 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between text-xs"
                >
                  <div>
                    <h4 className="font-bold text-white line-clamp-1">{p.nameAr}</h4>
                    <span className="text-[11px] text-gray-400">SKU: {p.sku}</span>
                  </div>
                  <div className="text-left">
                    <span className="px-2.5 py-1 rounded-full bg-red-500/20 text-red-300 font-black text-xs block">
                      باقي {p.stock}
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
