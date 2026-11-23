import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number, locale: 'ar' | 'en' = 'ar'): string {
  const rounded = Math.round(amount);
  if (locale === 'ar') {
    return `${rounded.toLocaleString('ar-EG')} ج.م`;
  }
  return `${rounded.toLocaleString('en-US')} EGP`;
}

export function formatDate(date: string | Date, locale: 'ar' | 'en' = 'ar'): string {
  const d = new Date(date);
  return d.toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
