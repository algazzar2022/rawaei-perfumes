const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  // Delete demo video reviews
  const deletedReviews = await prisma.videoReview.deleteMany({
    where: {
      videoUrl: { contains: 'mixkit.co' }
    }
  });
  console.log(`Deleted ${deletedReviews.count} demo mixkit video reviews.`);

  // Clear demo slides from Hero banner that had unsplash
  const updatedSlides = await prisma.bannerSlide.deleteMany({
    where: {
      desktopImage: { contains: 'unsplash.com' }
    }
  });
  console.log(`Deleted ${updatedSlides.count} demo unsplash banner slides.`);

  // Reset promo banners that had unsplash
  const resetBanners = await prisma.banner.updateMany({
    where: {
      desktopImage: { contains: 'unsplash.com' }
    },
    data: {
      desktopImage: ''
    }
  });
  console.log(`Reset ${resetBanners.count} demo unsplash promo banners.`);
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
