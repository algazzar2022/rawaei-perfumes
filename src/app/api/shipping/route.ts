import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const shippingMethods = await prisma.shippingMethod.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        nameAr: true,
        nameEn: true,
        cost: true,
        freeShippingAbove: true,
        estimatedDays: true,
      },
    });

    return NextResponse.json({ success: true, shippingMethods });
  } catch (error) {
    return NextResponse.json({ error: 'فشل جلب محافظات الشحن' }, { status: 500 });
  }
}
