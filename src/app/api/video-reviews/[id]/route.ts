import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح بالوصول' }, { status: 403 });
    }

    const { id } = params;
    const body = await request.json();

    const updated = await prisma.videoReview.update({
      where: { id },
      data: {
        authorName: body.authorName,
        authorHandle: body.authorHandle,
        authorAvatar: body.authorAvatar,
        quoteAr: body.quoteAr,
        quoteEn: body.quoteEn,
        badgeText: body.badgeText,
        videoUrl: body.videoUrl,
        posterImage: body.posterImage,
        platform: body.platform,
        productTag: body.productTag,
        rating: body.rating !== undefined ? parseFloat(body.rating) : undefined,
        sortOrder: body.sortOrder !== undefined ? parseInt(body.sortOrder) : undefined,
        isActive: body.isActive !== undefined ? Boolean(body.isActive) : undefined,
      },
    });

    return NextResponse.json({ success: true, review: updated });
  } catch (error: any) {
    console.error('Failed to update video review:', error);
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء تعديل مراجعة الفيديو' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح بالوصول' }, { status: 403 });
    }

    const { id } = params;
    await prisma.videoReview.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'تم الحذف بنجاح' });
  } catch (error: any) {
    console.error('Failed to delete video review:', error);
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء حذف مراجعة الفيديو' },
      { status: 500 }
    );
  }
}
