import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get('category');
    const gender = searchParams.get('gender');
    const search = searchParams.get('search');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const sizeMl = searchParams.get('size');
    const sort = searchParams.get('sort') || 'latest';
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
    const featured = searchParams.get('featured');

    const where: any = {
      isActive: true,
    };

    if (categorySlug && categorySlug !== 'all') {
      where.category = {
        slug: categorySlug,
      };
    }

    if (gender && ['HIM', 'HER', 'UNISEX'].includes(gender.toUpperCase())) {
      where.gender = gender.toUpperCase();
    }

    if (featured === 'true') {
      where.isFeatured = true;
    }

    if (search) {
      const q = search.trim();
      where.OR = [
        { nameAr: { contains: q } },
        { nameEn: { contains: q } },
        { descriptionAr: { contains: q } },
        { descriptionEn: { contains: q } },
        { topNotes: { contains: q } },
        { heartNotes: { contains: q } },
        { baseNotes: { contains: q } },
        { sku: { contains: q } },
      ];
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    if (sizeMl) {
      const parsedSize = parseInt(sizeMl);
      where.sizes = {
        some: {
          sizeMl: parsedSize,
        },
      };
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'price_asc') {
      orderBy = { price: 'asc' };
    } else if (sort === 'price_desc') {
      orderBy = { price: 'desc' };
    } else if (sort === 'best_seller') {
      orderBy = { rating: 'desc' };
    } else if (sort === 'latest') {
      orderBy = { createdAt: 'desc' };
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
        images: {
          orderBy: { sortOrder: 'asc' },
        },
        sizes: {
          orderBy: { sizeMl: 'asc' },
        },
      },
      orderBy,
      take: limit,
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Products fetch error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب المنتجات' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'ADMIN' && user.role !== 'MANAGER')) {
      return NextResponse.json({ error: 'غير مصرح لك بتنفيذ هذا الإجراء' }, { status: 401 });
    }

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

    if (!nameAr || !nameEn || !slug || !price || !categoryId) {
      return NextResponse.json(
        { error: 'يرجى إكمال الحقول الإلزامية (الاسم، المعرف، السعر، التصنيف)' },
        { status: 400 }
      );
    }

    const created = await prisma.product.create({
      data: {
        nameAr,
        nameEn,
        slug: slug.toLowerCase().trim(),
        descriptionAr: descriptionAr || '',
        descriptionEn: descriptionEn || '',
        price: parseFloat(price),
        compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : null,
        costPrice: costPrice ? parseFloat(costPrice) : null,
        sku: sku || `RW-${Date.now().toString().slice(-6)}`,
        stock: stock ? parseInt(stock) : 0,
        volumeMl: volumeMl ? parseInt(volumeMl) : 100,
        gender: gender || 'UNISEX',
        scentFamily: scentFamily || null,
        topNotes: topNotes || null,
        heartNotes: heartNotes || null,
        baseNotes: baseNotes || null,
        longevity: longevity || null,
        sillage: sillage || null,
        isFeatured: Boolean(isFeatured),
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        categoryId,
        images: {
          create: (images || []).map((img: any, idx: number) => ({
            url: img.url,
            alt: nameAr,
            isMain: idx === 0,
            sortOrder: idx,
          })),
        },
        sizes: {
          create: (sizes && sizes.length > 0 ? sizes : [{ sizeMl: 100, price: parseFloat(price), stock: 10, isDefault: true }]).map((s: any) => ({
            sizeMl: parseInt(s.sizeMl),
            price: parseFloat(s.price),
            comparePrice: s.comparePrice ? parseFloat(s.comparePrice) : null,
            stock: s.stock ? parseInt(s.stock) : 10,
            isDefault: Boolean(s.isDefault),
          })),
        },
      },
      include: {
        category: true,
        images: true,
        sizes: true,
      },
    });

    if (created.isFeatured) {
      await prisma.featuredProduct.upsert({
        where: { productId: created.id },
        update: { isActive: true },
        create: { productId: created.id, sortOrder: 0, isActive: true },
      });
    }

    return NextResponse.json({ success: true, product: created });
  } catch (error: any) {
    console.error('Product creation error:', error);
    return NextResponse.json(
      { error: error.message || 'فشل إضافة المنتج' },
      { status: 500 }
    );
  }
}
