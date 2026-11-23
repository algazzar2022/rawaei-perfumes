import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Categories fetch error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب التصنيفات' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'ADMIN' && user.role !== 'MANAGER')) {
      return NextResponse.json({ error: 'غير مصرح لك بإضافة تصنيفات' }, { status: 401 });
    }

    const body = await request.json();
    const { nameAr, nameEn, slug, descriptionAr, descriptionEn, image, icon, sortOrder, isActive } = body;

    if (!nameAr || !nameEn || !slug) {
      return NextResponse.json(
        { error: 'يرجى إدخال اسم التصنيف بالعربية والإنجليزية والمعرف' },
        { status: 400 }
      );
    }

    const created = await prisma.category.create({
      data: {
        nameAr,
        nameEn,
        slug: slug.toLowerCase().trim(),
        descriptionAr,
        descriptionEn,
        image,
        icon: icon || 'Sparkles',
        sortOrder: sortOrder !== undefined ? parseInt(sortOrder) : 0,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
    });

    return NextResponse.json({ success: true, category: created });
  } catch (error: any) {
    console.error('Category create error:', error);
    return NextResponse.json(
      { error: error.message || 'فشل إضافة التصنيف' },
      { status: 500 }
    );
  }
}
