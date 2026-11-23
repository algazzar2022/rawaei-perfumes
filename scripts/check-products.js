const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const products = await prisma.product.findMany({ include: { images: true } });
  console.log('Products count:', products.length);
  products.forEach(p => console.log('Product:', p.nameAr, 'images:', p.images.map(i => i.url)));
}

run().finally(() => prisma.$disconnect());
