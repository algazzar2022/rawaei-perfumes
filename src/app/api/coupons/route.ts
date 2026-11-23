import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ coupons });
  } catch (error) {
    return NextResponse.json({ error: 'حدث خطأ أثناء جلب الكوبونات' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'ADMIN' && user.role !== 'MANAGER')) {
      return NextResponse.json({ error: 'غير مصرح لك بإضافة كوبونات' }, { status: 401 });
    }

    const body = await request.json();
    const { code, discountType, discountValue, minOrderValue, maxDiscount, usageLimit, expiresAt, isActive } = body;

    if (!code || !discountValue) {
      return NextResponse.json({ error: 'يرجى إدخال كود الكوبون وقيمة الخصم' }, { status: 400 });
    }

    const created = await prisma.coupon.create({
      data: {
        code: code.toUpperCase().trim(),
        discountType: discountType || 'PERCENTAGE',
        discountValue: parseFloat(discountValue),
        minOrderValue: minOrderValue ? parseFloat(minOrderValue) : 0,
        maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
        usageLimit: usageLimit ? parseInt(usageLimit) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
    });

    return NextResponse.json({ success: true, coupon: created });
  } catch (error: any) {
    console.error('Coupon create error:', error);
    return NextResponse.json({ error: error.message || 'فشل إضافة الكوبون' }, { status: 500 });
  }
}
