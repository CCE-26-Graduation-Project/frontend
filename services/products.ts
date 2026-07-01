import { getJson } from './apiClient';
import type { SearchResult, TrendingResultDto } from './types';
import type { Product, ProductTone } from '../constants/data';

const TONES: ProductTone[] = ['accent', 'warm', 'dark', 'character'];

function toneForId(id: string): ProductTone {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash + id.charCodeAt(i)) % TONES.length;
  return TONES[hash];
}

function formatPrice(price: number): string {
  return `EGP ${price.toFixed(2)}`;
}

export function searchResultToProduct(result: SearchResult): Product {
  return {
    id: String(result.productId),
    name: result.name,
    store: result.vendor,
    storeLogo: result.vendor.charAt(0).toUpperCase(),
    price: formatPrice(result.price),
    imageUrl: result.imageUrl ?? undefined,
    imageUrls: result.imageUrls,
    category: result.category,
    productUrl: result.productUrl ?? undefined,
    tone: toneForId(String(result.productId)),
    saved: result.isFavourite,
  };
}

export function trendingResultToProduct(result: TrendingResultDto): Product {
  return {
    id: String(result.productId),
    name: result.name,
    store: result.vendor,
    storeLogo: result.vendor.charAt(0).toUpperCase(),
    price: formatPrice(result.price),
    imageUrl: result.imageUrl ?? undefined,
    imageUrls: result.imageUrls,
    category: result.category,
    productUrl: result.productUrl ?? undefined,
    tone: toneForId(String(result.productId)),
  };
}

export async function getTrending(timeframe: 'daily' | 'weekly' | 'monthly' | 'all-time' = 'daily'): Promise<Product[]> {
  const results = await getJson<TrendingResultDto[]>(`/api/public/trending?timeframe=${timeframe}`);
  return results.map(trendingResultToProduct);
}

export type Vendor = { name: string; websiteUrl: string };

export async function getVendors(): Promise<Vendor[]> {
  return getJson<Vendor[]>('/api/public/vendors');
}

export async function enrichResults(results: SearchResult[]): Promise<Product[]> {
  if (results.length === 0) return [];
  return results.map(searchResultToProduct);
}
