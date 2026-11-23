import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const banners = await prisma.banner.findMany({
      include: {
        slides: {
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json({ banners });
  } catch (error) {
    console.error('Banners fetch error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب البانرات' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'ADMIN' && user.role !== 'MANAGER')) {
      return NextResponse.json({ error: 'غير مصرح لك بتعديل البانرات' }, { status: 401 });
    }

    const body = await request.json();
    const {
      type,
      mode,
      titleAr,
      titleEn,
      subtitleAr,
      subtitleEn,
      link,
      buttonTextAr,
      buttonTextEn,
      desktopImage,
      mobileImage,
      videoUrl,
      autoplaySpeed,
      isActive,
      sortOrder,
    } = body;

    const banner = await prisma.banner.create({
      data: {
        type: type || 'HERO',
        mode: mode || 'STATIC',
        titleAr,
        titleEn,
        subtitleAr,
        subtitleEn,
        link,
        buttonTextAr,
        buttonTextEn,
        desktopImage,
        mobileImage,
        videoUrl,
        autoplaySpeed: autoplaySpeed ? parseInt(autoplaySpeed) : 5000,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        sortOrder: sortOrder ? parseInt(sortOrder) : 0,
      },
    });

    return NextResponse.json({ success: true, banner });
  } catch (error: any) {
    console.error('Banner create error:', error);
    return NextResponse.json(
      { error: error.message || 'فشل إضافة البانر' },
      { status: 500 }
    );
  }
}
