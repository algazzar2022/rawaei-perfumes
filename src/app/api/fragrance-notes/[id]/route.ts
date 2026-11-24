import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { autoTranslate } from '@/lib/translate';

export const dynamic = 'force-dynamic';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'ADMIN' && user.role !== 'MANAGER')) {
      return NextResponse.json({ error: 'غير مصرح لك بتعديل النوتة العطرية' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { nameAr, nameEn, image, category } = body;

    let translatedEn = nameEn?.trim();
    if (!translatedEn && nameAr?.trim()) {
      try {
        const trans = await autoTranslate(nameAr.trim());
        if (trans) translatedEn = trans;
      } catch (err) {
        console.warn('Note translation warning:', err);
      }
    }

    const updated = await prisma.fragranceNote.update({
      where: { id },
      data: {
        nameAr: nameAr ? nameAr.trim() : undefined,
        nameEn: translatedEn || undefined,
        image: image !== undefined ? (image ? image.trim() : null) : undefined,
        category: category !== undefined ? (category ? category.trim() : null) : undefined,
      },
    });

    return NextResponse.json({ success: true, note: updated });
  } catch (error: any) {
    console.error('Update fragrance note error:', error);
    return NextResponse.json(
      { error: error.message || 'فشل تعديل النوتة العطرية' },
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
    if (!user || (user.role !== 'ADMIN' && user.role !== 'MANAGER')) {
      return NextResponse.json({ error: 'غير مصرح لك بحذف النوتة العطرية' }, { status: 401 });
    }

    const { id } = params;
    await prisma.fragranceNote.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'تم حذف النوتة العطرية بنجاح' });
  } catch (error: any) {
    console.error('Delete fragrance note error:', error);
    return NextResponse.json(
      { error: error.message || 'فشل حذف النوتة العطرية' },
      { status: 500 }
    );
  }
}
