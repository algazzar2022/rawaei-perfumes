'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ProductDto } from '@/lib/types';

export interface CartItem {
  id: string; // unique key combining productId and sizeMl
  productId: string;
  product: ProductDto;
  sizeMl: number;
  quantity: number;
  unitPrice: number;
}

export interface CouponData {
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minOrderValue?: number;
  maxDiscount?: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: ProductDto, sizeMl?: number, quantity?: number, customPrice?: number) => void;
  updateQuantity: (id: string, delta: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  subtotal: number;
  discountAmount: number;
  shippingCost: number;
  total: number;
  itemCount: number;
  appliedCoupon: CouponData | null;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<CouponData | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('rawaei_cart');
      if (saved) {
        setItems(JSON.parse(saved));
      }
      const savedCoupon = localStorage.getItem('rawaei_coupon');
      if (savedCoupon) {
        setAppliedCoupon(JSON.parse(savedCoupon));
      }
    } catch (e) {
      console.error('Failed to load cart from storage', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage whenever cart items or coupon change
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem('rawaei_cart', JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save cart to storage', e);
    }
  }, [items, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      if (appliedCoupon) {
        localStorage.setItem('rawaei_coupon', JSON.stringify(appliedCoupon));
      } else {
        localStorage.removeItem('rawaei_coupon');
      }
    } catch (e) {
      console.error('Failed to save coupon to storage', e);
    }
  }, [appliedCoupon, isLoaded]);

  const addItem = (
    product: ProductDto,
    sizeMl?: number,
    quantity: number = 1,
    customPrice?: number
  ) => {
    const selectedSize = sizeMl || product.volumeMl || 100;
    
    // Find price for this size if customPrice not provided
    let price = customPrice;
    if (price === undefined) {
      const sizeObj = product.sizes?.find((s) => s.sizeMl === selectedSize);
      price = sizeObj ? sizeObj.price : product.price;
    }

    const itemKey = `${product.id}-${selectedSize}`;

    setItems((prev) => {
      const existing = prev.find((item) => item.id === itemKey);
      if (existing) {
        return prev.map((item) =>
          item.id === itemKey
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [
        ...prev,
        {
          id: itemKey,
          productId: product.id,
          product,
          sizeMl: selectedSize,
          quantity,
          unitPrice: price!,
        },
      ];
    });

    setIsCartOpen(true);
  };

  const updateQuantity = (id: string, delta: number) => {
    setItems((prev) => {
      return prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
    localStorage.removeItem('rawaei_cart');
    localStorage.removeItem('rawaei_coupon');
  };

  const subtotal = items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );

  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'PERCENTAGE') {
      discountAmount = (subtotal * appliedCoupon.discountValue) / 100;
      if (appliedCoupon.maxDiscount && discountAmount > appliedCoupon.maxDiscount) {
        discountAmount = appliedCoupon.maxDiscount;
      }
    } else {
      discountAmount = appliedCoupon.discountValue;
    }
    if (discountAmount > subtotal) discountAmount = subtotal;
  }

  // Free shipping in Egypt above 800 EGP, otherwise standard 50 EGP
  const shippingCost = subtotal >= 800 || items.length === 0 ? 0 : 50;
  const total = Math.max(0, subtotal - discountAmount + shippingCost);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const applyCoupon = async (code: string) => {
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim(), orderSubtotal: subtotal }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, message: data.error || 'كوبون الخصم غير صالح' };
      }
      setAppliedCoupon(data.coupon);
      return { success: true, message: data.message || 'تم تطبيق الخصم بنجاح!' };
    } catch {
      return { success: false, message: 'تعذر التحقق من الكوبون، حاول مجدداً' };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        subtotal,
        discountAmount,
        shippingCost,
        total,
        itemCount,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
