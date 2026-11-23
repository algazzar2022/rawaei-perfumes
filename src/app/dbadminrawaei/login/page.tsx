'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Lock, Mail, ShieldCheck } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'البريد الإلكتروني أو كلمة المرور غير صحيحة');
      }

      if (data.token && typeof window !== 'undefined') {
        localStorage.setItem('rawaei_admin_token', data.token);
      }

      router.push('/dbadminrawaei');
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء الدخول');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-light min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#FAF8F5] via-[#F4EDE4] to-[#EAE0D0] relative overflow-hidden text-black" dir="rtl">
      {/* Decorative Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-[#C49A45]/20 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/95 rounded-3xl p-8 sm:p-10 border border-[#DFC27A]/50 shadow-2xl shadow-[#C49A45]/10 backdrop-blur-2xl space-y-6">
          {/* Logo & Header */}
          <div className="text-center space-y-2">
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 mx-auto mb-2">
              <Image
                src="/logo.png"
                alt="روائع للعطور"
                fill
                className="object-contain"
                priority
              />
            </div>

            <h1 className="text-2xl font-black text-black pt-2">
              لوحة تحكم روائع للعطور
            </h1>
            <p className="text-xs text-black font-black tracking-wider uppercase">
              RAWAEI PERFUMES – ADMIN PORTAL
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-300 text-red-900 text-xs font-black text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs text-black font-black">البريد الإلكتروني الإداري</label>
              <div className="relative">
                <Mail className="absolute top-1/2 -translate-y-1/2 right-3 w-4 h-4 text-black" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@yourdomain.com"
                  className="w-full bg-[#FAF8F5] border border-[#DFC27A]/40 rounded-xl pr-10 pl-3 py-2.5 text-xs text-black font-bold placeholder-[#777777] focus:outline-none focus:border-[#C49A45] focus:ring-2 focus:ring-[#C49A45]/20"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-black font-black">كلمة المرور</label>
              <div className="relative">
                <Lock className="absolute top-1/2 -translate-y-1/2 right-3 w-4 h-4 text-black" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#FAF8F5] border border-[#DFC27A]/40 rounded-xl pr-10 pl-3 py-2.5 text-xs text-black font-bold placeholder-[#777777] focus:outline-none focus:border-[#C49A45] focus:ring-2 focus:ring-[#C49A45]/20"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full gold-button py-3.5 rounded-xl text-xs font-black text-black flex items-center justify-center gap-2 shadow-md hover:brightness-105 active:scale-[0.99] transition-all disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4 text-black" />
              <span className="text-black">{loading ? 'جاري التحقق...' : 'تسجيل الدخول إلى النظام'}</span>
            </button>
          </form>

          <div className="text-center pt-2">
            <Link href="/" className="text-xs text-black hover:underline font-black transition-colors">
              ← العودة إلى المتجر الرئيسي
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
