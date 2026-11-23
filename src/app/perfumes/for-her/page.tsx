import React from 'react';
import prisma from '@/lib/prisma';
import ProductCatalogView from '@/components/products/ProductCatalogView';

export const revalidate = 0;

export default async function ForHerPage() {
  const products = await prisma.product.findMany({
    where: {
      gender: 'HER',
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
      titleAr="عطور نسائية ساحرة – For Her"
      titleEn="Women's Fine Fragrances – For Her"
      subtitleAr="باقة تفوح بأنوثة طاغية مستوحاة من الورد الدمشقي النادر، الفانيليا، والمسك الأبيض المخملي"
      subtitleEn="Sublime feminine grace woven with rare Damask rose, Bourbon vanilla, and velvet musk"
      badgeAr="مجموعة النساء"
      badgeEn="Ladies' Edition"
      initialProducts={products as any}
      fixedGender="HER"
    />
  );
}
