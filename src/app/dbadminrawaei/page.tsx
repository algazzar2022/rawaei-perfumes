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
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-l from-[#FAF6EE] via-white to-[#F5ECE0] border border-[#DFC27A]/50 shadow-sm relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative z-10 space-y-1.5">
          <div className="inline-flex items-center gap-2 text-xs font-black text-black">
            <Sparkles className="w-4 h-4 text-[#98702B]" />
            <span>نظام روائع للعطور – لوحة القيادة المركزية</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-black">
            مرحباً بك في إدارة المتجر
          </h1>
          <p className="text-xs sm:text-sm text-black font-medium">
            تابع مبيعاتك، مخزون العطور الفاخرة، وحالات الشحن والطلبات بصورة حية ولحظية.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <Link
            href="/dbadminrawaei/products"
            className="gold-button px-5 py-2.5 rounded-xl text-xs font-black text-black shadow-md hover:brightness-105 transition-all"
          >
            + إضافة عطر جديد
          </Link>
          <Link
            href="/dbadminrawaei/banners"
            className="px-5 py-2.5 rounded-xl bg-white hover:bg-[#FAF6EE] border border-[#DFC27A]/40 text-xs font-black text-black shadow-sm transition-colors"
          >
            إدارة البانرات
          </Link>
        </div>

        {/* Ambient background glow */}
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-[#C49A45]/15 rounded-full blur-[90px] pointer-events-none" />
      </div>

      {/* 4 Core Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Sales */}
        <div className="bg-white rounded-2xl p-6 border border-[#DFC27A]/30 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-black">إجمالي المبيعات</span>
            <div className="w-10 h-10 rounded-xl bg-[#C49A45]/15 text-black flex items-center justify-center font-bold">
              <DollarSign className="w-5 h-5 text-black" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-black">
            {formatPrice(totalSales, 'ar')}
          </div>
          <p className="text-[11px] text-black font-medium">من كافة الطلبات المؤكدة</p>
        </div>

        {/* Total Orders */}
        <div className="bg-white rounded-2xl p-6 border border-[#DFC27A]/30 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-black">إجمالي الطلبات</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-black flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-black" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-black">{totalOrders}</div>
          <p className="text-[11px] text-black font-medium">
            {pendingOrders} طلبات بانتظار المراجعة
          </p>
        </div>

        {/* Active Products */}
        <div className="bg-white rounded-2xl p-6 border border-[#DFC27A]/30 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-black">المنتجات النشطة</span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-black flex items-center justify-center">
              <Package className="w-5 h-5 text-black" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-black">{totalProducts}</div>
          <p className="text-[11px] text-black font-medium">عطور ودهن عود ومجموعات</p>
        </div>

        {/* Total Customers */}
        <div className="bg-white rounded-2xl p-6 border border-[#DFC27A]/30 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-black">إجمالي العملاء</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-black flex items-center justify-center">
              <Users className="w-5 h-5 text-black" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-black">{totalCustomers}</div>
          <p className="text-[11px] text-black font-medium">عملاء مسجلين ومشتريين</p>
        </div>
      </div>

      {/* Orders Status Breakdown Badges */}
      <div className="bg-white rounded-2xl p-5 border border-[#DFC27A]/30 shadow-sm">
        <h3 className="text-xs font-black text-black mb-3">حالات الطلبات الحالية:</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/70 flex items-center justify-between">
            <span className="text-black font-bold">بانتظار التأكيد:</span>
            <span className="font-black text-black text-base">{pendingOrders}</span>
          </div>
          <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200/70 flex items-center justify-between">
            <span className="text-black font-bold">قيد التجهيز:</span>
            <span className="font-black text-black text-base">{processingOrders}</span>
          </div>
          <div className="p-3.5 rounded-xl bg-purple-50/80 border border-purple-200/70 flex items-center justify-between">
            <span className="text-black font-bold">خرج للشحن:</span>
            <span className="font-black text-black text-base">{shippedOrders}</span>
          </div>
          <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200/70 flex items-center justify-between">
            <span className="text-black font-bold">تم التوصيل بنجاح:</span>
            <span className="font-black text-black text-base">{deliveredOrders}</span>
          </div>
        </div>
      </div>

      {/* Two Columns: Recent Orders & Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-[#DFC27A]/30 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#DFC27A]/20 pb-4">
            <h3 className="text-base font-black text-black flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-black" />
              <span>أحدث الطلبات الواردة</span>
            </h3>
            <Link
              href="/dbadminrawaei/orders"
              className="text-xs font-black text-black hover:underline"
            >
              عرض جميع الطلبات ←
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <p className="text-xs text-black font-medium py-8 text-center">
              لا توجد طلبات مسجلة بعد. عند إتمام أول طلب سيظهر هنا مباشرة!
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-right">
                <thead>
                  <tr className="border-b border-[#DFC27A]/20 text-black">
                    <th className="py-3 px-2 font-black text-black">رقم الطلب</th>
                    <th className="py-3 px-2 font-black text-black">العميل</th>
                    <th className="py-3 px-2 font-black text-black">التاريخ</th>
                    <th className="py-3 px-2 font-black text-black">المبلغ</th>
                    <th className="py-3 px-2 font-black text-black">الحالة</th>
                    <th className="py-3 px-2 font-black text-black">إجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DFC27A]/15 text-black">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-[#FAF8F5] transition-colors">
                      <td className="py-3.5 px-2 font-mono font-bold text-black">
                        {order.orderNumber}
                      </td>
                      <td className="py-3.5 px-2 font-bold text-black">{order.customerName}</td>
                      <td className="py-3.5 px-2 text-black font-medium">{formatDate(order.createdAt, 'ar')}</td>
                      <td className="py-3.5 px-2 font-black text-black">{formatPrice(order.totalAmount, 'ar')}</td>
                      <td className="py-3.5 px-2">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                            order.status === 'DELIVERED'
                              ? 'bg-emerald-100 text-emerald-950 border border-emerald-300'
                              : order.status === 'SHIPPED'
                              ? 'bg-blue-100 text-blue-950 border border-blue-300'
                              : order.status === 'PROCESSING'
                              ? 'bg-purple-100 text-purple-950 border border-purple-300'
                              : order.status === 'CANCELLED'
                              ? 'bg-red-100 text-red-950 border border-red-300'
                              : 'bg-amber-100 text-amber-950 border border-amber-300'
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-2">
                        <Link
                          href={`/dbadminrawaei/orders?order=${order.orderNumber}`}
                          className="text-black font-black hover:underline"
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
        <div className="bg-white rounded-3xl p-6 border border-[#DFC27A]/30 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#DFC27A]/20 pb-4">
            <h3 className="text-base font-black text-black flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <span>تنبيهات انخفاض المخزون</span>
            </h3>
            <Link
              href="/dbadminrawaei/inventory"
              className="text-xs font-black text-black hover:underline"
            >
              المستودع ←
            </Link>
          </div>

          {lowStockProducts.length === 0 ? (
            <p className="text-xs text-black font-medium py-8 text-center">
              جميع المنتجات تتمتع بمخزون كافٍ ومثالي.
            </p>
          ) : (
            <div className="space-y-3">
              {lowStockProducts.map((p) => (
                <div
                  key={p.id}
                  className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#DFC27A]/25 flex items-center justify-between text-xs"
                >
                  <div>
                    <h4 className="font-black text-black line-clamp-1">{p.nameAr}</h4>
                    <span className="text-[11px] text-black font-medium">SKU: {p.sku}</span>
                  </div>
                  <div className="text-left">
                    <span className="px-2.5 py-1 rounded-full bg-red-100 border border-red-300 text-red-900 font-black text-xs block">
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
