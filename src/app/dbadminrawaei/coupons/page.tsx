'use client';

import React, { useState, useEffect } from 'react';
import { TicketPercent, Plus, Trash2, Check, X, Tag } from 'lucide-react';
import { formatPrice, formatDate } from '@/lib/utils';

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'PERCENTAGE',
    discountValue: '',
    minOrderValue: '200',
    maxDiscount: '',
    usageLimit: '100',
    expiresAt: '',
    isActive: true,
  });

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/coupons');
      const data = await res.json();
      setCoupons(data.coupons || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error('فشل إضافة الكوبون');
      setIsModalOpen(false);
      fetchCoupons();
    } catch {
      alert('خطأ أثناء حفظ الكوبون');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">إدارة الكوبونات وقسائم الخصم</h1>
          <p className="text-xs text-gray-400 mt-1">
            إنشاء أكواد الخصم الترويجية بالنسبة المئوية أو المبلغ الثابت وتحديد شروط الاستخدام
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="gold-button px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 self-start sm:self-auto shadow-gold-glow"
        >
          <Plus className="w-4 h-4" />
          <span>إنشاء كود خصم جديد</span>
        </button>
      </div>

      {/* Coupons Table */}
      <div className="glass-card rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-right">
            <thead className="bg-[#151515] border-b border-white/5 text-gray-400">
              <tr>
                <th className="p-4 font-semibold">كود الخصم</th>
                <th className="p-4 font-semibold">نوع الخصم</th>
                <th className="p-4 font-semibold">قيمة الخصم</th>
                <th className="p-4 font-semibold">الحد الأدنى للطلب</th>
                <th className="p-4 font-semibold">الاستخدام</th>
                <th className="p-4 font-semibold">تاريخ الانتهاء</th>
                <th className="p-4 font-semibold">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-gray-200">
              {coupons.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    لا توجد كوبونات خصم حالياً.
                  </td>
                </tr>
              ) : (
                coupons.map((c) => (
                  <tr key={c.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <span className="font-mono font-bold text-sm text-[#DFC27A] px-2.5 py-1 rounded-lg bg-[#C49A45]/15 border border-[#C49A45]/30">
                        {c.code}
                      </span>
                    </td>
                    <td className="p-4 font-medium">
                      {c.discountType === 'PERCENTAGE' ? 'نسبة مئوية (%)' : 'مبلغ ثابت (ج.م)'}
                    </td>
                    <td className="p-4 font-bold text-white text-sm">
                      {c.discountType === 'PERCENTAGE'
                        ? `${c.discountValue}%`
                        : `${c.discountValue} ج.م`}
                    </td>
                    <td className="p-4 text-gray-300">
                      {c.minOrderValue ? `${c.minOrderValue} ج.م` : 'بدون حد أدنى'}
                    </td>
                    <td className="p-4">
                      <span className="text-white font-bold">{c.usedCount}</span>
                      <span className="text-gray-400">
                        {c.usageLimit ? ` / ${c.usageLimit}` : ' (غير محدود)'}
                      </span>
                    </td>
                    <td className="p-4 text-gray-400">
                      {c.expiresAt ? formatDate(c.expiresAt, 'ar') : 'صالح دائماً'}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          c.isActive
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-red-500/20 text-red-300'
                        }`}
                      >
                        {c.isActive ? 'مفعل' : 'معطل'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#141414] border border-[#C49A45]/30 rounded-3xl w-full max-w-md p-6 sm:p-8 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white">إنشاء كود خصم جديد</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-gray-300 font-semibold">كود الخصم (كبير تلقائياً) *</label>
                <input
                  type="text"
                  required
                  placeholder="EID2026"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-white font-mono uppercase focus:outline-none focus:border-[#C49A45]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-gray-300 font-semibold">نوع الخصم</label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                    className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="PERCENTAGE">نسبة مئوية (%)</option>
                    <option value="FIXED">مبلغ ثابت (ج.م)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-gray-300 font-semibold">قيمة الخصم *</label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    placeholder="15"
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                    className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-gray-300">الحد الأدنى للطلب (ج.م)</label>
                  <input
                    type="number"
                    value={formData.minOrderValue}
                    onChange={(e) => setFormData({ ...formData, minOrderValue: e.target.value })}
                    className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-gray-300">أقصى حد للخصم (ج.م)</label>
                  <input
                    type="number"
                    placeholder="100"
                    value={formData.maxDiscount}
                    onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                    className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-gray-300">الحد الأقصى لمرات الاستخدام</label>
                <input
                  type="number"
                  placeholder="100"
                  value={formData.usageLimit}
                  onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2">
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
                  {saving ? 'جاري...' : 'حفظ الكوبون'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
