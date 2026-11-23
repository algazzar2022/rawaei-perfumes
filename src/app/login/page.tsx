'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Sparkles, Mail, Lock, User, Phone, ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function CustomerLoginPage() {
  const router = useRouter();
  const { language, direction, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  // Login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register fields
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'فشل تسجيل الدخول');
      router.push('/account');
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء الدخول');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: registerName,
          email: registerEmail,
          phone: registerPhone,
          password: registerPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'فشل إنشاء الحساب');
      router.push('/account');
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء التسجيل');
    } finally {
      setLoading(false);
    }
  };

  const isRtl = direction === 'rtl';

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 bg-[#F8F5EF] py-16">
      <div className="w-full max-w-md">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 sm:p-10 border border-[#C49A45]/30 shadow-xl space-y-6">
          {/* Logo & Title */}
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
            <h1 className="text-2xl font-black text-[#171717]">
              {t('بوابة عملاء روائع للعطور', 'RAWAEI Client Portal')}
            </h1>
            <p className="text-xs text-[#98702B] font-semibold">
              {t('متابعة طلباتك، تتبع الشحنات، وإدارة حسابك', 'Track your orders, view deliveries & account')}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex bg-[#F4EFE6] p-1 rounded-2xl border border-[#C49A45]/20 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setActiveTab('LOGIN');
                setError(null);
              }}
              className={`flex-1 py-2.5 rounded-xl transition-all ${
                activeTab === 'LOGIN'
                  ? 'bg-white text-[#171717] shadow-sm'
                  : 'text-[#666666] hover:text-[#171717]'
              }`}
            >
              {t('تسجيل الدخول', 'Sign In')}
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('REGISTER');
                setError(null);
              }}
              className={`flex-1 py-2.5 rounded-xl transition-all ${
                activeTab === 'REGISTER'
                  ? 'bg-white text-[#171717] shadow-sm'
                  : 'text-[#666666] hover:text-[#171717]'
              }`}
            >
              {t('إنشاء حساب جديد', 'Register')}
            </button>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold text-center">
              {error}
            </div>
          )}

          {/* Form: LOGIN */}
          {activeTab === 'LOGIN' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-[#333333] font-bold">
                  {t('البريد الإلكتروني *', 'Email Address *')}
                </label>
                <div className="relative">
                  <Mail className="absolute top-1/2 -translate-y-1/2 right-3 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#DFC27A]/40 rounded-xl pr-10 pl-3 py-2.5 text-[#171717] focus:outline-none focus:border-[#C49A45]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[#333333] font-bold">
                  {t('كلمة المرور *', 'Password *')}
                </label>
                <div className="relative">
                  <Lock className="absolute top-1/2 -translate-y-1/2 right-3 w-4 h-4 text-gray-400" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#DFC27A]/40 rounded-xl pr-10 pl-3 py-2.5 text-[#171717] focus:outline-none focus:border-[#C49A45]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full gold-button py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-md disabled:opacity-50 mt-2"
              >
                <span>{loading ? t('جاري التحقق...', 'Checking...') : t('دخول إلى حسابي', 'Sign In to My Account')}</span>
                {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          ) : (
            /* Form: REGISTER */
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="text-[#333333] font-bold">
                  {t('الاسم بالكامل *', 'Full Name *')}
                </label>
                <div className="relative">
                  <User className="absolute top-1/2 -translate-y-1/2 right-3 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    required
                    placeholder={t('أحمد محمد', 'John Doe')}
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#DFC27A]/40 rounded-xl pr-10 pl-3 py-2.5 text-[#171717] focus:outline-none focus:border-[#C49A45]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[#333333] font-bold">
                  {t('رقم الجوال *', 'Phone Number *')}
                </label>
                <div className="relative">
                  <Phone className="absolute top-1/2 -translate-y-1/2 right-3 w-4 h-4 text-gray-400" />
                  <input
                    type="tel"
                    required
                    placeholder="+966 5x xxx xxxx"
                    value={registerPhone}
                    onChange={(e) => setRegisterPhone(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#DFC27A]/40 rounded-xl pr-10 pl-3 py-2.5 text-[#171717] focus:outline-none focus:border-[#C49A45]"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[#333333] font-bold">
                  {t('البريد الإلكتروني *', 'Email Address *')}
                </label>
                <div className="relative">
                  <Mail className="absolute top-1/2 -translate-y-1/2 right-3 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#DFC27A]/40 rounded-xl pr-10 pl-3 py-2.5 text-[#171717] focus:outline-none focus:border-[#C49A45]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[#333333] font-bold">
                  {t('كلمة المرور *', 'Password *')}
                </label>
                <div className="relative">
                  <Lock className="absolute top-1/2 -translate-y-1/2 right-3 w-4 h-4 text-gray-400" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#DFC27A]/40 rounded-xl pr-10 pl-3 py-2.5 text-[#171717] focus:outline-none focus:border-[#C49A45]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full gold-button py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-md disabled:opacity-50 mt-2"
              >
                <span>{loading ? t('جاري إنشاء الحساب...', 'Registering...') : t('إنشاء حسابي الفاخر', 'Create Account')}</span>
                {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          )}

          <div className="text-center pt-2 border-t border-gray-100">
            <Link
              href="/"
              className="text-xs text-[#98702B] hover:text-[#C49A45] font-semibold transition-colors"
            >
              ← {t('العودة للتسوق في المتجر', 'Return to Store')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
