'use client';

import React, { useState, useEffect } from 'react';
import { UserCheck, Plus, Shield, Lock, Mail, Phone, User, ArrowRight } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // View Mode: 'LIST' or 'FORM' (no popups)
  const [viewMode, setViewMode] = useState<'LIST' | 'FORM'>('LIST');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'STAFF',
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      setUsers(data.users || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openCreateForm = () => {
    setFormData({ name: '', email: '', password: '', phone: '', role: 'STAFF' });
    setFormError(null);
    setViewMode('FORM');
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'فشل إضافة المستخدم');

      setViewMode('LIST');
      setFormData({ name: '', email: '', password: '', phone: '', role: 'STAFF' });
      fetchUsers();
    } catch (err: any) {
      setFormError(err.message || 'خطأ أثناء الإضافة');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* ============================================================== */}
      {/* 1. FORM VIEW (Create Admin/Staff User)                         */}
      {/* ============================================================== */}
      {viewMode === 'FORM' ? (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#DFC27A]/40 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <button
                type="button"
                onClick={() => setViewMode('LIST')}
                className="inline-flex items-center gap-2 text-xs font-black text-black hover:text-[#98702B] mb-2 transition-colors cursor-pointer"
              >
                <ArrowRight className="w-4 h-4 text-black" />
                <span>العودة إلى جدول المستخدمين</span>
              </button>
              <h1 className="text-2xl font-black text-black flex items-center gap-2">
                <Shield className="w-6 h-6 text-[#98702B]" />
                <span>إضافة مستخدم إداري جديد</span>
              </h1>
              <p className="text-xs text-neutral-600 mt-1">
                تحديد بيانات الحساب والصلاحيات (Admin أو Staff)
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setViewMode('LIST')}
                className="px-5 py-2.5 rounded-xl bg-[#FAF8F5] hover:bg-neutral-200 border border-neutral-300 text-xs font-bold text-black transition-colors cursor-pointer"
              >
                إلغاء والرجوع
              </button>
              <button
                type="submit"
                form="user-form"
                disabled={saving}
                className="gold-button px-6 py-2.5 rounded-xl text-xs font-black text-black shadow-md hover:brightness-105 disabled:opacity-50 cursor-pointer"
              >
                {saving ? 'جاري الإنشاء...' : 'إنشاء الحساب الإداري'}
              </button>
            </div>
          </div>

          {formError && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-300 text-red-900 text-xs font-bold">
              {formError}
            </div>
          )}

          <form
            id="user-form"
            onSubmit={handleCreate}
            className="bg-white rounded-3xl p-6 sm:p-8 border border-[#DFC27A]/40 shadow-sm space-y-6 text-xs"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-black font-black text-xs block">الاسم بالكامل *</label>
                <input
                  type="text"
                  required
                  placeholder="محمد الجزار"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#FAF8F5] border border-[#DFC27A]/40 rounded-xl px-4 py-2.5 text-xs text-black font-bold placeholder-[#777777] focus:outline-none focus:border-[#C49A45] focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-black font-black text-xs block">البريد الإلكتروني *</label>
                <input
                  type="email"
                  required
                  placeholder="admin@rawaei.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-[#FAF8F5] border border-[#DFC27A]/40 rounded-xl px-4 py-2.5 text-xs text-black font-mono font-bold placeholder-[#777777] focus:outline-none focus:border-[#C49A45] focus:bg-white"
                  dir="ltr"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-black font-black text-xs block">كلمة المرور *</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-[#FAF8F5] border border-[#DFC27A]/40 rounded-xl px-4 py-2.5 text-xs text-black font-bold placeholder-[#777777] focus:outline-none focus:border-[#C49A45] focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-black font-black text-xs block">رقم الجوال</label>
                <input
                  type="tel"
                  placeholder="010xxxxxxxx"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-[#FAF8F5] border border-[#DFC27A]/40 rounded-xl px-4 py-2.5 text-xs text-black font-mono font-bold placeholder-[#777777] focus:outline-none focus:border-[#C49A45] focus:bg-white"
                  dir="ltr"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-black font-black text-xs block">مستوى الصلاحية (Role) *</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full bg-[#FAF8F5] border border-[#DFC27A]/40 rounded-xl px-4 py-2.5 text-xs text-black font-bold focus:outline-none focus:border-[#C49A45] focus:bg-white"
                >
                  <option value="STAFF">موظف (STAFF) - إدارة الطلبات والمنتجات</option>
                  <option value="ADMIN">مدير عام (ADMIN) - كامل الصلاحيات والإعدادات</option>
                </select>
              </div>
            </div>

            <div className="pt-6 border-t border-[#DFC27A]/30 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setViewMode('LIST')}
                className="px-5 py-2.5 rounded-xl bg-[#FAF8F5] hover:bg-neutral-200 border border-neutral-300 text-xs font-bold text-black transition-colors cursor-pointer"
              >
                إلغاء والرجوع
              </button>
              <button
                type="submit"
                disabled={saving}
                className="gold-button px-6 py-2.5 rounded-xl text-xs font-black text-black shadow-md hover:brightness-105 disabled:opacity-50 cursor-pointer"
              >
                {saving ? 'جاري الإنشاء...' : 'إنشاء الحساب الإداري'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* ============================================================== */
        /* 2. LIST VIEW (Users Table)                                     */
        /* ============================================================== */
        <>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-black">إدارة المستخدمين والصلاحيات</h1>
              <p className="text-xs text-neutral-600 mt-1">
                إضافة مدراء وموظفين ومتابعة مستويات الصلاحيات الإدارية
              </p>
            </div>

            <button
              onClick={openCreateForm}
              className="gold-button px-5 py-2.5 rounded-xl text-xs font-black text-black flex items-center gap-2 self-start sm:self-auto shadow-md hover:brightness-105 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-black" />
              <span>إضافة مستخدم إداري جديد</span>
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-[#DFC27A]/40 overflow-hidden shadow-md">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-right">
                <thead className="bg-[#FAF6EE] border-b-2 border-[#DFC27A]/30 text-black">
                  <tr>
                    <th className="p-4 font-black text-black">الاسم</th>
                    <th className="p-4 font-black text-black">البريد الإلكتروني</th>
                    <th className="p-4 font-black text-black">الجوال</th>
                    <th className="p-4 font-black text-black text-center">الصلاحية (Role)</th>
                    <th className="p-4 font-black text-black">تاريخ الإنشاء</th>
                    <th className="p-4 font-black text-black text-center">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DFC27A]/15 text-black">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-[#FAF8F5] transition-colors">
                      <td className="p-4 font-black text-black text-sm">{u.name}</td>
                      <td className="p-4 text-neutral-800 font-mono font-bold">{u.email}</td>
                      <td className="p-4 text-neutral-600 font-mono font-bold" dir="ltr">
                        {u.phone || '-'}
                      </td>
                      <td className="p-4 text-center">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-[11px] font-black tracking-wide ${
                            u.role === 'ADMIN'
                              ? 'bg-amber-100 text-amber-950 border border-amber-300'
                              : 'bg-blue-100 text-blue-950 border border-blue-300'
                          }`}
                        >
                          {u.role === 'ADMIN' ? 'مدير عام (ADMIN)' : 'موظف (STAFF)'}
                        </span>
                      </td>
                      <td className="p-4 text-neutral-600 font-semibold">{formatDate(u.createdAt, 'ar')}</td>
                      <td className="p-4 text-center">
                        <span className="inline-block px-3 py-1 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-950 border border-emerald-300">
                          نشط ✓
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
