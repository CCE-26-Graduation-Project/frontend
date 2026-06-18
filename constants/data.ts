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
  { icon: 'shirt', label: 'Fashion' },
  { icon: 'shoe', label: 'Shoes' },
  { icon: 'bag', label: 'Bags' },
  { icon: 'fridge', label: 'Appliances' },
];

export const NOTIFICATIONS = [
  { id: 'n1', unread: true, expression: 'happy' as const, title: 'Price drop on iPhone 15 Pro', body: 'Now $899 at Apple Store — down $100 from yesterday.', time: 'Just now' },
  { id: 'n2', unread: false, expression: 'thinking' as const, title: 'Back in stock: Sony WH-1000XM5', body: 'Available again at Best Buy from $329.', time: '2h ago' },
  { id: 'n3', unread: false, expression: 'waving' as const, title: 'Welcome to Snoop', body: "I'll sniff out the best prices on everything you save.", time: 'Yesterday' },
];

