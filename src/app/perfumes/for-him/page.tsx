import React from 'react';
import prisma from '@/lib/prisma';
import ProductCatalogView from '@/components/products/ProductCatalogView';

export const revalidate = 0;

export default async function ForHimPage() {
  const products = await prisma.product.findMany({
    where: {
      gender: 'HIM',
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
      titleAr="عطور رجالية فاخرة – For Him"
      titleEn="Men's Royal Fragrances – For Him"
      subtitleAr="تشكيلة نادرة تجمع بين هيبة أخشاب العود المعتق، الجلود الفاخرة، والتوابل الملكية الدافئة"
      subtitleEn="Commanding masculine notes of aged agarwood, Tuscan leather, and warming spices"
      badgeAr="مجموعة الرجال"
      badgeEn="Gentlemen's Edition"
      initialProducts={products as any}
      fixedGender="HIM"
    />
  );
}
