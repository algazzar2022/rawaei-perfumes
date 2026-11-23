import React from 'react';
import prisma from '@/lib/prisma';
import ProductCatalogView from '@/components/products/ProductCatalogView';

export const revalidate = 0;

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const query = searchParams.q ? searchParams.q.trim() : '';

  let products: any[] = [];
  if (query) {
    products = await prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { nameAr: { contains: query } },
          { nameEn: { contains: query } },
          { descriptionAr: { contains: query } },
          { descriptionEn: { contains: query } },
          { topNotes: { contains: query } },
          { heartNotes: { contains: query } },
          { baseNotes: { contains: query } },
          { sku: { contains: query } },
        ],
      },
      include: {
        category: true,
        images: { orderBy: { sortOrder: 'asc' } },
        sizes: { orderBy: { sizeMl: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  return (
    <ProductCatalogView
      titleAr={`نتائج البحث عن: "${query}"`}
      titleEn={`Search Results for: "${query}"`}
      subtitleAr={`تم العثور على ${products.length} نتيجة مطابقة لبحثك في متجر روائع للعطور`}
      subtitleEn={`Found ${products.length} products matching your criteria`}
      badgeAr="البحث"
      badgeEn="Search"
      initialProducts={products}
    />
  );
}
