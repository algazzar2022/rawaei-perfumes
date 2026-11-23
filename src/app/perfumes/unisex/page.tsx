import React from 'react';
import prisma from '@/lib/prisma';
import ProductCatalogView from '@/components/products/ProductCatalogView';

export const revalidate = 0;

export default async function UnisexPage() {
  const products = await prisma.product.findMany({
    where: {
      gender: 'UNISEX',
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
      titleAr="عطور للجنسين – Unisex Collection"
      titleEn="Unisex Signature Fragrances"
      subtitleAr="تناغم ملكي استثنائي يلائم كلا الجنسين، يفيض بالعنبر والعود الكمبودي والزعفران الأصيل"
      subtitleEn="Flawless harmony uniting amber, Cambodian oud, and golden saffron for all discerning tastes"
      badgeAr="مجموعة متوازنة"
      badgeEn="Signature Unisex"
      initialProducts={products as any}
      fixedGender="UNISEX"
    />
  );
}
