'use client';

import React, { useState, useEffect } from 'react';
import { UserCheck, Plus, X, Shield, Lock, Mail, Phone, User } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
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
      setIsModalOpen(false);
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">إدارة المستخدمين والصلاحيات</h1>
          <p className="text-xs text-gray-400 mt-1">
            إضافة مدراء وموظفين ومتابعة مستويات الصلاحيات الإدارية
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="gold-button px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 self-start sm:self-auto shadow-gold-glow"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة مستخدم إداري جديد</span>
        </button>
      </div>

      <div className="glass-card rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-right">
            <thead className="bg-[#151515] border-b border-white/5 text-gray-400">
              <tr>
                <th className="p-4 font-semibold">الاسم</th>
                <th className="p-4 font-semibold">البريد الإلكتروني</th>
                <th className="p-4 font-semibold">الجوال</th>
                <th className="p-4 font-semibold">الصلاحية (Role)</th>
                <th className="p-4 font-semibold">تاريخ الإنشاء</th>
                <th className="p-4 font-semibold">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-gray-200">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4 font-bold text-white text-sm">{u.name}</td>
                  <td className="p-4 text-gray-300 font-mono">{u.email}</td>
                  <td className="p-4 text-gray-400" dir="ltr">
                    {u.phone || '-'}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-black tracking-wide ${
                        u.role === 'ADMIN'
                          ? 'bg-[#C49A45]/20 text-[#DFC27A] border border-[#C49A45]/40'
                          : 'bg-blue-500/20 text-blue-300'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4 text-gray-400">{formatDate(u.createdAt, 'ar')}</td>
                  <td className="p-4">
                    <span className="text-emerald-400 font-bold">نشط</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#141414] border border-[#C49A45]/30 rounded-3xl w-full max-w-md p-6 sm:p-8 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white">إضافة مستخدم إداري جديد</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-200 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-gray-300 font-semibold">الاسم بالكامل *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-300 font-semibold">البريد الإلكتروني *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-300 font-semibold">كلمة المرور *</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-300 font-semibold">مستوى الصلاحية (Role)</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-white"
                >
                  <option value="STAFF">موظف (STAFF)</option>
                  <option value="MANAGER">مدير عمليات (MANAGER)</option>
                  <option value="ADMIN">مدير رئيسي بصلاحيات كاملة (ADMIN)</option>
                </select>
              </div>

              <div className="pt-3 border-t border-white/10 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-white/10 text-gray-300"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="gold-button px-5 py-2 rounded-xl font-bold"
                >
                  {saving ? 'جاري الإضافة...' : 'إنشاء الحساب'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
