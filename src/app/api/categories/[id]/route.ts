import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const category = await prisma.category.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        products: {
          where: { isActive: true },
          include: {
            images: true,
            sizes: true,
          },
        },
      },
    });

    if (!category) {
      return NextResponse.json({ error: 'التصنيف غير موجود' }, { status: 404 });
    }

    return NextResponse.json({ category });
  } catch (error) {
    console.error('Category detail error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب التصنيف' },
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
      return NextResponse.json({ error: 'غير مصرح لك بتعديل التصنيف' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { nameAr, nameEn, slug, descriptionAr, descriptionEn, image, icon, sortOrder, isActive } = body;

    const updated = await prisma.category.update({
      where: { id },
      data: {
        nameAr,
        nameEn,
        slug: slug?.toLowerCase().trim(),
        descriptionAr,
        descriptionEn,
        image,
        icon,
        sortOrder: sortOrder !== undefined ? parseInt(sortOrder) : undefined,
        isActive: isActive !== undefined ? Boolean(isActive) : undefined,
      },
    });

    return NextResponse.json({ success: true, category: updated });
  } catch (error: any) {
    console.error('Category update error:', error);
    return NextResponse.json(
      { error: error.message || 'فشل تعديل التصنيف' },
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
      return NextResponse.json({ error: 'غير مصرح لك بحذف التصنيف' }, { status: 401 });
    }

    const { id } = params;

    // Check if category has products
    const productCount = await prisma.product.count({ where: { categoryId: id } });
    if (productCount > 0) {
      return NextResponse.json(
        { error: 'لا يمكن حذف هذا التصنيف لوجود منتجات مرتبطة به' },
        { status: 400 }
      );
    }

    await prisma.category.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'تم حذف التصنيف بنجاح' });
  } catch (error: any) {
    console.error('Category delete error:', error);
    return NextResponse.json(
      { error: error.message || 'فشل حذف التصنيف' },
      { status: 500 }
    );
  }
}
