'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Archive, AlertTriangle, Check, RefreshCw, Save } from 'lucide-react';
import { ProductDto } from '@/lib/types';
import { formatPrice } from '@/lib/utils';

export default function AdminInventoryPage() {
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [stockMap, setStockMap] = useState<{ [id: string]: number }>({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/products');
      const data = await res.json();
      const list: ProductDto[] = data.products || [];
      setProducts(list);
      const initialMap: { [id: string]: number } = {};
      list.forEach((p) => {
        initialMap[p.id] = p.stock;
      });
      setStockMap(initialMap);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleQuickUpdate = async (id: string) => {
    const newStock = stockMap[id];
    setSavingId(id);
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: newStock }),
      });
      if (!res.ok) throw new Error('فشل التحديث');
      alert('تم تحديث كمية المخزون بنجاح!');
      fetchProducts();
    } catch {
      alert('خطأ أثناء التحديث');
    } finally {
      setSavingId(null);
    }
  };

  const totalStockItems = products.reduce((sum, p) => sum + p.stock, 0);
  const totalStockValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);
  const lowStockCount = products.filter((p) => p.stock <= 10).length;

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">إدارة المخزون والمستودع</h1>
          <p className="text-xs text-gray-400 mt-1">
            مراقبة كميات العطور المتوفرة، تنبيهات النفاذ، والتعديل السريع للكميات
          </p>
        </div>

        <button
          onClick={fetchProducts}
          className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-gray-300 flex items-center gap-2 self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#C49A45]" />
          <span>تحديث البيانات</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="glass-card rounded-2xl p-5 border border-[#C49A45]/20 space-y-2">
          <span className="text-xs text-gray-400">إجمالي قطع العطور في المستودع</span>
          <div className="text-3xl font-black text-white">{totalStockItems} قطعة</div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-[#C49A45]/20 space-y-2">
          <span className="text-xs text-gray-400">القيمة التقديرية للمخزون</span>
          <div className="text-3xl font-black text-[#DFC27A]">
            {formatPrice(totalStockValue, 'ar')}
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-red-500/20 space-y-2">
          <span className="text-xs text-red-300">عطور قريبة من النفاذ (أقل من 10)</span>
          <div className="text-3xl font-black text-red-400">{lowStockCount} عطور</div>
        </div>
      </div>

      {/* Stock Table */}
      <div className="glass-card rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-right">
            <thead className="bg-[#151515] border-b border-white/5 text-gray-400">
              <tr>
                <th className="p-4 font-semibold">العطر</th>
                <th className="p-4 font-semibold">SKU</th>
                <th className="p-4 font-semibold">سعر البيع</th>
                <th className="p-4 font-semibold">حالة المخزون</th>
                <th className="p-4 font-semibold">الكمية المتوفرة</th>
                <th className="p-4 font-semibold text-center">تحديث سريع</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-gray-200">
              {products.map((p) => {
                const currentStock = stockMap[p.id] !== undefined ? stockMap[p.id] : p.stock;
                const isLow = currentStock <= 10;
                return (
                  <tr key={p.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-white text-sm">{p.nameAr}</div>
                      <div className="text-gray-400 text-[11px]">{p.nameEn}</div>
                    </td>
                    <td className="p-4 font-mono text-gray-300">{p.sku}</td>
                    <td className="p-4 font-bold text-[#DFC27A]">{formatPrice(p.price, 'ar')}</td>
                    <td className="p-4">
                      {isLow ? (
                        <span className="px-2.5 py-1 rounded-full bg-red-500/20 text-red-300 text-[10px] font-black flex items-center gap-1 w-fit">
                          <AlertTriangle className="w-3 h-3" />
                          <span>قريب من النفاذ</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold w-fit block">
                          مخزون وافر
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <input
                        type="number"
                        min="0"
                        value={currentStock}
                        onChange={(e) =>
                          setStockMap({
                            ...stockMap,
                            [p.id]: parseInt(e.target.value) || 0,
                          })
                        }
                        className="w-24 bg-[#181818] border border-white/10 rounded-xl px-3 py-1.5 text-white font-bold text-xs focus:outline-none focus:border-[#C49A45]"
                      />
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleQuickUpdate(p.id)}
                        disabled={savingId === p.id}
                        className="px-4 py-1.5 rounded-xl gold-button text-[11px] font-bold"
                      >
                        {savingId === p.id ? 'جاري...' : 'حفظ الكمية'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
