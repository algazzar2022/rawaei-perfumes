'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Layers,
  Sparkles,
  Sliders,
  ShoppingBag,
  Users,
  Archive,
  TicketPercent,
  FileText,
  Search,
  Truck,
  UserCheck,
  Palette,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Compass,
  Video,
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Skip layout styling on /dbadminrawaei/login
  if (pathname === '/dbadminrawaei/login') {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/dbadminrawaei/login');
    } catch {
      router.push('/dbadminrawaei/login');
    }
  };

  const navItems = [
    { label: 'لوحة الإحصائيات (Dashboard)', href: '/dbadminrawaei', icon: LayoutDashboard },
    { label: 'إدارة المنتجات (Products)', href: '/dbadminrawaei/products', icon: Package },
    { label: 'إدارة التصنيفات (Categories)', href: '/dbadminrawaei/categories', icon: Layers },
    { label: 'أقسام العطور (Him/Her/Unisex)', href: '/dbadminrawaei/gender-sections', icon: Compass },
    { label: 'البانرات والسلايدر والفيديو', href: '/dbadminrawaei/banners', icon: Sliders },
    { label: 'فيديوهات المؤثرين والعملاء', href: '/dbadminrawaei/reviews', icon: Video },
    { label: 'المنتجات المميزة (Featured)', href: '/dbadminrawaei/featured', icon: Sparkles },
    { label: 'إدارة الطلبات (Orders)', href: '/dbadminrawaei/orders', icon: ShoppingBag },
    { label: 'إدارة العملاء (Customers)', href: '/dbadminrawaei/customers', icon: Users },
    { label: 'إدارة المخزون (Inventory)', href: '/dbadminrawaei/inventory', icon: Archive },
    { label: 'الكوبونات والخصومات (Coupons)', href: '/dbadminrawaei/coupons', icon: TicketPercent },
    { label: 'صفحات الموقع (CMS Pages)', href: '/dbadminrawaei/pages', icon: FileText },
    { label: 'إعدادات SEO والأرشفة', href: '/dbadminrawaei/seo', icon: Search },
    { label: 'وسائل الشحن والدفع', href: '/dbadminrawaei/shipping-payment', icon: Truck },
    { label: 'المستخدمين والصلاحيات', href: '/dbadminrawaei/users', icon: UserCheck },
    { label: 'الهوية البصرية والألوان', href: '/dbadminrawaei/visual-identity', icon: Palette },
    { label: 'إعدادات الموقع العامة', href: '/dbadminrawaei/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex bg-[#0A0A0A] text-[#F8F5EF]" dir="rtl">
      {/* 1. Sidebar for Desktop */}
      <aside className="hidden lg:flex w-72 flex-col justify-between bg-[#111111] border-l border-[#C49A45]/20 shadow-2xl z-30">
        <div>
          {/* Logo / Brand Header */}
          <div className="p-6 border-b border-[#C49A45]/20 flex items-center gap-3.5">
            <div className="relative w-14 h-14 flex-shrink-0">
              <Image
                src="/logo.png"
                alt="روائع للعطور"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">روائع للعطور</h2>
              <p className="text-[11px] tracking-wider text-[#C49A45] uppercase font-bold">
                لوحة التحكم الإدارية
              </p>
            </div>
          </div>

          {/* Nav Items List */}
          <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-160px)]">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-[#C49A45] to-[#98702B] text-black shadow-gold-glow font-bold'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-black' : 'text-[#C49A45]'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer controls */}
        <div className="p-4 border-t border-white/5 space-y-2 bg-[#0E0E0E]">
          <Link
            href="/"
            target="_blank"
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-gray-300 hover:text-white transition-colors"
          >
            <ExternalLink className="w-4 h-4 text-[#C49A45]" />
            <span>معاينة المتجر المباشر</span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-950/40 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 px-4 sm:px-8 border-b border-[#C49A45]/20 bg-[#121212]/90 backdrop-blur-md flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 text-gray-400 hover:text-white"
            >
              <Menu className="w-6 h-6" />
            </button>
            <span className="text-xs font-bold text-[#DFC27A] px-3 py-1 rounded-full bg-[#C49A45]/10 border border-[#C49A45]/30">
              نظام إدارة التجارة الإلكترونية الملكية
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-gray-300">المدير:</span>
              <span className="font-bold text-white">admin@rawaei.com</span>
            </div>

            <Link
              href="/"
              target="_blank"
              className="gold-button px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">زيارة المتجر</span>
            </Link>
          </div>
        </header>

        {/* Content Container */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">{children}</main>
      </div>

      {/* 3. Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          />
          <div className="fixed top-0 bottom-0 right-0 w-4/5 max-w-xs bg-[#111111] border-l border-[#C49A45]/30 p-6 flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
                <span className="font-bold text-white text-sm">لوحة التحكم</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-3 py-2 rounded-xl text-xs font-semibold ${
                      pathname === item.href
                        ? 'bg-[#C49A45] text-black font-bold'
                        : 'text-gray-300 hover:bg-white/5'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-white/10">
              <button
                onClick={handleLogout}
                className="w-full py-2.5 rounded-xl bg-red-950/40 text-red-400 text-xs font-bold text-center"
              >
                تسجيل الخروج
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
