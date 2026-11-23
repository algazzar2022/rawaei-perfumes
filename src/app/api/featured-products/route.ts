import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const featuredEntries = await prisma.featuredProduct.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        product: {
          include: {
            category: true,
            images: {
              orderBy: { sortOrder: 'asc' },
            },
            sizes: {
              orderBy: { sizeMl: 'asc' },
            },
          },
        },
      },
    });

    const products = featuredEntries
      .map((entry) => entry.product)
      .filter((p) => p && p.isActive);

    // Also fetch featured section settings
    const sectionTitleAr = await prisma.siteSetting.findUnique({
      where: { key: 'featured_section_title_ar' },
    });
    const sectionTitleEn = await prisma.siteSetting.findUnique({
      where: { key: 'featured_section_title_en' },
    });
    const sectionSubtitleAr = await prisma.siteSetting.findUnique({
      where: { key: 'featured_section_subtitle_ar' },
    });
    const sectionSubtitleEn = await prisma.siteSetting.findUnique({
      where: { key: 'featured_section_subtitle_en' },
    });
    const sectionActive = await prisma.siteSetting.findUnique({
      where: { key: 'featured_section_active' },
    });
    const sectionLimit = await prisma.siteSetting.findUnique({
      where: { key: 'featured_products_limit' },
    });

    return NextResponse.json({
      products,
      settings: {
        titleAr: sectionTitleAr?.value || 'المختارات الملكية الأكثر تميزاً',
        titleEn: sectionTitleEn?.value || 'Featured Royal Masterpieces',
        subtitleAr: sectionSubtitleAr?.value || 'نخبة من أروع المنتجات المصممة لأصحاب الذوق الرفيع والباحثين عن التفرد',
        subtitleEn: sectionSubtitleEn?.value || 'Handpicked luxury fragrances for discerning connoisseurs',
        isActive: sectionActive?.value !== 'false',
        limit: sectionLimit ? parseInt(sectionLimit.value) : 8,
      },
    });
  } catch (error) {
    console.error('Featured products fetch error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب المنتجات المميزة' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'ADMIN' && user.role !== 'MANAGER')) {
      return NextResponse.json({ error: 'غير مصرح لك بتعديل المنتجات المميزة' }, { status: 401 });
    }

    const body = await request.json();
    const { productIds, titleAr, titleEn, subtitleAr, subtitleEn, isActive, limit } = body;

    // Update settings if provided
    if (titleAr) {
      await prisma.siteSetting.upsert({
        where: { key: 'featured_section_title_ar' },
        update: { value: titleAr },
        create: { key: 'featured_section_title_ar', value: titleAr, group: 'featured' },
      });
    }
    if (titleEn) {
      await prisma.siteSetting.upsert({
        where: { key: 'featured_section_title_en' },
        update: { value: titleEn },
        create: { key: 'featured_section_title_en', value: titleEn, group: 'featured' },
      });
    }
    if (subtitleAr !== undefined) {
      await prisma.siteSetting.upsert({
        where: { key: 'featured_section_subtitle_ar' },
        update: { value: subtitleAr },
        create: { key: 'featured_section_subtitle_ar', value: subtitleAr, group: 'featured' },
      });
    }
    if (subtitleEn !== undefined) {
      await prisma.siteSetting.upsert({
        where: { key: 'featured_section_subtitle_en' },
        update: { value: subtitleEn },
        create: { key: 'featured_section_subtitle_en', value: subtitleEn, group: 'featured' },
      });
    }
    if (isActive !== undefined) {
      await prisma.siteSetting.upsert({
        where: { key: 'featured_section_active' },
        update: { value: String(isActive) },
        create: { key: 'featured_section_active', value: String(isActive), group: 'featured' },
      });
    }
    if (limit !== undefined) {
      await prisma.siteSetting.upsert({
        where: { key: 'featured_products_limit' },
        update: { value: String(limit) },
        create: { key: 'featured_products_limit', value: String(limit), group: 'featured' },
      });
    }

    // Re-sync featured product list if provided
    if (productIds && Array.isArray(productIds)) {
      // First clear existing
      await prisma.featuredProduct.deleteMany();
      // Add newly ordered products
      for (let i = 0; i < productIds.length; i++) {
        await prisma.featuredProduct.create({
          data: {
            productId: productIds[i],
            sortOrder: i,
            isActive: true,
          },
        });
        // Also update product.isFeatured = true
        await prisma.product.update({
          where: { id: productIds[i] },
          data: { isFeatured: true },
        });
      }
    }

    return NextResponse.json({ success: true, message: 'تم تحديث قسم المنتجات المميزة بنجاح' });
  } catch (error: any) {
    console.error('Featured update error:', error);
    return NextResponse.json(
      { error: error.message || 'فشل تحديث المنتجات المميزة' },
      { status: 500 }
    );
  }
}
