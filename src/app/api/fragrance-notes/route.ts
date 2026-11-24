import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { autoTranslate } from '@/lib/translate';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const category = searchParams.get('category');

    const where: any = {};
    if (category && category !== 'ALL') {
      where.category = category;
    }
    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { nameAr: { contains: q } },
        { nameEn: { contains: q } },
      ];
    }

    const notes = await prisma.fragranceNote.findMany({
      where,
      orderBy: { nameAr: 'asc' },
    });

    return NextResponse.json({ success: true, notes });
  } catch (error: any) {
    console.error('Fragrance notes fetch error:', error);
    return NextResponse.json(
      { error: 'فشل جلب النوتات العطرية' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'ADMIN' && user.role !== 'MANAGER')) {
      return NextResponse.json({ error: 'غير مصرح لك بإضافة نوتة عطرية' }, { status: 401 });
    }

    const body = await request.json();
    const { nameAr, nameEn, image, category } = body;

    if (!nameAr || !nameAr.trim()) {
      return NextResponse.json({ error: 'يرجى كتابة اسم النوتة العطرية' }, { status: 400 });
    }

    // Auto-translate name if not provided
    let translatedEn = nameEn?.trim();
    if (!translatedEn) {
      try {
        const trans = await autoTranslate(nameAr.trim());
        if (trans) translatedEn = trans;
      } catch (err) {
        console.warn('Note translation warning:', err);
      }
    }

    const created = await prisma.fragranceNote.create({
      data: {
        nameAr: nameAr.trim(),
        nameEn: translatedEn || nameAr.trim(),
        image: image?.trim() || null,
        category: category?.trim() || 'أخرى',
      },
    });

    return NextResponse.json({ success: true, note: created });
  } catch (error: any) {
    console.error('Create fragrance note error:', error);
    return NextResponse.json(
      { error: error.message || 'فشل إضافة النوتة العطرية' },
      { status: 500 }
    );
  }
}
