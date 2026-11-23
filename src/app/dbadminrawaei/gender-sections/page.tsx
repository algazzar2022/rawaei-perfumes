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
      adminFilter: '/dbadminrawaei/products?gender=HIM',
      image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=800',
    },
    {
      gender: 'HER',
      titleAr: 'عطور نسائية (For Her)',
      titleEn: 'Women’s Fragrance Line',
      desc: 'باقة أنثوية تفوح برقة الورد الدمشقي، الفانيليا البوربون، والمسك المخملي.',
      count: herCount,
      link: '/perfumes/for-her',
      adminFilter: '/dbadminrawaei/products?gender=HER',
      image: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?q=80&w=800',
    },
    {
      gender: 'UNISEX',
      titleAr: 'عطور للجنسين (Unisex)',
      titleEn: 'Unisex Signature Collection',
      desc: 'تناغم ملكي متوازن من العنبر والعود الملكي والزعفران الأصيل.',
      count: unisexCount,
      link: '/perfumes/unisex',
      adminFilter: '/dbadminrawaei/products?gender=UNISEX',
      image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=800',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">إدارة أقسام العطور الرئيسية</h1>
        <p className="text-xs text-gray-400 mt-1">
          متابعة الأقسام الثلاثة (For Him, For Her, Unisex) وإدارة منتجات وفلاتر كل قسم
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {sections.map((sec) => (
          <div
            key={sec.gender}
            className="glass-card rounded-3xl p-6 border border-[#C49A45]/30 space-y-4 flex flex-col justify-between shadow-2xl"
          >
            <div className="space-y-3">
              <div className="relative h-44 rounded-2xl overflow-hidden bg-neutral-900 border border-white/5">
                <Image src={sec.image} alt={sec.titleAr} fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <span className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-[#C49A45]/40 text-xs font-bold text-[#DFC27A]">
                  {sec.titleEn}
                </span>
              </div>

              <div>
                <h3 className="text-lg font-black text-white">{sec.titleAr}</h3>
                <p className="text-xs text-gray-300 mt-1 leading-relaxed">{sec.desc}</p>
              </div>

              <div className="p-3 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between text-xs">
                <span className="text-gray-400">إجمالي العطور المرتبطة:</span>
                <span className="text-base font-extrabold text-[#DFC27A]">
                  {sec.count} منتجات
                </span>
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <Link
                href={sec.adminFilter}
                className="gold-button py-2.5 rounded-xl text-xs font-bold text-center"
              >
                إدارة منتجات هذا القسم
              </Link>
              <Link
                href={sec.link}
                target="_blank"
                className="py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-gray-300 hover:text-white flex items-center justify-center gap-1.5 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5 text-[#C49A45]" />
                <span>معاينة صفحة القسم في المتجر</span>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
