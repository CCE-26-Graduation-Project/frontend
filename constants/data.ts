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

export interface TrendingProduct {
  id: string;
  name: string;
  vendor: string;
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

export const TRENDING_PRODUCTS: TrendingProduct[] = [
  { id: '1', name: 'Dyson V15 Detect Vacuum', vendor: 'Dyson', tone: 'warm' },
  { id: '2', name: 'LEGO Botanical Roses', vendor: 'LEGO', tone: 'character' },
  { id: '3', name: 'iPad mini 7th gen', vendor: 'Apple Store', tone: 'accent' },
  { id: '4', name: 'Nintendo Switch OLED', vendor: 'Nintendo', tone: 'dark' },
  { id: '5', name: 'Hario V60 Pour Over', vendor: 'Specialty Coffee', tone: 'warm' },
];

export const RESULTS_GRID: Product[] = [
  { id: 'g1', name: 'Sony WH-1000XM5 wireless headphones', store: 'Best Buy', storeLogo: 'BB', price: '$249.00', oldPrice: '$329.00', discountPct: 24, tone: 'accent' },
  { id: 'g2', name: 'Apple iPhone 15 Pro 256GB Titanium', store: 'Apple Store', storeLogo: 'A', price: '$999.00', tone: 'dark' },
  { id: 'g3', name: 'Nike Air Max 90 Sneakers', store: 'Nike', storeLogo: 'N', price: '$89.97', oldPrice: '$140.00', discountPct: 36, tone: 'warm' },
  { id: 'g4', name: 'Dyson V15 Detect Vacuum', store: 'Dyson', storeLogo: 'D', price: '$649.00', tone: 'character' },
  { id: 'g5', name: 'LEGO Botanical Roses 10328', store: 'LEGO', storeLogo: 'L', price: '$54.99', tone: 'warm' },
  { id: 'g6', name: 'Hario V60 Pour Over Set', store: 'Coffee Co.', storeLogo: 'C', price: '$32.50', oldPrice: '$42.50', discountPct: 24, tone: 'character' },
];

export const RESULTS_LIST: ListProduct[] = [
  { id: 'l1', name: 'LG OLED C3 65" 4K Smart TV', specs: 'OLED · 120Hz · webOS 23', priceRange: '$1,499 – $2,199', topStores: ['Best Buy', 'LG.com', 'Amazon'], stores: '23 stores', tone: 'dark' },
  { id: 'l2', name: 'Sony WH-1000XM5 Wireless Headphones', specs: 'Active noise cancel · 30h battery', priceRange: '$249 – $429', topStores: ['Best Buy', 'Sony', 'B&H Photo'], stores: '18 stores', tone: 'accent' },
  { id: 'l3', name: 'Apple MacBook Air 13" M3', specs: '8GB / 256GB · Starlight', priceRange: '$999 – $1,199', topStores: ['Apple Store', 'Best Buy', 'Amazon'], stores: '11 stores', tone: 'character' },
  { id: 'l4', name: 'Dyson V15 Detect Cordless Vacuum', specs: 'Laser detection · 60min runtime', priceRange: '$549 – $799', topStores: ['Dyson', 'Best Buy', 'Target'], stores: '12 stores', tone: 'warm' },
];

export const NOTIFICATIONS = [
  { id: 'n1', unread: true, expression: 'happy' as const, title: 'Price drop on iPhone 15 Pro', body: 'Now $899 at Apple Store — down $100 from yesterday.', time: 'Just now' },
  { id: 'n2', unread: false, expression: 'thinking' as const, title: 'Back in stock: Sony WH-1000XM5', body: 'Available again at Best Buy from $329.', time: '2h ago' },
  { id: 'n3', unread: false, expression: 'waving' as const, title: 'Welcome to Snoop', body: "I'll sniff out the best prices on everything you save.", time: 'Yesterday' },
];

export const COMPARISON_ITEMS = [
  { id: 'c1', tone: 'accent' as ProductTone, name: 'Sony WH-1000XM5', store: 'Best Buy', price: '$329.00', lowest: true },
  { id: 'c2', tone: 'dark' as ProductTone, name: 'Bose QuietComfort Ultra', store: 'Bose', price: '$429.00', lowest: false },
  { id: 'c3', tone: 'character' as ProductTone, name: 'Apple AirPods Max', store: 'Apple Store', price: '$549.00', lowest: false },
];

export const PRODUCT_DETAIL = {
  id: 'g2',
  name: 'Apple iPhone 15 Pro 256GB Titanium',
  category: 'Electronics',
  store: 'Apple Store',
  storeLogo: 'A',
  price: '$999.00',
  oldPrice: '$1,099.00',
  discountPct: 9,
  tone: 'dark' as ProductTone,
  specs: [
    ['Display', '6.1" Super Retina XDR'],
    ['Chip', 'A17 Pro'],
    ['Storage', '256 GB'],
    ['Camera', '48MP main + 12MP ultrawide'],
    ['Battery', 'Up to 23h video'],
  ] as [string, string][],
  description: 'iPhone 15 Pro is forged in titanium and features the groundbreaking A17 Pro chip, a customizable Action button, and the most powerful iPhone camera system ever.',
};
