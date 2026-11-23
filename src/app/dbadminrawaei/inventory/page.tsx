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
          <h1 className="text-2xl font-black text-black">إدارة المخزون والمستودع</h1>
        </div>

        <button
          onClick={fetchProducts}
          className="px-5 py-2.5 rounded-xl bg-white hover:bg-[#FAF8F5] border border-[#DFC27A]/40 text-xs font-black text-black flex items-center gap-2 self-start sm:self-auto shadow-sm cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#98702B]" />
          <span>تحديث البيانات</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-3xl p-6 border border-[#DFC27A]/40 shadow-sm space-y-2">
          <span className="text-xs text-neutral-600 font-bold">إجمالي قطع العطور في المستودع</span>
          <div className="text-3xl font-black text-black">{totalStockItems} قطعة</div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-[#DFC27A]/40 shadow-sm space-y-2">
          <span className="text-xs text-neutral-600 font-bold">القيمة التقديرية للمخزون</span>
          <div className="text-3xl font-black text-[#98702B]">
            {formatPrice(totalStockValue, 'ar')}
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-red-200 shadow-sm space-y-2">
          <span className="text-xs text-red-700 font-bold">عطور قريبة من النفاذ (أقل من 10)</span>
          <div className="text-3xl font-black text-red-600">{lowStockCount} عطور</div>
        </div>
      </div>

      {/* Stock Table */}
      <div className="bg-white rounded-3xl border border-[#DFC27A]/40 overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-right">
            <thead className="bg-[#FAF6EE] border-b-2 border-[#DFC27A]/30 text-black">
              <tr>
                <th className="p-4 font-black text-black">العطر</th>
                <th className="p-4 font-black text-black">SKU</th>
                <th className="p-4 font-black text-black">سعر البيع</th>
                <th className="p-4 font-black text-black">حالة المخزون</th>
                <th className="p-4 font-black text-black">الكمية المتوفرة</th>
                <th className="p-4 font-black text-black text-center">تحديث سريع</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DFC27A]/15 text-black">
              {products.map((p) => {
                const currentStock = stockMap[p.id] !== undefined ? stockMap[p.id] : p.stock;
                const isLow = currentStock <= 10;
                return (
                  <tr key={p.id} className="hover:bg-[#FAF8F5] transition-colors">
                    <td className="p-4">
                      <div className="font-black text-black text-sm">{p.nameAr}</div>
                      <div className="text-neutral-600 text-[11px] font-bold">{p.nameEn}</div>
                    </td>
                    <td className="p-4 font-mono font-bold text-[#98702B]">SKU: {p.sku}</td>
                    <td className="p-4 font-black text-black text-sm">{formatPrice(p.price, 'ar')}</td>
                    <td className="p-4">
                      {isLow ? (
                        <span className="px-3 py-1 rounded-full bg-red-100 text-red-950 border border-red-300 text-[11px] font-black flex items-center gap-1 w-fit">
                          <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                          <span>قريب من النفاذ</span>
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-950 border border-emerald-300 text-[11px] font-black w-fit block">
                          مخزون وافر ✓
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
                        className="w-24 bg-[#FAF8F5] border border-[#DFC27A]/40 rounded-xl px-3 py-1.5 text-black font-black text-xs focus:outline-none focus:border-[#C49A45] focus:bg-white"
                      />
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleQuickUpdate(p.id)}
                        disabled={savingId === p.id}
                        className="px-4 py-1.5 rounded-xl gold-button text-[11px] font-black text-black shadow-sm hover:brightness-105 disabled:opacity-50 cursor-pointer"
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
