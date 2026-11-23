import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { code, orderSubtotal } = await request.json();

    if (!code) {
      return NextResponse.json({ error: 'يرجى إدخال كود الكوبون' }, { status: 400 });
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase().trim() },
    });

    if (!coupon) {
      return NextResponse.json({ error: 'كود الخصم غير موجود' }, { status: 404 });
    }

    if (!coupon.isActive) {
      return NextResponse.json({ error: 'كود الخصم غير مفعل حالياً' }, { status: 400 });
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return NextResponse.json({ error: 'كود الخصم منتهي الصلاحية' }, { status: 400 });
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json({ error: 'تم استنفاد الحد الأقصى لاستخدام هذا الكود' }, { status: 400 });
    }

    if (coupon.minOrderValue && orderSubtotal < coupon.minOrderValue) {
      return NextResponse.json(
        {
          error: `الحد الأدنى للطلب لتفعيل هذا الكوبون هو ${coupon.minOrderValue} ر.س`,
        },
        { status: 400 }
      );
    }

    let discountAmount = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      discountAmount = (orderSubtotal * coupon.discountValue) / 100;
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else {
      discountAmount = coupon.discountValue;
    }

    return NextResponse.json({
      success: true,
      message: `تم تطبيق كود الخصم (${coupon.code}) بنجاح!`,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        minOrderValue: coupon.minOrderValue,
        maxDiscount: coupon.maxDiscount,
        calculatedDiscount: discountAmount,
      },
    });
  } catch (error) {
    console.error('Coupon validation error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء فحص كود الخصم' },
      { status: 500 }
    );
  }
}
