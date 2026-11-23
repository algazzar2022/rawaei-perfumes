import React from 'react';
import prisma from '@/lib/prisma';
import { Users, Mail, Phone, MapPin, DollarSign, ShoppingBag } from 'lucide-react';
import { formatPrice, formatDate } from '@/lib/utils';

export const revalidate = 0;

export default async function AdminCustomersPage() {
  const customers = await prisma.customer.findMany({
    orderBy: { totalSpent: 'desc' },
    include: {
      orders: {
        select: { id: true, orderNumber: true, totalAmount: true, status: true },
      },
    },
  });

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-black text-white">إدارة العملاء والزبائن</h1>
        <p className="text-xs text-gray-400 mt-1">
          قائمة العملاء، إجمالي مشترياتهم، وعدد طلباتهم في متجر روائع للعطور
        </p>
      </div>

      <div className="glass-card rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-right">
            <thead className="bg-[#151515] border-b border-white/5 text-gray-400">
              <tr>
                <th className="p-4 font-semibold">اسم العميل</th>
                <th className="p-4 font-semibold">رقم الجوال</th>
                <th className="p-4 font-semibold">البريد الإلكتروني</th>
                <th className="p-4 font-semibold">المدينة</th>
                <th className="p-4 font-semibold">عدد الطلبات</th>
                <th className="p-4 font-semibold">إجمالي المشتريات</th>
                <th className="p-4 font-semibold">تاريخ التسجيل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-gray-200">
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    لا يوجد عملاء مسجلين بعد. عند إتمام أول عملية شراء سيتم حفظ بيانات العميل هنا تلقائياً.
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 font-bold text-white text-sm">{c.name}</td>
                    <td className="p-4 text-gray-300 font-mono" dir="ltr">
                      {c.phone}
                    </td>
                    <td className="p-4 text-gray-400">{c.email}</td>
                    <td className="p-4 text-gray-300">{c.city || '-'}</td>
                    <td className="p-4 font-bold text-white">
                      {c.totalOrders} {c.totalOrders === 1 ? 'طلب' : 'طلبات'}
                    </td>
                    <td className="p-4 font-black text-[#DFC27A] text-sm">
                      {formatPrice(c.totalSpent, 'ar')}
                    </td>
                    <td className="p-4 text-gray-400">{formatDate(c.createdAt, 'ar')}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
