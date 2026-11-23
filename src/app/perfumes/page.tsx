import React from 'react';
import prisma from '@/lib/prisma';
import ProductCatalogView from '@/components/products/ProductCatalogView';

export const revalidate = 0;

export default async function AllPerfumesPage() {
  const products = await prisma.product.findMany({
    where: {
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
      titleAr="جميع العطور الفاخرة"
      titleEn="All Royal Fragrances"
      subtitleAr="استكشف تشكيلات روائع للعطور الكاملة للرجال والنساء والعود الملكي الفاخر"
      subtitleEn="Explore our complete haute parfumerie collection crafted with timeless elegance"
      badgeAr="المتجر الكامل"
      badgeEn="Full Boutique"
      initialProducts={products as any}
    />
  );
}
