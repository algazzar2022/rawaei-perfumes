import React from 'react';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import ProductCatalogView from '@/components/products/ProductCatalogView';

export const revalidate = 0;

export default async function CategoryPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;

  const category = await prisma.category.findUnique({
    where: { slug },
  });

  if (!category || !category.isActive) {
    notFound();
  }

  const products = await prisma.product.findMany({
    where: {
      categoryId: category.id,
      isActive: true,
    },
    include: {
      category: true,
      images: { orderBy: { sortOrder: 'asc' } },
      sizes: { orderBy: { sizeMl: 'asc' } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <ProductCatalogView
      titleAr={category.nameAr}
      titleEn={category.nameEn}
      subtitleAr={category.descriptionAr || 'تشكيلة حصرية منتقاة بعناية فائقة'}
      subtitleEn={category.descriptionEn || 'Exclusively curated luxury collection'}
      badgeAr="تصنيف فاخر"
      badgeEn="Luxury Category"
      initialProducts={products as any}
    />
  );
}
