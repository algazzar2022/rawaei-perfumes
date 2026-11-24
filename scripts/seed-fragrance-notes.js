const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Curated list of high quality fragrance notes with luxury photography images
const INITIAL_NOTES = [
  // 1. أخشاب وبخور
  {
    nameAr: 'دهن العود المعتّق',
    nameEn: 'Aged Agarwood Oud',
    category: 'أخشاب',
    image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=400&q=80',
  },
  {
    nameAr: 'خشب الصندل',
    nameEn: 'Sandalwood',
    category: 'أخشاب',
    image: 'https://images.unsplash.com/photo-1615397349754-cfa2066a298e?auto=format&fit=crop&w=400&q=80',
  },
  {
    nameAr: 'خشب الأرز الأطلسي',
    nameEn: 'Atlas Cedarwood',
    category: 'أخشاب',
    image: 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=400&q=80',
  },
  {
    nameAr: 'أخشاب الغاياك',
    nameEn: 'Guaiac Wood',
    category: 'أخشاب',
    image: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=400&q=80',
  },
  {
    nameAr: 'البخور الفاخر',
    nameEn: 'Royal Incense & Bakhoor',
    category: 'شرقي',
    image: 'https://images.unsplash.com/photo-1602928321679-560bb453f190?auto=format&fit=crop&w=400&q=80',
  },
  {
    nameAr: 'اللبان الحوجري العماني',
    nameEn: 'Omani Frankincense',
    category: 'شرقي',
    image: 'https://images.unsplash.com/photo-1528722828814-77b9b83aafb2?auto=format&fit=crop&w=400&q=80',
  },

  // 2. عنبر ومسك وجلود
  {
    nameAr: 'العنبر الكهرماني',
    nameEn: 'Warm Amber Resin',
    category: 'عنبر ومسك',
    image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=400&q=80',
  },
  {
    nameAr: 'المسك الأبيض الملكي',
    nameEn: 'Royal White Musk',
    category: 'عنبر ومسك',
    image: 'https://images.unsplash.com/photo-1519750157634-b6d493a0f77c?auto=format&fit=crop&w=400&q=80',
  },
  {
    nameAr: 'المسك الأسود',
    nameEn: 'Black Musk',
    category: 'عنبر ومسك',
    image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=400&q=80',
  },
  {
    nameAr: 'الجلود الفاخرة',
    nameEn: 'Sovereign Leather',
    category: 'جلود',
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=400&q=80',
  },
  {
    nameAr: 'التبغ الداكن المعتق',
    nameEn: 'Dark Cured Tobacco',
    category: 'جلود',
    image: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?auto=format&fit=crop&w=400&q=80',
  },

  // 3. توابل وبهارات شرقية
  {
    nameAr: 'الزعفران الملكي الكشميري',
    nameEn: 'Royal Kashmiri Saffron',
    category: 'توابل',
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=400&q=80',
  },
  {
    nameAr: 'حبوب الهيل الأخضر',
    nameEn: 'Green Cardamom',
    category: 'توابل',
    image: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=400&q=80',
  },
  {
    nameAr: 'القرفة السيلانية',
    nameEn: 'Ceylon Cinnamon',
    category: 'توابل',
    image: 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&w=400&q=80',
  },
  {
    nameAr: 'جوزة الطيب',
    nameEn: 'Nutmeg',
    category: 'توابل',
    image: 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&w=400&q=80',
  },
  {
    nameAr: 'الفلفل الأسود والوردي',
    nameEn: 'Black & Pink Pepper',
    category: 'توابل',
    image: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=400&q=80',
  },

  // 4. زهور وفانيليا
  {
    nameAr: 'الورد الطائفي الدمشقي',
    nameEn: 'Taif & Damask Rose',
    category: 'زهور',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=400&q=80',
  },
  {
    nameAr: 'زهرة السوسن الفلورنسية',
    nameEn: 'Florentine Iris',
    category: 'زهور',
    image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=400&q=80',
  },
  {
    nameAr: 'الأوركيد الأسود',
    nameEn: 'Black Orchid',
    category: 'زهور',
    image: 'https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?auto=format&fit=crop&w=400&q=80',
  },
  {
    nameAr: 'اللافندر الفرنسي',
    nameEn: 'French Lavender',
    category: 'زهور',
    image: 'https://images.unsplash.com/photo-1528183429752-a97d0bf99b5a?auto=format&fit=crop&w=400&q=80',
  },
  {
    nameAr: 'زهر البرتقال (النيرولي)',
    nameEn: 'Orange Blossom & Neroli',
    category: 'زهور',
    image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=400&q=80',
  },
  {
    nameAr: 'الياسمين الملكي',
    nameEn: 'Royal Jasmine',
    category: 'زهور',
    image: 'https://images.unsplash.com/photo-1591886960571-74d43a9d4166?auto=format&fit=crop&w=400&q=80',
  },
  {
    nameAr: 'فانيليا بوربون المدغشقرية',
    nameEn: 'Bourbon Vanilla',
    category: 'حلو وفواكه',
    image: 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&w=400&q=80',
  },
  {
    nameAr: 'حبوب التونكا المحمصة',
    nameEn: 'Roasted Tonka Bean',
    category: 'حلو وفواكه',
    image: 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&w=400&q=80',
  },
  {
    nameAr: 'الباتشولي الإندونيسي',
    nameEn: 'Indonesian Patchouli',
    category: 'أخشاب',
    image: 'https://images.unsplash.com/photo-1615397349754-cfa2066a298e?auto=format&fit=crop&w=400&q=80',
  },
  {
    nameAr: 'نجيل الهند (الفيتيفر)',
    nameEn: 'Haitian Vetiver',
    category: 'أخشاب',
    image: 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=400&q=80',
  },

  // 5. حمضيات وفواكه منعشة
  {
    nameAr: 'البرغموت الإيطالي',
    nameEn: 'Calabrian Bergamot',
    category: 'حمضيات',
    image: 'https://images.unsplash.com/photo-1582281298055-e25b84a30b0b?auto=format&fit=crop&w=400&q=80',
  },
  {
    nameAr: 'الجريب فروت الوردي',
    nameEn: 'Pink Grapefruit',
    category: 'حمضيات',
    image: 'https://images.unsplash.com/photo-1557800636-894a64c1696f?auto=format&fit=crop&w=400&q=80',
  },
  {
    nameAr: 'اليوسفي الصقلي',
    nameEn: 'Sicilian Mandarin',
    category: 'حمضيات',
    image: 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?auto=format&fit=crop&w=400&q=80',
  },
  {
    nameAr: 'الكشمش الأسود وتوت العرعر',
    nameEn: 'Blackcurrant & Juniper',
    category: 'فواكه',
    image: 'https://images.unsplash.com/photo-1498557850523-fd3d118b962e?auto=format&fit=crop&w=400&q=80',
  },
];

async function main() {
  console.log('Seeding fragrance notes library...');
  const noteMap = new Map();

  for (const n of INITIAL_NOTES) {
    let existing = await prisma.fragranceNote.findFirst({
      where: { nameAr: n.nameAr },
    });
    if (!existing) {
      existing = await prisma.fragranceNote.create({
        data: n,
      });
      console.log(`+ Created note: ${n.nameAr}`);
    } else {
      existing = await prisma.fragranceNote.update({
        where: { id: existing.id },
        data: {
          image: n.image,
          category: n.category,
          nameEn: n.nameEn,
        },
      });
      console.log(`* Updated note: ${n.nameAr}`);
    }
    noteMap.set(n.nameAr, existing);
  }

  // Helper to find note by keyword
  function findNoteId(keyword) {
    for (const [name, note] of noteMap.entries()) {
      if (name.includes(keyword) || keyword.includes(name)) return note.id;
    }
    // partial keyword match
    for (const [name, note] of noteMap.entries()) {
      const parts = keyword.split(' ');
      for (const p of parts) {
        if (p.length > 3 && name.includes(p)) return note.id;
      }
    }
    return null;
  }

  // Now link notes to existing products!
  const products = await prisma.product.findMany();
  for (const prod of products) {
    // Clear old links for idempotent seed
    await prisma.productFragranceNote.deleteMany({
      where: { productId: prod.id },
    });

    // Parse top notes
    const topKeywords = (prod.topNotes || '').split(/[،,]/).map((s) => s.trim()).filter(Boolean);
    let topOrder = 0;
    for (const kw of topKeywords) {
      const noteId = findNoteId(kw) || findNoteId('برغموت') || findNoteId('زعفران');
      if (noteId) {
        await prisma.productFragranceNote.create({
          data: {
            productId: prod.id,
            noteId,
            type: 'TOP',
            sortOrder: topOrder++,
          },
        }).catch(() => {});
      }
    }

    // Parse heart notes
    const heartKeywords = (prod.heartNotes || '').split(/[،,]/).map((s) => s.trim()).filter(Boolean);
    let heartOrder = 0;
    for (const kw of heartKeywords) {
      const noteId = findNoteId(kw) || findNoteId('عنبر') || findNoteId('ورد') || findNoteId('جلود');
      if (noteId) {
        await prisma.productFragranceNote.create({
          data: {
            productId: prod.id,
            noteId,
            type: 'HEART',
            sortOrder: heartOrder++,
          },
        }).catch(() => {});
      }
    }

    // Parse base notes
    const baseKeywords = (prod.baseNotes || '').split(/[،,]/).map((s) => s.trim()).filter(Boolean);
    let baseOrder = 0;
    for (const kw of baseKeywords) {
      const noteId = findNoteId(kw) || findNoteId('عود') || findNoteId('صندل') || findNoteId('مسك');
      if (noteId) {
        await prisma.productFragranceNote.create({
          data: {
            productId: prod.id,
            noteId,
            type: 'BASE',
            sortOrder: baseOrder++,
          },
        }).catch(() => {});
      }
    }

    console.log(`Linked notes for product: ${prod.nameAr}`);
  }

  console.log('Seed completed successfully!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
