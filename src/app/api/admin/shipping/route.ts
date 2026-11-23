import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const shippingMethods = await prisma.shippingMethod.findMany({
      orderBy: { sortOrder: 'asc' },
    });
    return NextResponse.json({ shippingMethods });
  } catch (error) {
    return NextResponse.json({ error: 'حدث خطأ أثناء جلب طرق الشحن' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'ADMIN' && user.role !== 'MANAGER')) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const body = await request.json();
    const { nameAr, nameEn, cost, estimatedDays, freeShippingAbove, isActive } = body;

    const created = await prisma.shippingMethod.create({
      data: {
        nameAr,
        nameEn,
        cost: parseFloat(cost) || 0,
        estimatedDays,
        freeShippingAbove: freeShippingAbove ? parseFloat(freeShippingAbove) : null,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
    });

    return NextResponse.json({ success: true, shippingMethod: created });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'فشل إضافة طريقة الشحن' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'ADMIN' && user.role !== 'MANAGER')) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const body = await request.json();
    const { id, nameAr, nameEn, cost, estimatedDays, freeShippingAbove, isActive } = body;

    const updated = await prisma.shippingMethod.update({
      where: { id },
      data: {
        nameAr,
        nameEn,
        cost: parseFloat(cost),
        estimatedDays,
        freeShippingAbove: freeShippingAbove ? parseFloat(freeShippingAbove) : null,
        isActive: isActive !== undefined ? Boolean(isActive) : undefined,
      },
    });

    return NextResponse.json({ success: true, shippingMethod: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'فشل تحديث طريقة الشحن' }, { status: 500 });
  }
}
