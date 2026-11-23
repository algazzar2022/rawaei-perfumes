'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, Lock, Mail, ArrowRight, ArrowLeft, ShieldCheck } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@rawaei.com');
  const [password, setPassword] = useState('RawaeiAdmin2026!');
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
        throw new Error(data.error || 'فشل تسجيل الدخول');
      }

      router.push('/dbadminrawaei');
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء الدخول');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#070707] via-[#101010] to-[#0A0A0A] relative overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#C49A45]/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="glass-card rounded-3xl p-8 sm:p-10 border border-[#C49A45]/30 shadow-2xl backdrop-blur-2xl space-y-6">
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

            <h1 className="text-2xl font-black text-white pt-2">
              لوحة تحكم روائع للعطور
            </h1>
            <p className="text-xs text-[#DFC27A] font-semibold tracking-wider uppercase">
              RAWAEI PERFUMES – ADMIN PORTAL
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-900/40 border border-red-500/40 text-red-200 text-xs font-semibold text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs text-gray-300 font-medium">البريد الإلكتروني الإداري</label>
              <div className="relative">
                <Mail className="absolute top-1/2 -translate-y-1/2 right-3 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@rawaei.com"
                  className="w-full bg-[#171717] border border-white/10 rounded-xl pr-10 pl-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#C49A45]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-gray-300 font-medium">كلمة المرور المشفرة</label>
              <div className="relative">
                <Lock className="absolute top-1/2 -translate-y-1/2 right-3 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#171717] border border-white/10 rounded-xl pr-10 pl-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#C49A45]"
                />
              </div>
            </div>

            {/* Quick Demo Credentials Info */}
            <div className="p-3 rounded-xl bg-[#C49A45]/10 border border-[#C49A45]/20 text-[11px] text-gray-300 space-y-1">
              <span className="text-[#DFC27A] font-bold block">بيانات الدخول الافتراضية للمدير:</span>
              <div>البريد: <code className="text-white font-mono">admin@rawaei.com</code></div>
              <div>كلمة المرور: <code className="text-white font-mono">RawaeiAdmin2026!</code></div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full gold-button py-3.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-gold-glow disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{loading ? 'جاري التحقق...' : 'تسجيل الدخول إلى النظام'}</span>
            </button>
          </form>

          <div className="text-center pt-2">
            <Link href="/" className="text-xs text-gray-400 hover:text-white transition-colors">
              ← العودة إلى المتجر الرئيسي
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
