import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const all = searchParams.get('all') === 'true';

    const where = all ? {} : { isActive: true };

    const reviews = await prisma.videoReview.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json({ success: true, reviews });
  } catch (error: any) {
    console.error('Failed to fetch video reviews:', error);
    return NextResponse.json(
      { success: false, error: 'فشل جلب مراجعات الفيديو' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح بالوصول' }, { status: 403 });
    }

    const body = await request.json();
    const {
      authorName,
      authorHandle,
      authorAvatar,
      quoteAr,
      quoteEn,
      badgeText,
      videoUrl,
      posterImage,
      platform,
      productTag,
      rating,
      sortOrder,
      isActive,
    } = body;

    if (!authorName || !posterImage) {
      return NextResponse.json(
        { error: 'يرجى تقديم اسم المراجع وصورة الغلاف' },
        { status: 400 }
      );
    }

    const review = await prisma.videoReview.create({
      data: {
        authorName,
        authorHandle: authorHandle || null,
        authorAvatar: authorAvatar || null,
        quoteAr: quoteAr || '',
        quoteEn: quoteEn || null,
        badgeText: badgeText || 'REAL REVIEW',
        videoUrl: videoUrl || null,
        posterImage,
        platform: platform || 'REELS',
        productTag: productTag || null,
        rating: rating !== undefined ? parseFloat(rating) : 5.0,
        sortOrder: sortOrder !== undefined ? parseInt(sortOrder) : 0,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
    });

    return NextResponse.json({ success: true, review }, { status: 201 });
  } catch (error: any) {
    console.error('Failed to create video review:', error);
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء حفظ مراجعة الفيديو' },
      { status: 500 }
    );
  }
}
