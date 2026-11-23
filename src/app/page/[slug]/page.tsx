import React from 'react';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import { Sparkles } from 'lucide-react';

export const revalidate = 0;

export default async function CMSPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;

  const page = await prisma.page.findUnique({
    where: { slug },
  });

  if (!page || !page.isActive) {
    notFound();
  }

  return (
    <div className="min-h-screen py-16 bg-[#F8F5EF]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#C49A45]/15 border border-[#C49A45]/30 text-xs font-bold text-[#98702B]">
            <Sparkles className="w-3.5 h-3.5 text-[#C49A45]" />
            <span>روائع للعطور</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-[#171717]">
            {page.titleAr}
          </h1>
          <p className="text-sm font-bold text-[#98702B] tracking-widest uppercase">
            {page.titleEn}
          </p>
        </div>

        {/* Content Box */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#C49A45]/25 shadow-sm space-y-6 text-neutral-700 leading-relaxed text-sm sm:text-base">
          <div
            dangerouslySetInnerHTML={{ __html: page.contentAr }}
            className="space-y-4"
          />

          <div className="pt-8 border-t border-[#C49A45]/20 text-xs text-neutral-500">
            <div dangerouslySetInnerHTML={{ __html: page.contentEn }} />
          </div>
        </div>
      </div>
    </div>
  );
}
