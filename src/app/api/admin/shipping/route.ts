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
    return NextResponse.json({ error: 'حدث خطأ أثناء جلب طرق ومحافظات الشحن' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'ADMIN' && user.role !== 'STAFF')) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const body = await request.json();
    const { nameAr, nameEn, cost, estimatedDays, freeShippingAbove, isActive, sortOrder } = body;

    const created = await prisma.shippingMethod.create({
      data: {
        nameAr,
        nameEn: nameEn || nameAr,
        cost: parseFloat(cost) || 0,
        estimatedDays: estimatedDays || '2-4 أيام عمل',
        freeShippingAbove: freeShippingAbove !== null && freeShippingAbove !== '' ? parseFloat(freeShippingAbove) : null,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        sortOrder: parseInt(sortOrder) || 99,
      },
    });

    return NextResponse.json({ success: true, shippingMethod: created });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'فشل إضافة المحافظة' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'ADMIN' && user.role !== 'STAFF')) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const body = await request.json();

    // 1. Bulk update for all governorates free shipping threshold
    if (body.bulkFreeShippingAbove !== undefined) {
      const threshold = parseFloat(body.bulkFreeShippingAbove) || 800;
      await prisma.shippingMethod.updateMany({
        data: {
          freeShippingAbove: threshold,
        },
      });
      const updatedList = await prisma.shippingMethod.findMany({ orderBy: { sortOrder: 'asc' } });
      return NextResponse.json({ success: true, shippingMethods: updatedList });
    }

    // 2. Batch update multiple governorates
    if (Array.isArray(body.items)) {
      const updates = body.items.map((item: any) =>
        prisma.shippingMethod.update({
          where: { id: item.id },
          data: {
            cost: parseFloat(item.cost) || 0,
            freeShippingAbove: item.freeShippingAbove !== null && item.freeShippingAbove !== '' ? parseFloat(item.freeShippingAbove) : null,
            estimatedDays: item.estimatedDays,
            isActive: item.isActive !== undefined ? Boolean(item.isActive) : undefined,
            nameAr: item.nameAr || undefined,
            nameEn: item.nameEn || undefined,
          },
        })
      );

      await prisma.$transaction(updates);
      const updatedList = await prisma.shippingMethod.findMany({ orderBy: { sortOrder: 'asc' } });
      return NextResponse.json({ success: true, shippingMethods: updatedList });
    }

    // 3. Single governorate update
    const { id, nameAr, nameEn, cost, estimatedDays, freeShippingAbove, isActive } = body;
    if (!id) {
      return NextResponse.json({ error: 'معرف المحافظة مطلوب' }, { status: 400 });
    }

    const updated = await prisma.shippingMethod.update({
      where: { id },
      data: {
        cost: parseFloat(cost) || 0,
        estimatedDays: estimatedDays !== undefined ? estimatedDays : undefined,
        freeShippingAbove: freeShippingAbove !== null && freeShippingAbove !== '' ? parseFloat(freeShippingAbove) : null,
        isActive: isActive !== undefined ? Boolean(isActive) : undefined,
        nameAr: nameAr || undefined,
        nameEn: nameEn || undefined,
      },
    });

    return NextResponse.json({ success: true, shippingMethod: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'فشل تحديث أسعار الشحن' }, { status: 500 });
  }
}
