export type ProductTone = 'accent' | 'warm' | 'dark' | 'character';

export interface Product {
  id: string;
  name: string;
  store: string;
  storeLogo: string;
  price: string;
  oldPrice?: string;
  discountPct?: number;
  tone: ProductTone;
  saved?: boolean;
  imageUrl?: string;
  imageUrls?: string[];
  category?: string;
  productUrl?: string;
}

export interface ListProduct {
  id: string;
  name: string;
  specs: string;
  priceRange: string;
  topStores: string[];
  stores: string;
  tone: ProductTone;
}

export interface Category {
  icon: string;
  label: string;
}

export const CATEGORY_LIST: Category[] = [
  { icon: 'shirt', label: 'Clothes' },
  { icon: 'shoe', label: 'Shoes' },
  { icon: 'bag', label: 'Bags' },
  { icon: 'sportswear', label: 'Sportswear' },
];


