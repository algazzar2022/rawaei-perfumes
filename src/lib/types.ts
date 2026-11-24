export type Role = 'ADMIN' | 'MANAGER' | 'STAFF' | 'CUSTOMER';
export type Gender = 'HIM' | 'HER' | 'UNISEX';
export type BannerType = 'HERO' | 'PROMO_WIDE' | 'PROMO_SMALL_1' | 'PROMO_SMALL_2';
export type BannerMode = 'STATIC' | 'SLIDESHOW' | 'VIDEO';
export type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

export interface ProductSizeDto {
  id: string;
  sizeMl: number;
  price: number;
  comparePrice?: number | null;
  stock: number;
  isDefault: boolean;
}

export interface ProductImageDto {
  id: string;
  url: string;
  alt?: string | null;
  isMain: boolean;
  sortOrder: number;
}

export interface CategoryDto {
  id: string;
  nameAr: string;
  nameEn: string;
  slug: string;
  descriptionAr?: string | null;
  descriptionEn?: string | null;
  image?: string | null;
  icon?: string | null;
  sortOrder: number;
  isActive: boolean;
  _count?: {
    products: number;
  };
}

export interface FragranceNoteDto {
  id: string;
  nameAr: string;
  nameEn: string;
  image?: string | null;
  category?: string | null;
  createdAt?: string | Date;
}

export interface ProductFragranceNoteDto {
  id: string;
  productId: string;
  noteId: string;
  note: FragranceNoteDto;
  type: 'TOP' | 'HEART' | 'BASE';
  sortOrder: number;
}

export interface ProductDto {
  id: string;
  nameAr: string;
  nameEn: string;
  slug: string;
  descriptionAr: string;
  descriptionEn: string;
  price: number;
  compareAtPrice?: number | null;
  costPrice?: number | null;
  sku?: string | null;
  stock: number;
  volumeMl: number;
  gender: string;
  scentFamily?: string | null;
  topNotes?: string | null;
  heartNotes?: string | null;
  baseNotes?: string | null;
  longevity?: string | null;
  sillage?: string | null;
  isFeatured: boolean;
  isActive: boolean;
  rating: number;
  reviewCount: number;
  categoryId: string;
  category?: CategoryDto;
  images: ProductImageDto[];
  sizes: ProductSizeDto[];
  fragranceNotes?: ProductFragranceNoteDto[];
  createdAt?: string | Date;
}

export interface BannerSlideDto {
  id: string;
  bannerId: string;
  titleAr?: string | null;
  titleEn?: string | null;
  subtitleAr?: string | null;
  subtitleEn?: string | null;
  desktopImage: string;
  mobileImage?: string | null;
  link?: string | null;
  buttonTextAr?: string | null;
  buttonTextEn?: string | null;
  durationSeconds: number;
  sortOrder: number;
  isActive: boolean;
}

export interface BannerDto {
  id: string;
  type: string;
  mode: string;
  titleAr?: string | null;
  titleEn?: string | null;
  subtitleAr?: string | null;
  subtitleEn?: string | null;
  link?: string | null;
  buttonTextAr?: string | null;
  buttonTextEn?: string | null;
  desktopImage?: string | null;
  mobileImage?: string | null;
  videoUrl?: string | null;
  autoplaySpeed: number;
  isActive: boolean;
  sortOrder: number;
  slides?: BannerSlideDto[];
}

export interface CartItemDto {
  id: string;
  productId: string;
  product: ProductDto;
  sizeMl: number;
  quantity: number;
  unitPrice: number;
}

export interface CartDto {
  id: string;
  sessionId: string;
  couponCode?: string | null;
  items: CartItemDto[];
  subtotal: number;
  discountAmount: number;
  total: number;
}

export interface OrderItemDto {
  id: string;
  orderId: string;
  productId: string;
  productNameAr: string;
  productNameEn: string;
  sizeMl: number;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  product?: {
    images: ProductImageDto[];
  };
}

export interface OrderDto {
  id: string;
  orderNumber: string;
  status: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingCity: string;
  shippingAddress: string;
  shippingMethod: string;
  paymentMethod: string;
  paymentStatus: string;
  subtotal: number;
  discountAmount: number;
  shippingCost: number;
  taxAmount: number;
  totalAmount: number;
  couponCode?: string | null;
  customerNotes?: string | null;
  adminNotes?: string | null;
  createdAt: string | Date;
  items: OrderItemDto[];
}

export interface VideoReviewDto {
  id: string;
  authorName: string;
  authorHandle?: string | null;
  authorAvatar?: string | null;
  quoteAr: string;
  quoteEn?: string | null;
  badgeText?: string | null;
  videoUrl?: string | null;
  posterImage: string;
  platform?: string | null;
  productTag?: string | null;
  rating: number;
  sortOrder: number;
  isActive: boolean;
  createdAt?: string | Date;
}

