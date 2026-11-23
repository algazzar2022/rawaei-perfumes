import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        category: true,
        images: {
          orderBy: { sortOrder: 'asc' },
        },
        sizes: {
          orderBy: { sizeMl: 'asc' },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'المنتج غير موجود' }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error('Single product fetch error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب تفاصيل المنتج' },
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
      return NextResponse.json({ error: 'غير مصرح لك بتعديل المنتجات' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();

    const {
      nameAr,
      nameEn,
      slug,
      descriptionAr,
      descriptionEn,
      price,
      compareAtPrice,
      costPrice,
      sku,
      stock,
      volumeMl,
      gender,
      scentFamily,
      topNotes,
      heartNotes,
      baseNotes,
      longevity,
      sillage,
      isFeatured,
      isActive,
      categoryId,
      images,
      sizes,
    } = body;

    const updated = await prisma.product.update({
      where: { id },
      data: {
        nameAr,
        nameEn,
        slug: slug?.toLowerCase().trim(),
        descriptionAr,
        descriptionEn,
        price: price !== undefined ? parseFloat(price) : undefined,
        compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : null,
        costPrice: costPrice ? parseFloat(costPrice) : null,
        sku,
        stock: stock !== undefined ? parseInt(stock) : undefined,
        volumeMl: volumeMl !== undefined ? parseInt(volumeMl) : undefined,
        gender,
        scentFamily,
        topNotes,
        heartNotes,
        baseNotes,
        longevity,
        sillage,
        isFeatured: isFeatured !== undefined ? Boolean(isFeatured) : undefined,
        isActive: isActive !== undefined ? Boolean(isActive) : undefined,
        categoryId,
      },
    });

    // Update images if provided
    if (images && Array.isArray(images)) {
      await prisma.productImage.deleteMany({ where: { productId: id } });
      for (let i = 0; i < images.length; i++) {
        await prisma.productImage.create({
          data: {
            productId: id,
            url: images[i].url || images[i],
            alt: nameAr || updated.nameAr,
            isMain: i === 0,
            sortOrder: i,
          },
        });
      }
    }

    // Update sizes if provided
    if (sizes && Array.isArray(sizes)) {
      await prisma.productSize.deleteMany({ where: { productId: id } });
      for (const s of sizes) {
        await prisma.productSize.create({
          data: {
            productId: id,
            sizeMl: parseInt(s.sizeMl),
            price: parseFloat(s.price),
            comparePrice: s.comparePrice ? parseFloat(s.comparePrice) : null,
            stock: s.stock !== undefined ? parseInt(s.stock) : 10,
            isDefault: Boolean(s.isDefault),
          },
        });
      }
    }

    if (isFeatured !== undefined) {
      if (Boolean(isFeatured)) {
        await prisma.featuredProduct.upsert({
          where: { productId: id },
          update: { isActive: true },
          create: { productId: id, sortOrder: 0, isActive: true },
        });
      } else {
        await prisma.featuredProduct.deleteMany({ where: { productId: id } });
      }
    }

    return NextResponse.json({ success: true, product: updated });
  } catch (error: any) {
    console.error('Product update error:', error);
    return NextResponse.json(
      { error: error.message || 'فشل تحديث بيانات المنتج' },
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
      return NextResponse.json({ error: 'غير مصرح لك بحذف المنتجات' }, { status: 401 });
    }

    const { id } = params;

    // Check if product is in any orders
    const orderItemsCount = await prisma.orderItem.count({ where: { productId: id } });
    if (orderItemsCount > 0) {
      // Soft-delete by setting isActive to false to preserve historical order records
      await prisma.product.update({
        where: { id },
        data: { isActive: false },
      });
      return NextResponse.json({
        success: true,
        message: 'تم تعطيل المنتج وحفظ سجلات الطلبات المرتبطة به',
      });
    }

    // Otherwise hard delete
    await prisma.productImage.deleteMany({ where: { productId: id } });
    await prisma.productSize.deleteMany({ where: { productId: id } });
    await prisma.featuredProduct.deleteMany({ where: { productId: id } });
    await prisma.cartItem.deleteMany({ where: { productId: id } });
    await prisma.product.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'تم حذف المنتج بنجاح' });
  } catch (error: any) {
    console.error('Product deletion error:', error);
    return NextResponse.json(
      { error: error.message || 'فشل حذف المنتج' },
      { status: 500 }
    );
  }
}
