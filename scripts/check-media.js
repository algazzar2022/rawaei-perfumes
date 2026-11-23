const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const reviews = await prisma.videoReview.findMany();
  console.log('VideoReviews count:', reviews.length);
  reviews.forEach(r => console.log(' - Review:', r.id, r.authorName, r.videoUrl));

  const banners = await prisma.banner.findMany({ include: { slides: true } });
  console.log('Banners count:', banners.length);
  banners.forEach(b => {
    console.log(' - Banner:', b.id, b.type, b.desktopImage, 'slides:', b.slides.length);
  });
}

run().finally(() => prisma.$disconnect());
