import React from 'react';
import prisma from '@/lib/prisma';
import ProductCatalogView from '@/components/products/ProductCatalogView';

export const revalidate = 0;

export default async function AllProductsPage() {
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
      titleAr="جميع المنتجات الفاخرة"
      titleEn="All Royal Products"
      subtitleAr="تصفح كافة منتجات متجر روائع للعطور من العطور الشرقية والفرنسية، البخور والعود، مجموعات الهدايا، ومعطرات المنزل"
      subtitleEn="Browse our full collection of master perfumes, royal oud, gift sets, and home fragrances"
      badgeAr="المتجر المتكامل"
      badgeEn="Full Catalog"
      initialProducts={products as any}
    />
  );
}
