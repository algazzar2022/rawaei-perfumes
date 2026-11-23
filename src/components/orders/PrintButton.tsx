'use client';

import React from 'react';
import { Printer } from 'lucide-react';

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 hover:border-[#C49A45]/40 text-xs font-semibold text-gray-300 hover:text-white transition-all bg-white/5"
    >
      <Printer className="w-4 h-4 text-[#C49A45]" />
      <span>طباعة الفاتورة</span>
    </button>
  );
}
