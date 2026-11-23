import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import { LanguageProvider } from '@/context/LanguageContext';
import StoreLayout from '@/components/layout/StoreLayout';

export const metadata: Metadata = {
  title: 'روائع للعطور – RAWAEI PERFUMES | المتجر الرسمي للعطور الملكية والعود في مصر',
  description:
    'متجر روائع للعطور، أفخم العطور الشرقية والفرنسية، دهن العود المعتّق، البخور المروكي الفاخر، ومجموعات الهدايا مع توصيل سريع لكافة محافظات مصر.',
  keywords: [
    'عطور',
    'روائع للعطور',
    'عطور مصر',
    'دهن عود',
    'بخور مروكي',
    'عطور رجالية',
    'عطور نسائية',
    'عطور للجنسين',
    'القاهرة',
    'RAWAEI PERFUMES',
  ],
  authors: [{ name: 'MOHAMED ALGAZZAR', url: 'https://www.facebook.com/algazzar2015' }],
  creator: 'MOHAMED ALGAZZAR',
  publisher: 'MOHAMED ALGAZZAR',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
  openGraph: {
    title: 'روائع للعطور – RAWAEI PERFUMES',
    description: 'الفخامة في كل قطرة عطر – المتجر الرسمي للعطور الفاخرة والعود في مصر',
    siteName: 'روائع للعطور',
    locale: 'ar_EG',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      </head>
      <body className="antialiased selection:bg-[#C49A45]/30 selection:text-[#DFC27A]" suppressHydrationWarning>
        <LanguageProvider>
          <CartProvider>
            <StoreLayout>{children}</StoreLayout>
          </CartProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
