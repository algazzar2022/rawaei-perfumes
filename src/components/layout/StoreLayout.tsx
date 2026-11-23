'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Header from '@/components/header/Header';
import Footer from '@/components/footer/Footer';
import CartDrawer from '@/components/cart/CartDrawer';

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/dbadminrawaei');

  if (isAdminRoute) {
    // Admin routes render with their dedicated luxury dark gold admin layout
    return (
      <div className="min-h-screen bg-[#0D0D0D] text-[#F8F5EF]">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F5EF] text-[#171717]">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartDrawer />
    </div>
  );
}
