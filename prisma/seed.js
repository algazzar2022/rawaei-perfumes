const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding for RAWAEI PERFUMES...');

  // 1. Verify Admin Users
  const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });
  console.log(`ℹ️ Current admin users count: ${adminCount}`);

  // 2. Seed the 6 Mandatory Categories
  const categoriesData = [
    {
      slug: 'perfumes',
      nameAr: 'العطور',
      nameEn: 'Perfumes',
      descriptionAr: 'تشكيلة فاخرة من أرقى العطور الشرقية والفرنسية بتركيز استثنائي يدوم طويلاً.',
      descriptionEn: 'Exclusive collection of fine oriental and french fragrances with exceptional longevity.',
      image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=1000&auto=format&fit=crop',
      icon: 'Sparkles',
      sortOrder: 1,
      isActive: true,
    },
    {
      slug: 'oud-incense',
      nameAr: 'البخور والعود',
      nameEn: 'Incense & Oud',
      descriptionAr: 'أندر أنواع دهن العود المعتّق وخشب العود الملكي المروكي والكمبودي الفاخر.',
      descriptionEn: 'Rare aged oud oil, royal marooki, and luxurious cambodian agarwood.',
      image: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?q=80&w=1000&auto=format&fit=crop',
      icon: 'Flame',
      sortOrder: 2,
      isActive: true,
    },
    {
      slug: 'sets-gifts',
      nameAr: 'المجموعات والهدايا',
      nameEn: 'Sets & Gifts',
      descriptionAr: 'بوكسات إهداء مصممة بلمسات ذهبية ملكية تليق بأرقى المناسبات والإهداءات.',
      descriptionEn: 'Luxury gift boxes crafted with royal gold accents for your most prestigious moments.',
      image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=1000&auto=format&fit=crop',
      icon: 'Gift',
      sortOrder: 3,
      isActive: true,
    },
    {
      slug: 'home-fragrances',
      nameAr: 'معطرات المنزل',
      nameEn: 'Home Fragrances',
      descriptionAr: 'معطرات جو ومفارش فاخرة تعبق بالدفء والأناقة وتملأ أركان منزلك بالسكينة.',
      descriptionEn: 'Exquisite room sprays and linen mists infusing your living space with royal elegance.',
      image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?q=80&w=1000&auto=format&fit=crop',
      icon: 'Home',
      sortOrder: 4,
      isActive: true,
    },
    {
      slug: 'body-splash',
      nameAr: 'البادي سبلاش',
      nameEn: 'Body Splash',
      descriptionAr: 'رذاذ للجسم منعش ومثري بخلاصات عطرية لطيفة تمنحك إشراقة وانتعاشاً مستمراً.',
      descriptionEn: 'Refreshing body mists formulated with skin-nourishing botanical extracts.',
      image: 'https://images.unsplash.com/photo-1528740561666-dc2479dc08ab?q=80&w=1000&auto=format&fit=crop',
      icon: 'Droplets',
      sortOrder: 5,
      isActive: true,
    },
    {
      slug: 'makhmariyat',
      nameAr: 'المخمريات',
      nameEn: 'Makhmariyat',
      descriptionAr: 'مخمريات شعر وجسم تقليدية غنية بالمسك والزعفران والعنبر لترطيب ونعومة فائقة.',
      descriptionEn: 'Traditional velvet makhmariyat for hair and body infused with musk and amber.',
      image: 'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?q=80&w=1000&auto=format&fit=crop',
      icon: 'HeartHandshake',
      sortOrder: 6,
      isActive: true,
    },
  ];

  const categoryMap = {};
  for (const cat of categoriesData) {
    const upserted = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    });
    categoryMap[cat.slug] = upserted.id;
  }
  console.log('✅ Seeded 6 core categories');

  // 3. Seed Products with Variants & Sizes
  const productsData = [
    // --- Perfumes: For Him ---
    {
      slug: 'rawaei-royal-black',
      nameAr: 'عطر رويال بلاك الملكي',
      nameEn: 'Royal Black Eau De Parfum',
      descriptionAr: 'عطر رجالي استثنائي يعكس الهيبة والفخامة. يبدأ بنفحات الحمضيات الإيطالية وينتقل لقلب من التوابل الدافئة وقاعدة عميقة من خشب العود والجلود الفاخرة.',
      descriptionEn: 'An authoritative masculine scent opening with Italian citrus, warming into rich spices and resting on smoked agarwood and Tuscan leather.',
      price: 485,
      compareAtPrice: 620,
      costPrice: 200,
      sku: 'RW-PRF-001',
      stock: 45,
      volumeMl: 100,
      gender: 'HIM',
      scentFamily: 'Woody Oriental',
      topNotes: 'البرغموت الإيطالي، الفلفل الأسود، الهيل الغواتيمالي',
      heartNotes: 'اللافندر الفرنسي، أخشاب الأرز، الباتشولي الإندونيسي',
      baseNotes: 'خشب العود المعتّق، الجلود المدبوغة، نجيل الهند، العنبر الرمادي',
      longevity: '18-24 ساعة',
      sillage: 'قوي ونفاذ',
      isFeatured: true,
      categoryId: categoryMap['perfumes'],
      images: [
        'https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1000&auto=format&fit=crop',
      ],
      sizes: [
        { sizeMl: 50, price: 340, comparePrice: 420, stock: 20 },
        { sizeMl: 100, price: 485, comparePrice: 620, stock: 45, isDefault: true },
        { sizeMl: 150, price: 620, comparePrice: 790, stock: 15 },
      ],
    },
    {
      slug: 'sovereign-leather',
      nameAr: 'عطر سوفرين ليذر',
      nameEn: 'Sovereign Leather Extrait',
      descriptionAr: 'عطر رجالي نخبوي يحاكي سحر الليل وسروج الخيول الأصيلة، ممزوج بعبير الهيل والتوت البري مع نفحات التبغ الكوبي الفاخر.',
      descriptionEn: 'Sophisticated masculine leather extrait blended with wild berries, cardamom, and Cuban tobacco leaf.',
      price: 520,
      compareAtPrice: 690,
      costPrice: 230,
      sku: 'RW-PRF-002',
      stock: 30,
      volumeMl: 100,
      gender: 'HIM',
      scentFamily: 'Leather & Smoke',
      topNotes: 'الهيل الذهبي، توت العرعر، الزعفران الكشميري',
      heartNotes: 'الجلود الفاخرة، زهرة السوسن، الميرمية',
      baseNotes: 'التبغ الداكن، الباتشولي، أخشاب الغاياك، الطحلب الإيرلندي',
      longevity: '24 ساعة',
      sillage: 'جذاب وقوي',
      isFeatured: true,
      categoryId: categoryMap['perfumes'],
      images: [
        'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=1000&auto=format&fit=crop',
      ],
      sizes: [
        { sizeMl: 50, price: 380, comparePrice: 490, stock: 15 },
        { sizeMl: 100, price: 520, comparePrice: 690, stock: 30, isDefault: true },
      ],
    },

    // --- Perfumes: For Her ---
    {
      slug: 'rose-imperial-gold',
      nameAr: 'عطر روز إمبريال جولد',
      nameEn: 'Rose Impérial Gold',
      descriptionAr: 'عطر نسائي ساحر يحتفي بأنوثة طاغية. باقة نادرة من الورد الجوري والياسمين الدمشقي مع لمسات الفانيليا الملغاشية والمسك الأبيض المخملي.',
      descriptionEn: 'A magnificent feminine masterpiece woven of Damask Rose, Turkish Jasmine, Bourbon Vanilla and velvet white musk.',
      price: 460,
      compareAtPrice: 580,
      costPrice: 190,
      sku: 'RW-PRF-003',
      stock: 50,
      volumeMl: 100,
      gender: 'HER',
      scentFamily: 'Floral Amber',
      topNotes: 'الكمثرى الفرنسية، اليوسفي الصقلي، الفلفل الوردي',
      heartNotes: 'الورد الدمشقي، زهر البرتقال، السوسن الفلورنسي',
      baseNotes: 'فانيليا بوربون، المسك الأبيض، حبوب التونكا، خشب الصندل السريلانكي',
      longevity: '16-20 ساعة',
      sillage: 'أنثوي فواح وساحر',
      isFeatured: true,
      categoryId: categoryMap['perfumes'],
      images: [
        'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=1000&auto=format&fit=crop',
      ],
      sizes: [
        { sizeMl: 50, price: 320, comparePrice: 410, stock: 25 },
        { sizeMl: 100, price: 460, comparePrice: 580, stock: 50, isDefault: true },
      ],
    },
    {
      slug: 'velvet-orchid-noir',
      nameAr: 'عطر فيلفيت أوركيد نوار',
      nameEn: 'Velvet Orchid Noir',
      descriptionAr: 'عطر نسائي مفعم بالجاذبية والغموض. يمزج بين الأوركيد الأسود وزهرة اللوتس وحبوب الكاكاو الغنية ولمسة ترف دافئة من الباتشولي.',
      descriptionEn: 'Intensely seductive and mysterious feminine fragrance marrying black orchid, dark cocoa beans, and warm patchouli.',
      price: 495,
      compareAtPrice: 640,
      costPrice: 210,
      sku: 'RW-PRF-004',
      stock: 40,
      volumeMl: 100,
      gender: 'HER',
      scentFamily: 'Oriental Floral',
      topNotes: 'الكشمش الأسود، الكمأة السوداء، البرغموت المشرق',
      heartNotes: 'الأوركيد الأسود، اللوتس الذهبي، التوابل الزهرية',
      baseNotes: 'الشوكولاتة المرة، الباتشولي، العنبر الدافئ، خشب الصندل',
      longevity: '20 ساعة',
      sillage: 'جذاب ومغناطيسي',
      isFeatured: true,
      categoryId: categoryMap['perfumes'],
      images: [
        'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?q=80&w=1000&auto=format&fit=crop',
      ],
      sizes: [
        { sizeMl: 50, price: 350, comparePrice: 450, stock: 20 },
        { sizeMl: 100, price: 495, comparePrice: 640, stock: 40, isDefault: true },
      ],
    },

    // --- Perfumes: Unisex ---
    {
      slug: 'rawaei-pure-amber',
      nameAr: 'عطر روائع بيور عنبر',
      nameEn: 'Rawaei Pure Amber',
      descriptionAr: 'أيقونة متجر روائع للعطور. تحفة عطرية للجنسين تجمع بين أدفأ درجات العنبر البحري والعود الملكي والزعفران الإيراني في تناغم ملكي مهيب.',
      descriptionEn: 'The flagship signature unisex scent uniting opulent Baltic amber, royal Cambodian oud, and golden Iranian saffron.',
      price: 580,
      compareAtPrice: 750,
      costPrice: 250,
      sku: 'RW-PRF-005',
      stock: 60,
      volumeMl: 100,
      gender: 'UNISEX',
      scentFamily: 'Amber Woody',
      topNotes: 'الزعفران الملكي، الجريب فروت الوردي، جوزة الطيب',
      heartNotes: 'العنبر الكهرماني، الجلود الناعمة، البخور الفاخر',
      baseNotes: 'دهن العود المعتّق، المسك الأسود، خشب الأرز الأطلسي',
      longevity: '24+ ساعة',
      sillage: 'ملكي واسع الانتشار',
      isFeatured: true,
      categoryId: categoryMap['perfumes'],
      images: [
        'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=1000&auto=format&fit=crop',
      ],
      sizes: [
        { sizeMl: 50, price: 410, comparePrice: 530, stock: 30 },
        { sizeMl: 100, price: 580, comparePrice: 750, stock: 60, isDefault: true },
        { sizeMl: 200, price: 920, comparePrice: 1190, stock: 15 },
      ],
    },
    {
      slug: 'oud-smoke-unisex',
      nameAr: 'عطر سموك عود الفاخر',
      nameEn: 'Smoked Oud Prestige',
      descriptionAr: 'عطر للجنسين يحبس الأنفاس بفضل توليفته الدخانية التي تمتزج مع الكراميل والعود السيلاني واللبان الحوجري العماني.',
      descriptionEn: 'A hypnotic unisex composition of aromatic smoke, roasted caramel, Ceylon agarwood, and Hojari frankincense.',
      price: 540,
      compareAtPrice: 710,
      costPrice: 240,
      sku: 'RW-PRF-006',
      stock: 35,
      volumeMl: 100,
      gender: 'UNISEX',
      scentFamily: 'Oriental Smoky',
      topNotes: 'اللبان الحوجري، حبوب الهيل، الفلفل الحلو',
      heartNotes: 'الكراميل الدافئ، خشب الكشمير، زهرة البنفسج',
      baseNotes: 'العود الدخاني، خشب الصندل، المسك الحيواني، العنبر',
      longevity: '24 ساعة',
      sillage: 'ثقيل وفاخر',
      isFeatured: true,
      categoryId: categoryMap['perfumes'],
      images: [
        'https://images.unsplash.com/photo-1547887537-6158d64c35b3?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=1000&auto=format&fit=crop',
      ],
      sizes: [
        { sizeMl: 50, price: 390, comparePrice: 510, stock: 15 },
        { sizeMl: 100, price: 540, comparePrice: 710, stock: 35, isDefault: true },
      ],
    },

    // --- Category: Oud & Incense ---
    {
      slug: 'royal-marooki-oud-wood',
      nameAr: 'خشب عود مروكي ملكي سوبر مرتفع',
      nameEn: 'Royal Marooki Super Oud Wood',
      descriptionAr: 'أوقية من أفخر أنواع العود المروكي الإندونيسي الطبيعي 100%، نكهة سويتية بخورية فخمة تزبد بكثافة على الجمر وتدوم لأيام.',
      descriptionEn: 'Premium 100% natural Indonesian Royal Marooki agarwood chips, rich in natural resin creating a dense sweet royal smoke.',
      price: 390,
      compareAtPrice: 520,
      costPrice: 180,
      sku: 'RW-OUD-001',
      stock: 40,
      volumeMl: 30, // Tola / Ounce representation
      gender: 'UNISEX',
      scentFamily: 'Oud & Incense',
      topNotes: 'عبير بخوري نقي',
      heartNotes: 'راتنج العود المشبع',
      baseNotes: 'نكهة ترابية زعفرانية باردة',
      longevity: 'ثبات يدوم لأيام في المكان والملابس',
      sillage: 'واسع الانتشار',
      isFeatured: true,
      categoryId: categoryMap['oud-incense'],
      images: [
        'https://images.unsplash.com/photo-1547887537-6158d64c35b3?q=80&w=1000&auto=format&fit=crop',
      ],
      sizes: [
        { sizeMl: 30, price: 390, comparePrice: 520, stock: 40, isDefault: true },
        { sizeMl: 60, price: 720, comparePrice: 950, stock: 20 },
      ],
    },
    {
      slug: 'aged-cambodian-dehn-oud',
      nameAr: 'دهن عود كمبودي قديم معتق',
      nameEn: 'Aged Cambodian Dehn El Oud',
      descriptionAr: 'ربع تولة من أنقى دهن العود الكمبودي المعتق لأكثر من 15 عاماً، يتميز برائحة خشبية زهرية سويتية تأسر الحواس.',
      descriptionEn: 'Quarter tola of 15-year aged vintage Cambodian dehn el oud, distinguished by sweet woody floral notes.',
      price: 750,
      compareAtPrice: 990,
      costPrice: 380,
      sku: 'RW-OUD-002',
      stock: 25,
      volumeMl: 12,
      gender: 'UNISEX',
      scentFamily: 'Aged Pure Oud',
      topNotes: 'نوتات عسلية معتقة',
      heartNotes: 'خشب العود الكمبودي النادر',
      baseNotes: 'عنبر وخشب الصندل الدافئ',
      longevity: 'ثبات على الجلد يتجاوز 48 ساعة',
      sillage: 'فواح وأصيل',
      isFeatured: true,
      categoryId: categoryMap['oud-incense'],
      images: [
        'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?q=80&w=1000&auto=format&fit=crop',
      ],
      sizes: [
        { sizeMl: 12, price: 750, comparePrice: 990, stock: 25, isDefault: true },
      ],
    },

    // --- Category: Sets & Gifts ---
    {
      slug: 'royal-gold-gift-box',
      nameAr: 'صندوق الهدايا الملكي جولد',
      nameEn: 'Royal Gold Gift Collection',
      descriptionAr: 'بوكس إهداء فاخر مكسو بالمخمل الأسود واللمسات الذهبية، يضم عطرين فاخرين سعة 100 مل + ربع تولة دهن عود معتق + أوقية مروكي سوبر.',
      descriptionEn: 'The supreme royal gift box in black velvet and gold leaf accents containing 2 full EDP perfumes, aged oud oil and agarwood.',
      price: 1150,
      compareAtPrice: 1450,
      costPrice: 550,
      sku: 'RW-SET-001',
      stock: 20,
      volumeMl: 250,
      gender: 'UNISEX',
      scentFamily: 'Luxury Gift Set',
      topNotes: 'مزيج العطور الملكية والعود',
      heartNotes: 'ورد وعنبر وزعفران',
      baseNotes: 'أخشاب العود الملكية والمسك الأصيل',
      longevity: 'فخامة تدوم طويلاً',
      sillage: 'استثنائي ومبهر',
      isFeatured: true,
      categoryId: categoryMap['sets-gifts'],
      images: [
        'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=1000&auto=format&fit=crop',
      ],
      sizes: [
        { sizeMl: 250, price: 1150, comparePrice: 1450, stock: 20, isDefault: true },
      ],
    },

    // --- Category: Home Fragrances ---
    {
      slug: 'rawaei-atmosphere-diffuser',
      nameAr: 'معطر القصور الملكي للمنزل والمفارش',
      nameEn: 'Palace Royale Home Atmosphere Spray',
      descriptionAr: 'معطر فاخر للمفارش والمنازل يعبق بنفحات البخور واللافندر الملكي وخشب الصندل لينشر هالة من النقاء والسكينة في الأجواء.',
      descriptionEn: 'Sumptuous linen and home atmosphere mist exuding royal frankincense, French lavender, and soothing sandalwood.',
      price: 165,
      compareAtPrice: 220,
      costPrice: 60,
      sku: 'RW-HOM-001',
      stock: 80,
      volumeMl: 500,
      gender: 'UNISEX',
      scentFamily: 'Fresh Oriental',
      topNotes: 'اللافندر الفرنسي، أزهار البرتقال',
      heartNotes: 'اللبان العماني، ماء الورد',
      baseNotes: 'خشب الصندل، المسك الأبيض',
      longevity: 'يدوم في الأثاث والمفارش 48 ساعة',
      sillage: 'منعش ومريح',
      isFeatured: false,
      categoryId: categoryMap['home-fragrances'],
      images: [
        'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?q=80&w=1000&auto=format&fit=crop',
      ],
      sizes: [
        { sizeMl: 500, price: 165, comparePrice: 220, stock: 80, isDefault: true },
      ],
    },

    // --- Category: Body Splash ---
    {
      slug: 'amber-blossom-body-splash',
      nameAr: 'بادي سبلاش عنبر بلوسوم المنعش',
      nameEn: 'Amber Blossom Refreshing Body Splash',
      descriptionAr: 'رذاذ معطر للجسم غني بالألوفيرا وفيتامين E، يمنح البشرة ترطيباً ناعماً وشذى عطرياً يفيض بنفحات العنبر وزهر الكرز.',
      descriptionEn: 'Nourishing botanical body splash enriched with Aloe Vera, Vitamin E, luminous amber, and cherry blossom.',
      price: 135,
      compareAtPrice: 180,
      costPrice: 45,
      sku: 'RW-BOD-001',
      stock: 90,
      volumeMl: 250,
      gender: 'HER',
      scentFamily: 'Floral Amber Mist',
      topNotes: 'الكرز الياباني، البرتقال الدموي',
      heartNotes: 'زهر الماغنوليا، الفاوانيا الوردية',
      baseNotes: 'العنبر الذهبي، المسك الناعم',
      longevity: '6-8 ساعات',
      sillage: 'ناعم ومنعش',
      isFeatured: false,
      categoryId: categoryMap['body-splash'],
      images: [
        'https://images.unsplash.com/photo-1528740561666-dc2479dc08ab?q=80&w=1000&auto=format&fit=crop',
      ],
      sizes: [
        { sizeMl: 250, price: 135, comparePrice: 180, stock: 90, isDefault: true },
      ],
    },

    // --- Category: Makhmariyat ---
    {
      slug: 'royal-silk-makhmariya',
      nameAr: 'مخمرية الحرير الملكية للشعر والجسم',
      nameEn: 'Royal Silk Makhmariya for Hair & Body',
      descriptionAr: 'مخمرية تقليدية بقوام كريمي حريري فاخر خالية من الكحول، معطرة بمسك الغزال والزعفران والعود لتعطير خصلات الشعر والنبضات بنعومة لا تضاهى.',
      descriptionEn: 'Alcohol-free velvet makhmariya infused with deer musk, saffron, and natural oils for luxurious hair and body hydration.',
      price: 195,
      compareAtPrice: 260,
      costPrice: 70,
      sku: 'RW-MAK-001',
      stock: 65,
      volumeMl: 50,
      gender: 'HER',
      scentFamily: 'Velvet Musk',
      topNotes: 'المسك الحريري، الزعفران الأبيض',
      heartNotes: 'زيت اللوز الحلو، دهن الورد البلغاري',
      baseNotes: 'العنبر الشفاف، خشب الصندل الناعم',
      longevity: 'يدوم على الشعر والجسم طوال اليوم',
      sillage: 'حميمي وجذاب',
      isFeatured: true,
      categoryId: categoryMap['makhmariyat'],
      images: [
        'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?q=80&w=1000&auto=format&fit=crop',
      ],
      sizes: [
        { sizeMl: 50, price: 195, comparePrice: 260, stock: 65, isDefault: true },
      ],
    },
  ];

  for (const item of productsData) {
    const { images, sizes, ...prodData } = item;
    const product = await prisma.product.upsert({
      where: { slug: prodData.slug },
      update: prodData,
      create: prodData,
    });

    // Delete existing images & sizes before re-adding
    await prisma.productImage.deleteMany({ where: { productId: product.id } });
    for (let i = 0; i < images.length; i++) {
      await prisma.productImage.create({
        data: {
          productId: product.id,
          url: images[i],
          alt: product.nameAr,
          isMain: i === 0,
          sortOrder: i,
        },
      });
    }

    await prisma.productSize.deleteMany({ where: { productId: product.id } });
    for (const size of sizes) {
      await prisma.productSize.create({
        data: {
          productId: product.id,
          sizeMl: size.sizeMl,
          price: size.price,
          comparePrice: size.comparePrice || null,
          stock: size.stock,
          isDefault: size.isDefault || false,
        },
      });
    }

    // Connect to FeaturedProducts if isFeatured
    if (product.isFeatured) {
      await prisma.featuredProduct.upsert({
        where: { productId: product.id },
        update: { isActive: true },
        create: {
          productId: product.id,
          sortOrder: 1,
          isActive: true,
        },
      });
    }
  }
  console.log(`✅ Seeded ${productsData.length} products with multiple sizes and high-res imagery`);

  // 4. Seed Banners (Hero Banner + Promotional Banners)
  // Hero Banner: Supports SLIDESHOW, STATIC, and VIDEO
  const heroBanner = await prisma.banner.upsert({
    where: { id: 'hero-main-banner' },
    update: {
      type: 'HERO',
      mode: 'SLIDESHOW', // Default mode: SLIDESHOW (can be switched to STATIC or VIDEO from Admin)
      titleAr: 'روائع للعطور – الفخامة في كل قطرة',
      titleEn: 'RAWAEI PERFUMES – Royal Elegance In Every Drop',
      subtitleAr: 'اكتشف مجموعتنا الحصرية لعام 2026 المستوحاة من سحر الشرق وأناقة باريس',
      subtitleEn: 'Discover our 2026 exclusive collections inspired by oriental mystique and Parisian finesse',
      desktopImage: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=1920&auto=format&fit=crop',
      mobileImage: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=800&auto=format&fit=crop',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-perfume-bottle-and-flowers-under-water-43306-large.mp4',
      autoplaySpeed: 5000,
      isActive: true,
      sortOrder: 1,
    },
    create: {
      id: 'hero-main-banner',
      type: 'HERO',
      mode: 'SLIDESHOW',
      titleAr: 'روائع للعطور – الفخامة في كل قطرة',
      titleEn: 'RAWAEI PERFUMES – Royal Elegance In Every Drop',
      subtitleAr: 'اكتشف مجموعتنا الحصرية لعام 2026 المستوحاة من سحر الشرق وأناقة باريس',
      subtitleEn: 'Discover our 2026 exclusive collections inspired by oriental mystique and Parisian finesse',
      desktopImage: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=1920&auto=format&fit=crop',
      mobileImage: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=800&auto=format&fit=crop',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-perfume-bottle-and-flowers-under-water-43306-large.mp4',
      autoplaySpeed: 5000,
      isActive: true,
      sortOrder: 1,
    },
  });

  // Slides for the Hero Banner
  await prisma.bannerSlide.deleteMany({ where: { bannerId: heroBanner.id } });
  const slides = [
    {
      bannerId: heroBanner.id,
      titleAr: 'مجموعة العود الملكي 2026',
      titleEn: 'Royal Oud Collection 2026',
      subtitleAr: 'أندر خلاصات العود المعتّق وخشب المروكي الطبيعي لتجربة عطرية لا تُنسى',
      subtitleEn: 'Rare aged oud essences and natural agarwood for an unforgettable signature presence',
      desktopImage: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?q=80&w=1920&auto=format&fit=crop',
      mobileImage: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?q=80&w=800&auto=format&fit=crop',
      link: '/category/oud-incense',
      buttonTextAr: 'اكتشف المجموعة',
      buttonTextEn: 'Discover Collection',
      durationSeconds: 5,
      sortOrder: 1,
      isActive: true,
    },
    {
      bannerId: heroBanner.id,
      titleAr: 'عطر رويال بلاك – رجالي',
      titleEn: 'Royal Black Eau De Parfum – For Him',
      subtitleAr: 'هيبة الحضور وثقة القيادة بنفحات الباتشولي والجلود والعود',
      subtitleEn: 'Commanding presence and masculine poise with Tuscan leather and smokey cedar',
      desktopImage: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=1920&auto=format&fit=crop',
      mobileImage: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=800&auto=format&fit=crop',
      link: '/perfumes/for-him',
      buttonTextAr: 'تسوق للرجال',
      buttonTextEn: 'Shop For Him',
      durationSeconds: 5,
      sortOrder: 2,
      isActive: true,
    },
    {
      bannerId: heroBanner.id,
      titleAr: 'سحر الورد الدمشقي – نسائي',
      titleEn: 'Rose Impérial Gold – For Her',
      subtitleAr: 'أنوثة ملكية ساحرة ونعومة تفيض بنفحات الفانيليا والمسك المخملي',
      subtitleEn: 'Supreme feminine grace layered in rare Damask rose and Bourbon vanilla',
      desktopImage: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?q=80&w=1920&auto=format&fit=crop',
      mobileImage: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?q=80&w=800&auto=format&fit=crop',
      link: '/perfumes/for-her',
      buttonTextAr: 'تسوق للنساء',
      buttonTextEn: 'Shop For Her',
      durationSeconds: 5,
      sortOrder: 3,
      isActive: true,
    },
  ];

  for (const s of slides) {
    await prisma.bannerSlide.create({ data: s });
  }

  // Promotional Banners Section: 1 Wide Banner + 2 Smaller Banners
  await prisma.banner.upsert({
    where: { id: 'promo-wide-banner' },
    update: {
      type: 'PROMO_WIDE',
      titleAr: 'عرض الموسم: صندوق الهدايا الملكي',
      titleEn: 'Season Special: Royal Luxury Gift Box',
      subtitleAr: 'خصم استثنائي 20% عند شراء أي باقة إهداء فاخرة مع تغليف مجاني مذهب',
      subtitleEn: 'Exclusive 20% off on all luxury gift sets with complimentary gold gifting wrap',
      desktopImage: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=1200&auto=format&fit=crop',
      mobileImage: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=700&auto=format&fit=crop',
      link: '/category/sets-gifts',
      buttonTextAr: 'احصل على العرض',
      buttonTextEn: 'Claim Offer',
      isActive: true,
      sortOrder: 1,
    },
    create: {
      id: 'promo-wide-banner',
      type: 'PROMO_WIDE',
      titleAr: 'عرض الموسم: صندوق الهدايا الملكي',
      titleEn: 'Season Special: Royal Luxury Gift Box',
      subtitleAr: 'خصم استثنائي 20% عند شراء أي باقة إهداء فاخرة مع تغليف مجاني مذهب',
      subtitleEn: 'Exclusive 20% off on all luxury gift sets with complimentary gold gifting wrap',
      desktopImage: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=1200&auto=format&fit=crop',
      mobileImage: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=700&auto=format&fit=crop',
      link: '/category/sets-gifts',
      buttonTextAr: 'احصل على العرض',
      buttonTextEn: 'Claim Offer',
      isActive: true,
      sortOrder: 1,
    },
  });

  await prisma.banner.upsert({
    where: { id: 'promo-small-banner-1' },
    update: {
      type: 'PROMO_SMALL_1',
      titleAr: 'المخمريات الملكية',
      titleEn: 'Royal Makhmariyat',
      subtitleAr: 'ترطيب وتعطير حريري مخملي للشعر والجسم',
      subtitleEn: 'Velvet silk hair and body hydration',
      desktopImage: 'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?q=80&w=600&auto=format&fit=crop',
      mobileImage: 'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?q=80&w=600&auto=format&fit=crop',
      link: '/category/makhmariyat',
      buttonTextAr: 'تسوق الآن',
      buttonTextEn: 'Shop Now',
      isActive: true,
      sortOrder: 2,
    },
    create: {
      id: 'promo-small-banner-1',
      type: 'PROMO_SMALL_1',
      titleAr: 'المخمريات الملكية',
      titleEn: 'Royal Makhmariyat',
      subtitleAr: 'ترطيب وتعطير حريري مخملي للشعر والجسم',
      subtitleEn: 'Velvet silk hair and body hydration',
      desktopImage: 'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?q=80&w=600&auto=format&fit=crop',
      mobileImage: 'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?q=80&w=600&auto=format&fit=crop',
      link: '/category/makhmariyat',
      buttonTextAr: 'تسوق الآن',
      buttonTextEn: 'Shop Now',
      isActive: true,
      sortOrder: 2,
    },
  });

  await prisma.banner.upsert({
    where: { id: 'promo-small-banner-2' },
    update: {
      type: 'PROMO_SMALL_2',
      titleAr: 'معطرات المنزل والمفارش',
      titleEn: 'Home Atmosphere Sprays',
      subtitleAr: 'أجواء مفعمة بالدفء والنقاء الفندقي الفاخر',
      subtitleEn: 'Hotel-grade aromatic purity for your living spaces',
      desktopImage: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?q=80&w=600&auto=format&fit=crop',
      mobileImage: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?q=80&w=600&auto=format&fit=crop',
      link: '/category/home-fragrances',
      buttonTextAr: 'استكشف الروائح',
      buttonTextEn: 'Explore Scents',
      isActive: true,
      sortOrder: 3,
    },
    create: {
      id: 'promo-small-banner-2',
      type: 'PROMO_SMALL_2',
      titleAr: 'معطرات المنزل والمفارش',
      titleEn: 'Home Atmosphere Sprays',
      subtitleAr: 'أجواء مفعمة بالدفء والنقاء الفندقي الفاخر',
      subtitleEn: 'Hotel-grade aromatic purity for your living spaces',
      desktopImage: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?q=80&w=600&auto=format&fit=crop',
      mobileImage: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?q=80&w=600&auto=format&fit=crop',
      link: '/category/home-fragrances',
      buttonTextAr: 'استكشف الروائح',
      buttonTextEn: 'Explore Scents',
      isActive: true,
      sortOrder: 3,
    },
  });

  console.log('✅ Seeded hero and promotional banners with 3 modes and responsive dimensions');

  // 5. Seed Coupons
  const coupons = [
    {
      code: 'WELCOME10',
      discountType: 'PERCENTAGE',
      discountValue: 10,
      minOrderValue: 200,
      maxDiscount: 100,
      usageLimit: 500,
      isActive: true,
    },
    {
      code: 'ROWAEI20',
      discountType: 'PERCENTAGE',
      discountValue: 20,
      minOrderValue: 500,
      maxDiscount: 200,
      usageLimit: 200,
      isActive: true,
    },
    {
      code: 'GOLD50',
      discountType: 'FIXED',
      discountValue: 50,
      minOrderValue: 350,
      usageLimit: 300,
      isActive: true,
    },
  ];

  for (const c of coupons) {
    await prisma.coupon.upsert({
      where: { code: c.code },
      update: c,
      create: c,
    });
  }
  console.log('✅ Seeded discount coupons');

  // 6. Seed Shipping Methods
  const shippingMethods = [
    {
      id: 'ship-standard',
      nameAr: 'توصيل قياسي سريع (خلال 2-4 أيام عمل)',
      nameEn: 'Fast Standard Shipping (2-4 business days)',
      cost: 25,
      estimatedDays: '2-4 أيام عمل',
      freeShippingAbove: 350,
      isActive: true,
      sortOrder: 1,
    },
    {
      id: 'ship-express',
      nameAr: 'توصيل فوري VIP في نفس اليوم (الرياض وجدة)',
      nameEn: 'VIP Same-Day Express (Riyadh & Jeddah)',
      cost: 45,
      estimatedDays: 'نفس اليوم',
      freeShippingAbove: 600,
      isActive: true,
      sortOrder: 2,
    },
    {
      id: 'ship-gulf',
      nameAr: 'شحن دولي لدول الخليج (خلال 4-7 أيام)',
      nameEn: 'Gulf Countries Express Shipping (4-7 days)',
      cost: 75,
      estimatedDays: '4-7 أيام',
      freeShippingAbove: 900,
      isActive: true,
      sortOrder: 3,
    },
  ];

  for (const sm of shippingMethods) {
    await prisma.shippingMethod.upsert({
      where: { id: sm.id },
      update: sm,
      create: sm,
    });
  }
  console.log('✅ Seeded shipping methods');

  // 7. Seed CMS Pages
  const pages = [
    {
      slug: 'about-us',
      titleAr: 'قصة روائع للعطور',
      titleEn: 'About RAWAEI PERFUMES',
      contentAr: `
        <h3>فلسفتنا في صناعة العطور الملكية</h3>
        <p>تأسست علامة "روائع للعطور" لتكون عنواناً للأناقة الاستثنائية والذوق الرفيع. نحن نمزج بين عراقة التراث العطري الشرقي الأصيل، وأحدث ما توصلت إليه صناعة العطور الفرنسية الفاخرة في مدينة غراس.</p>
        <p>كل قطرة في زجاجاتنا تحكي قصة من الشغف والدقة؛ حيث ننتقي أندر أخشاب العود الطبيعي المعتق، وأجود أنواع الورد والمسك والعنبر، لنقدم لكم تجارب عطرية متفردة تبقى في الذاكرة.</p>
      `,
      contentEn: `
        <h3>Our Fragrance Philosophy</h3>
        <p>RAWAEI PERFUMES was born to embody unparalleled nobility and sublime taste. We intertwine the timeless traditions of authentic Eastern perfumery with the cutting-edge alchemy of French Haute Parfumerie from Grasse.</p>
        <p>Every single drop is a testament to dedication and mastery; sourcing only the finest aged agarwood, Damask roses, and pure ambers to deliver majestic aromatic experiences.</p>
      `,
      isActive: true,
    },
    {
      slug: 'privacy-policy',
      titleAr: 'سياسة الخصوصية والأمان',
      titleEn: 'Privacy & Security Policy',
      contentAr: `
        <p>نحن في "روائع للعطور" نولي سرية وخصوصية بيانات عملائنا الكرام أقصى درجات الاهتمام. نلتزم بأعلى معايير التشفير والأمان لحماية معلوماتكم الشخصية ومعاملاتكم المالية.</p>
      `,
      contentEn: `
        <p>At RAWAEI PERFUMES, client confidentiality is paramount. We deploy state-of-the-art encryption protocols to safeguard your personal identity and transactional security.</p>
      `,
      isActive: true,
    },
    {
      slug: 'terms-and-conditions',
      titleAr: 'الشروط والأحكام',
      titleEn: 'Terms and Conditions',
      contentAr: `
        <p>تسري هذه الشروط على جميع عمليات الشراء والطلبات المنفذة عبر متجر روائع للعطور. جميع المنتجات أصلية ومضمونة 100%.</p>
      `,
      contentEn: `
        <p>These terms govern all orders placed on RAWAEI PERFUMES online boutique. All items are 100% guaranteed authentic and pristine.</p>
      `,
      isActive: true,
    },
    {
      slug: 'shipping-returns',
      titleAr: 'الشحن والإرجاع والاستبدال',
      titleEn: 'Shipping & Returns Policy',
      contentAr: `
        <p>نوفر خدمة التوصيل السريع لجميع مناطق المملكة ودول الخليج. يُتاح الاسترجاع أو الاستبدال في حال وجود أي عيب مصنعي خلال 7 أيام من تاريخ الاستلام مع الحفاظ على التغليف الأصلي.</p>
      `,
      contentEn: `
        <p>We deliver seamlessly across Saudi Arabia and the GCC. Returns or replacements are accepted within 7 days of delivery in pristine original packaging.</p>
      `,
      isActive: true,
    },
  ];

  for (const p of pages) {
    await prisma.page.upsert({
      where: { slug: p.slug },
      update: p,
      create: p,
    });
  }
  console.log('✅ Seeded CMS Pages');

  // 8. Seed Site Settings (Visual Identity & General Info)
  const settings = [
    { key: 'site_name_ar', value: 'روائع للعطور', group: 'general' },
    { key: 'site_name_en', value: 'RAWAEI PERFUMES', group: 'general' },
    { key: 'tagline_ar', value: 'الفخامة في كل قطرة عطر', group: 'general' },
    { key: 'tagline_en', value: 'Royal Luxury in Every Drop', group: 'general' },
    { key: 'contact_phone', value: '+966501234567', group: 'general' },
    { key: 'contact_whatsapp', value: '+966501234567', group: 'general' },
    { key: 'contact_email', value: 'info@rawaei.com', group: 'general' },
    { key: 'contact_address_ar', value: 'المملكة العربية السعودية، الرياض - طريق التخصصي، برج العطور', group: 'general' },
    { key: 'contact_address_en', value: 'Takhassusi St, Fragrance Tower, Riyadh, Saudi Arabia', group: 'general' },
    { key: 'currency', value: 'SAR', group: 'general' },
    { key: 'currency_symbol_ar', value: 'ر.س', group: 'general' },
    { key: 'tax_rate_percent', value: '15', group: 'general' },
    { key: 'announcement_bar_ar', value: '✨ شحن مجاني لكافة مدن المملكة للطلبات فوق 350 ريال | كود الخصم: WELCOME10 ✨', group: 'identity' },
    { key: 'announcement_bar_en', value: '✨ Free Nationwide Delivery for orders above 350 SAR | Coupon: WELCOME10 ✨', group: 'identity' },
    { key: 'announcement_active', value: 'true', group: 'identity' },
    { key: 'primary_gold', value: '#C49A45', group: 'identity' },
    { key: 'dark_gold', value: '#98702B', group: 'identity' },
    { key: 'social_instagram', value: 'https://instagram.com/rawaeiperfumes', group: 'social' },
    { key: 'social_facebook', value: 'https://facebook.com/rawaeiperfumes', group: 'social' },
    { key: 'social_tiktok', value: 'https://tiktok.com/@rawaeiperfumes', group: 'social' },
    { key: 'social_snapchat', value: 'https://snapchat.com/add/rawaei', group: 'social' },
    { key: 'featured_section_title_ar', value: 'المختارات الملكية الأكثر تميزاً', group: 'featured' },
    { key: 'featured_section_title_en', value: 'Featured Royal Masterpieces', group: 'featured' },
    { key: 'featured_section_subtitle_ar', value: 'نخبة من أروع المنتجات المصممة لأصحاب الذوق الرفيع والباحثين عن التفرد', group: 'featured' },
    { key: 'featured_section_subtitle_en', value: 'A curated hand-picked selection for true connoisseurs of luxury fragrance', group: 'featured' },
    { key: 'featured_section_active', value: 'true', group: 'featured' },
    { key: 'featured_products_limit', value: '8', group: 'featured' },
    { key: 'seo_meta_title', value: 'روائع للعطور – RAWAEI PERFUMES | المتجر الرسمي للعطور الفاخرة والعود', group: 'seo' },
    { key: 'seo_meta_description', value: 'متجر روائع للعطور، أفخم العطور الشرقية والفرنسية، العود المعتّق، البخور المروكي، ومجموعات الهدايا الملكية مع توصيل سريع في المملكة والخليج.', group: 'seo' },
    { key: 'seo_keywords', value: 'عطور, روائع للعطور, دهن عود, بخور, مروكي, هدايا عطور, عطور نسائية, عطور رجالية, عطور فاخرة, الرياض, السعودية', group: 'seo' },
  ];

  for (const s of settings) {
    await prisma.siteSetting.upsert({
      where: { key: s.key },
      update: { value: s.value, group: s.group },
      create: s,
    });
  }
  console.log('✅ Seeded site settings and visual identity');

  console.log('🎉 Seeding successfully completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error during database seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
