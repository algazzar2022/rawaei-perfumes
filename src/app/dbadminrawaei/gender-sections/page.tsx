import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import prisma from '@/lib/prisma';
import { Compass, Sparkles, ArrowLeft, ArrowRight, ExternalLink } from 'lucide-react';

export const revalidate = 0;

export default async function AdminGenderSectionsPage() {
  const [himCount, herCount, unisexCount] = await Promise.all([
    prisma.product.count({ where: { gender: 'HIM', isActive: true } }),
    prisma.product.count({ where: { gender: 'HER', isActive: true } }),
    prisma.product.count({ where: { gender: 'UNISEX', isActive: true } }),
  ]);

  const sections = [
    {
      gender: 'HIM',
      titleAr: 'عطور رجالية (For Him)',
      titleEn: 'Men’s Fragrance Line',
      desc: 'تشكيلة تجمع بين هيبة أخشاب العود المعتّق والجلود الفاخرة والتوابل الدافئة.',
      count: himCount,
      link: '/perfumes/for-him',
      adminFilter: '/dbadminrawaei/products',
      image: '/logo.png',
    },
    {
      gender: 'HER',
      titleAr: 'عطور نسائية (For Her)',
      titleEn: 'Women’s Fragrance Line',
      desc: 'باقة أنثوية تفوح برقة الورد الدمشقي، الفانيليا البوربون، والمسك المخملي.',
      count: herCount,
      link: '/perfumes/for-her',
      adminFilter: '/dbadminrawaei/products',
      image: '/logo.png',
    },
    {
      gender: 'UNISEX',
      titleAr: 'عطور للجنسين (Unisex)',
      titleEn: 'Unisex Signature Collection',
      desc: 'تناغم ملكي متوازن من العنبر والعود الملكي والزعفران الأصيل.',
      count: unisexCount,
      link: '/perfumes/unisex',
      adminFilter: '/dbadminrawaei/products',
      image: '/logo.png',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-black">إدارة أقسام العطور الرئيسية</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {sections.map((sec) => (
          <div
            key={sec.gender}
            className="bg-white rounded-3xl p-6 border border-[#DFC27A]/40 space-y-4 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="space-y-3">
              <div className="relative h-44 rounded-2xl overflow-hidden bg-[#FAF8F5] border border-[#DFC27A]/30 flex items-center justify-center p-4">
                <Image src={sec.image} alt={sec.titleAr} fill className="object-contain p-4" />
                <span className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md border border-[#DFC27A]/40 text-xs font-black text-[#98702B]">
                  {sec.titleEn}
                </span>
              </div>

              <div>
                <h3 className="text-lg font-black text-black">{sec.titleAr}</h3>
                <p className="text-xs text-neutral-700 mt-1 leading-relaxed font-medium">{sec.desc}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#DFC27A]/30 flex items-center justify-between text-xs">
                <span className="text-neutral-600 font-bold">إجمالي العطور المرتبطة:</span>
                <span className="text-base font-black text-black">
                  {sec.count} منتجات
                </span>
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <Link
                href={sec.adminFilter}
                className="gold-button py-2.5 rounded-xl text-xs font-black text-black text-center shadow-sm hover:brightness-105"
              >
                إدارة منتجات هذا القسم
              </Link>
              <Link
                href={sec.link}
                target="_blank"
                className="py-2.5 rounded-xl bg-[#FAF8F5] hover:bg-neutral-100 border border-neutral-300 text-xs font-bold text-black flex items-center justify-center gap-1.5 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5 text-[#98702B]" />
                <span>معاينة صفحة القسم في المتجر</span>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
