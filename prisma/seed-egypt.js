const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🇪🇬 Updating Egypt localization & Video Reviews in database...');

  // 1. Update Site Settings for Egypt
  const egyptSettings = [
    { key: 'contact_phone', value: '+201001234567', group: 'general' },
    { key: 'contact_whatsapp', value: '+201001234567', group: 'general' },
    { key: 'contact_address_ar', value: 'جمهورية مصر العربية، القاهرة – التجمع الخامس، شارع التسعين الشمالي', group: 'general' },
    { key: 'contact_address_en', value: '90th St, New Cairo, Cairo, Egypt', group: 'general' },
    { key: 'currency', value: 'EGP', group: 'general' },
    { key: 'currency_symbol_ar', value: 'ج.م', group: 'general' },
    { key: 'announcement_bar_ar', value: '✨ شحن مجاني لكافة محافظات مصر للطلبات فوق 800 جنيه | كود الخصم: WELCOME10 ✨', group: 'identity' },
    { key: 'announcement_bar_en', value: '✨ Free Delivery across Egypt for orders over 800 EGP | Code: WELCOME10 ✨', group: 'identity' },
    { key: 'seo_keywords', value: 'عطور, روائع للعطور, دهن عود, بخور مروكي, هدايا عطور, عطور نسائية, عطور رجالية, عطور فاخرة, مصر, القاهرة, الإسكندرية', group: 'seo' },
  ];

  for (const s of egyptSettings) {
    await prisma.siteSetting.upsert({
      where: { key: s.key },
      update: { value: s.value, group: s.group },
      create: s,
    });
  }
  console.log('✅ Updated Egypt settings in database');

  // 2. Seed Video Reviews matching Image 1
  const reviews = [
    {
      authorName: 'Menna Ehab',
      authorHandle: '@mennaehab23',
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300',
      quoteAr: '',
      quoteEn: '',
      badgeText: 'REAL REVIEW',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-holding-a-perfume-bottle-in-hands-41481-large.mp4',
      posterImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=800&auto=format&fit=crop',
      platform: 'REELS',
      productTag: null,
      rating: 5.0,
      sortOrder: 1,
      isActive: true,
    },
    {
      authorName: 'Ahmed El Kholy',
      authorHandle: '@ahmedelkholy612',
      authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300',
      quoteAr: '',
      quoteEn: '',
      badgeText: 'REAL REVIEW',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-holding-perfume-bottle-41480-large.mp4',
      posterImage: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=800&auto=format&fit=crop',
      platform: 'REELS',
      productTag: null,
      rating: 5.0,
      sortOrder: 2,
      isActive: true,
    },
    {
      authorName: 'Galal Ahmed',
      authorHandle: '@big_galal',
      authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300',
      quoteAr: '',
      quoteEn: '',
      badgeText: 'REAL REVIEW',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hands-spraying-perfume-in-the-air-41482-large.mp4',
      posterImage: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=800&auto=format&fit=crop',
      platform: 'REELS',
      productTag: null,
      rating: 5.0,
      sortOrder: 3,
      isActive: true,
    },
    {
      authorName: 'Renad Emad',
      authorHandle: '@renademad',
      authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=300',
      quoteAr: '',
      quoteEn: '',
      badgeText: 'REAL REVIEW',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-spraying-perfume-on-her-neck-41484-large.mp4',
      posterImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop',
      platform: 'REELS',
      productTag: null,
      rating: 5.0,
      sortOrder: 4,
      isActive: true,
    },
  ];

  await prisma.videoReview.deleteMany({});
  for (const r of reviews) {
    await prisma.videoReview.create({ data: r });
  }
  console.log('✅ Seeded 4 video reviews matching Image 1');

  // 3. Update Product prices to Egyptian Pounds (e.g. 1,200 ج.م - 2,500 ج.م)
  const products = await prisma.product.findMany();
  for (const p of products) {
    // If price is currently in small SAR values (e.g. 200 - 600), scale appropriately to luxury EGP (e.g. 950 - 2,200 EGP)
    let egpPrice = p.price;
    if (p.price < 800) {
      egpPrice = Math.round(p.price * 3.5);
    }
    let comparePrice = p.compareAtPrice;
    if (comparePrice && comparePrice < 1000) {
      comparePrice = Math.round(comparePrice * 3.5);
    }

    await prisma.product.update({
      where: { id: p.id },
      data: {
        price: egpPrice,
        compareAtPrice: comparePrice,
      },
    });

    // Update sizes prices too
    const sizes = await prisma.productSize.findMany({ where: { productId: p.id } });
    for (const s of sizes) {
      let sPrice = s.price < 800 ? Math.round(s.price * 3.5) : s.price;
      let sCompare = s.comparePrice && s.comparePrice < 1000 ? Math.round(s.comparePrice * 3.5) : s.comparePrice;
      await prisma.productSize.update({
        where: { id: s.id },
        data: {
          price: sPrice,
          comparePrice: sCompare,
        },
      });
    }
  }
  console.log(`✅ Updated ${products.length} products to Egyptian Pound prices!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
