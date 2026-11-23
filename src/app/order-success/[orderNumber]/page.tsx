import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CheckCircle2, Package, Printer, Home, ShieldCheck } from 'lucide-react';
import prisma from '@/lib/prisma';
import { formatPrice, formatDate } from '@/lib/utils';
import PrintButton from '@/components/orders/PrintButton';

export const revalidate = 0;

export default async function OrderSuccessPage({
  params,
}: {
  params: { orderNumber: string };
}) {
  const { orderNumber } = params;

  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: { where: { isMain: true } },
            },
          },
        },
      },
    },
  });

  if (!order) {
    notFound();
  }

  return (
    <div className="min-h-screen py-16 bg-[#F8F5EF]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Celebration Banner */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#C49A45]/30 text-center space-y-4 mb-8 shadow-sm">
          <div className="w-20 h-20 rounded-full bg-emerald-100 border-2 border-emerald-500 mx-auto flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <span className="inline-block px-4 py-1.5 rounded-full bg-[#C49A45]/15 text-[#98702B] text-xs font-bold border border-[#C49A45]/30">
            تم استلام وتأكيد طلبك بنجاح
          </span>

          <h1 className="text-2xl sm:text-4xl font-black text-[#171717]">
            شكراً لثقتكم بمتجر روائع للعطور
          </h1>

          <p className="text-sm text-neutral-600 max-w-lg mx-auto">
            سعداء باختياركم لنا. تم تسجيل طلبكم وسيقوم فريقنا بتجهيز شحنتكم وتغليفها بعناية ملكية وإرسالها لكم بأسرع وقت.
          </p>

          <div className="pt-2">
            <div className="inline-flex items-center gap-2 bg-[#FAF7F2] border border-[#C49A45]/30 px-5 py-2.5 rounded-2xl">
              <span className="text-xs text-neutral-500 font-medium">رقم تتبع الطلب:</span>
              <span className="text-sm font-mono font-black text-[#98702B]">
                {order.orderNumber}
              </span>
            </div>
          </div>
        </div>

        {/* Invoice Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#C49A45]/25 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#C49A45]/15 pb-5">
            <div>
              <h3 className="text-base font-bold text-[#171717] flex items-center gap-2">
                <Package className="w-5 h-5 text-[#C49A45]" />
                <span>تفاصيل الفاتورة الرسمية</span>
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                تاريخ الطلب: {formatDate(order.createdAt, 'ar')}
              </p>
            </div>

            <PrintButton />
          </div>

          {/* Customer & Shipping summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-[#FAF7F2] p-4 rounded-2xl border border-[#C49A45]/15">
            <div>
              <span className="text-neutral-500 block mb-1 font-medium">العميل المستلم:</span>
              <p className="font-bold text-[#171717] text-sm">{order.customerName}</p>
              <p className="text-neutral-600">{order.customerPhone}</p>
              <p className="text-neutral-600">{order.customerEmail}</p>
            </div>
            <div>
              <span className="text-neutral-500 block mb-1 font-medium">عنوان التوصيل:</span>
              <p className="font-bold text-[#171717]">{order.shippingCity}</p>
              <p className="text-neutral-600">{order.shippingAddress}</p>
              <p className="text-[#98702B] font-bold mt-1">
                طريقة الدفع:{' '}
                {order.paymentMethod === 'vodafone_cash'
                  ? 'تحويل عبر محفظة فودافون كاش'
                  : 'تحويل عبر تطبيق انستاباي (InstaPay)'}
              </p>
              {order.customerNotes && (
                <p className="text-[11px] text-neutral-500 mt-1.5 bg-white/80 p-2 rounded-lg border border-[#C49A45]/20">
                  {order.customerNotes}
                </p>
              )}
            </div>
          </div>

          {/* Items breakdown */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-neutral-800">المنتجات المطلوبة:</h4>
            <div className="divide-y divide-[#C49A45]/15 border border-[#C49A45]/15 rounded-2xl overflow-hidden">
              {order.items.map((item) => (
                <div key={item.id} className="p-3.5 flex items-center justify-between text-xs bg-[#FAF7F2]/50">
                  <div>
                    <h5 className="font-bold text-[#171717]">{item.productNameAr}</h5>
                    <span className="text-neutral-500">
                      الحجم: {item.sizeMl} مل | الكمية: {item.quantity}
                    </span>
                  </div>
                  <span className="font-black text-[#98702B]">
                    {formatPrice(item.totalPrice, 'ar')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="space-y-2 text-xs pt-4 border-t border-[#C49A45]/15">
            <div className="flex justify-between text-neutral-600 font-medium">
              <span>المجموع الفرعي:</span>
              <span>{formatPrice(order.subtotal, 'ar')}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600 font-bold">
                <span>خصم الكوبون ({order.couponCode}):</span>
                <span>-{formatPrice(order.discountAmount, 'ar')}</span>
              </div>
            )}
            <div className="flex justify-between text-neutral-600 font-medium">
              <span>الشحن والتوصيل:</span>
              <span>
                {order.shippingCost === 0 ? 'مجاناً' : formatPrice(order.shippingCost, 'ar')}
              </span>
            </div>
            <div className="flex justify-between text-base font-black text-[#171717] pt-2 border-t border-[#C49A45]/20">
              <span>المجموع الإجمالي:</span>
              <span className="text-[#98702B] text-lg font-black">
                {formatPrice(order.totalAmount, 'ar')}
              </span>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-center gap-4">
            <Link
              href="/"
              className="gold-button px-8 py-3 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md"
            >
              <Home className="w-4 h-4" />
              <span>العودة للصفحة الرئيسية</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
