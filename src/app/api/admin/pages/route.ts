import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const pages = await prisma.page.findMany({
      orderBy: { slug: 'asc' },
    });
    return NextResponse.json({ pages });
  } catch (error) {
    return NextResponse.json({ error: 'حدث خطأ أثناء جلب الصفحات' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'ADMIN' && user.role !== 'MANAGER')) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const body = await request.json();
    const { slug, titleAr, titleEn, contentAr, contentEn, metaTitle, metaDesc, isActive } = body;

    const page = await prisma.page.upsert({
      where: { slug },
      update: {
        titleAr,
        titleEn,
        contentAr,
        contentEn,
        metaTitle,
        metaDesc,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
      create: {
        slug,
        titleAr,
        titleEn,
        contentAr,
        contentEn,
        metaTitle,
        metaDesc,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
    });

    return NextResponse.json({ success: true, page });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'فشل تحديث الصفحة' }, { status: 500 });
  }
}
