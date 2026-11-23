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
        <h1 className="text-2xl font-black text-black">إدارة العملاء والزبائن</h1>
      </div>

      <div className="bg-white rounded-3xl border border-[#DFC27A]/40 overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-right">
            <thead className="bg-[#FAF6EE] border-b-2 border-[#DFC27A]/30 text-black">
              <tr>
                <th className="p-4 font-black text-black">اسم العميل</th>
                <th className="p-4 font-black text-black">رقم الجوال</th>
                <th className="p-4 font-black text-black">البريد الإلكتروني</th>
                <th className="p-4 font-black text-black">المدينة</th>
                <th className="p-4 font-black text-black text-center">عدد الطلبات</th>
                <th className="p-4 font-black text-black">إجمالي المشتريات</th>
                <th className="p-4 font-black text-black">تاريخ التسجيل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DFC27A]/15 text-black">
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-500 font-bold">
                    لا يوجد عملاء مسجلين بعد. عند إتمام أول عملية شراء سيتم حفظ بيانات العميل هنا تلقائياً.
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id} className="hover:bg-[#FAF8F5] transition-colors">
                    <td className="p-4 font-black text-black text-sm">{c.name}</td>
                    <td className="p-4 text-neutral-700 font-mono font-bold" dir="ltr">
                      {c.phone}
                    </td>
                    <td className="p-4 text-neutral-600 font-bold">{c.email}</td>
                    <td className="p-4 text-neutral-800 font-bold">{c.city || '-'}</td>
                    <td className="p-4 text-center">
                      <span className="inline-block px-3 py-1 rounded-full bg-[#FAF6EE] border border-[#DFC27A]/40 font-black text-black text-xs">
                        {c.totalOrders} {c.totalOrders === 1 ? 'طلب' : 'طلبات'}
                      </span>
                    </td>
                    <td className="p-4 font-black text-black text-sm">
                      {formatPrice(c.totalSpent, 'ar')}
                    </td>
                    <td className="p-4 text-neutral-600 font-semibold">{formatDate(c.createdAt, 'ar')}</td>
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
