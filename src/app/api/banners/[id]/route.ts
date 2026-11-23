import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const banner = await prisma.banner.findUnique({
      where: { id },
      include: {
        slides: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!banner) {
      return NextResponse.json({ error: 'البانر غير موجود' }, { status: 404 });
    }

    return NextResponse.json({ banner });
  } catch (error) {
    console.error('Banner fetch error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب البانر' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'ADMIN' && user.role !== 'MANAGER')) {
      return NextResponse.json({ error: 'غير مصرح لك بتعديل البانر' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();

    const {
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
      slides,
    } = body;

    const updated = await prisma.banner.update({
      where: { id },
      data: {
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
        autoplaySpeed: autoplaySpeed !== undefined ? parseInt(autoplaySpeed) : undefined,
        isActive: isActive !== undefined ? Boolean(isActive) : undefined,
        sortOrder: sortOrder !== undefined ? parseInt(sortOrder) : undefined,
      },
    });

    // If slides array is sent for slideshow mode, update slides
    if (slides && Array.isArray(slides)) {
      await prisma.bannerSlide.deleteMany({ where: { bannerId: id } });
      for (let i = 0; i < slides.length; i++) {
        const s = slides[i];
        if (s.desktopImage) {
          await prisma.bannerSlide.create({
            data: {
              bannerId: id,
              titleAr: s.titleAr || '',
              titleEn: s.titleEn || '',
              subtitleAr: s.subtitleAr || '',
              subtitleEn: s.subtitleEn || '',
              desktopImage: s.desktopImage,
              mobileImage: s.mobileImage || s.desktopImage,
              link: s.link || '',
              buttonTextAr: s.buttonTextAr || 'تسوق الآن',
              buttonTextEn: s.buttonTextEn || 'Shop Now',
              durationSeconds: s.durationSeconds ? parseInt(s.durationSeconds) : 5,
              sortOrder: i,
              isActive: s.isActive !== undefined ? Boolean(s.isActive) : true,
            },
          });
        }
      }
    }

    const result = await prisma.banner.findUnique({
      where: { id },
      include: {
        slides: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    return NextResponse.json({ success: true, banner: result });
  } catch (error: any) {
    console.error('Banner update error:', error);
    return NextResponse.json(
      { error: error.message || 'فشل تحديث البانر' },
      { status: 500 }
    );
  }
}
