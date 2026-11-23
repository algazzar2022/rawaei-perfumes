'use client';

import React, { useState, useEffect } from 'react';
import { UserCheck, Plus, Shield, Lock, Mail, Phone, User, ArrowRight, Trash2, CheckCircle2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // View Mode: 'LIST' or 'FORM' (no popups)
  const [viewMode, setViewMode] = useState<'LIST' | 'FORM'>('LIST');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'ADMIN',
  });

  const getAuthHeaders = () => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('rawaei_admin_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return headers;
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/users', {
        headers: getAuthHeaders(),
      });
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
    setFormData({ name: '', email: '', password: '', phone: '', role: 'ADMIN' });
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
        headers: getAuthHeaders(),
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'فشل إضافة المستخدم الإداري');

      setViewMode('LIST');
      setFormData({ name: '', email: '', password: '', phone: '', role: 'ADMIN' });
      setSuccessMessage(`تم إنشاء حساب المسؤول (${data.user?.name || formData.name}) بكامل الصلاحيات بنجاح! ✓`);
      setTimeout(() => setSuccessMessage(null), 4000);
      fetchUsers();
    } catch (err: any) {
      setFormError(err.message || 'خطأ أثناء الإضافة');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async (id: string, name: string) => {
    if (!confirm(`هل أنت متأكد من رغبتك في حذف المستخدم (${name})؟`)) return;

    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'فشل حذف المستخدم');

      setSuccessMessage(`تم حذف المستخدم (${name}) بنجاح.`);
      setTimeout(() => setSuccessMessage(null), 3500);
      fetchUsers();
    } catch (err: any) {
      alert(err.message || 'حدث خطأ أثناء الحذف');
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
                <span>إضافة مسؤول / مشرف جديد بكامل الصلاحيات</span>
              </h1>
              <p className="text-xs text-neutral-600 mt-1">
                تحديد بيانات الحساب والصلاحيات الإدارية المطلوبة
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
                  placeholder="user@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-[#FAF8F5] border border-[#DFC27A]/40 rounded-xl px-4 py-2.5 text-xs text-black font-mono font-bold placeholder-[#777777] focus:outline-none focus:border-[#C49A45] focus:bg-white"
                  dir="ltr"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-black font-black text-xs block">كلمة المرور المشفرة *</label>
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
                <label className="text-black font-black text-xs block">رقم الجوال (اختياري)</label>
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
                  <option value="ADMIN">مسؤول كامل الصلاحيات (ADMIN) - التحكم الشامل في كافة الإعدادات والمنتجات والطلبات</option>
                  <option value="STAFF">مشرف متجر (STAFF) - إدارة الطلبات والمخزون والمنتجات فقط</option>
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
              <span>إضافة مسؤول جديد (Admin)</span>
            </button>
          </div>

          {successMessage && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 text-xs font-black flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

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
                    <th className="p-4 font-black text-black text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DFC27A]/15 text-black">
                  {users.length === 0 && !loading ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-neutral-500 font-bold">
                        لا يوجد مستخدمين مسجلين حالياً
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => (
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
                                ? 'bg-[#FFFBEB] text-[#92400E] border border-[#FDE68A]'
                                : 'bg-[#EFF6FF] text-[#1E40AF] border border-[#BFDBFE]'
                            }`}
                          >
                            {u.role === 'ADMIN' ? '👑 مسؤول عام (ADMIN)' : '👔 مشرف متجر (STAFF)'}
                          </span>
                        </td>
                        <td className="p-4 text-neutral-600 font-semibold">{formatDate(u.createdAt, 'ar')}</td>
                        <td className="p-4 text-center">
                          <span className="inline-block px-3 py-1 rounded-full text-[11px] font-black bg-[#F0FDF4] text-[#166534] border border-[#BBF7D0]">
                            نشط ✓
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => handleDeleteUser(u.id, u.name)}
                            className="w-8 h-8 rounded-xl bg-red-50 hover:bg-red-600 text-red-600 hover:text-white border border-red-200 transition-all shadow-xs inline-flex items-center justify-center cursor-pointer"
                            title="حذف المستخدم"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
