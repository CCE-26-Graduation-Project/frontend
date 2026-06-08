import { getJson } from './apiClient';
import type { ApiProduct, SearchResult } from './types';
import type { Product, ProductTone } from '../constants/data';

/**
 * PRODUCT SERVICE  —  STUBS (backend endpoints not built yet).
 *
 * The search endpoint returns only product IDs + similarity scores. To render real
 * product cards (name / price / store / image) the backend must expose product
 * details. Those endpoints do not exist yet, so the functions below are written
 * against their INTENDED contract and throw `NotImplementedError` until the backend
 * ships them.
 *
 * ── HOW TO GO LIVE when the backend adds the endpoints ──
 *   1. Delete the `throw new NotImplementedError(...)` line in the function.
 *   2. Uncomment the `return getJson(...)` line right below it.
 *   3. Nothing in the screens changes — enrichResults() already prefers real data
 *      and only falls back to placeholders when these throw.
 */

/** Marker error so callers can distinguish "endpoint missing" from a real failure. */
export class NotImplementedError extends Error {
  constructor(endpoint: string) {
    super(`Backend endpoint not implemented yet: ${endpoint}`);
    this.name = 'NotImplementedError';
  }
}

// ─── Intended endpoints (stubbed) ────────────────────────────────────────────────

/** Batch-fetch product details for the IDs returned by a search. */
export async function getProductsByIds(ids: string[]): Promise<ApiProduct[]> {
  if (ids.length === 0) return [];
  throw new NotImplementedError('GET /api/public/products?ids=...');
  // return getJson<ApiProduct[]>(`/api/public/products?ids=${ids.join(',')}`);
}

/** Fetch one product's full detail (for app/product/[id].tsx). */
export async function getProductById(id: string): Promise<ApiProduct> {
  throw new NotImplementedError(`GET /api/public/products/${id}`);
  // return getJson<ApiProduct>(`/api/public/products/${encodeURIComponent(id)}`);
}

/** Trending products for the home screen. */
export async function getTrending(): Promise<ApiProduct[]> {
  throw new NotImplementedError('GET /api/public/trending');
  // return getJson<ApiProduct[]>('/api/public/trending');
}

// ─── Mapping: API shape → UI shape ───────────────────────────────────────────────
// This is the only place that knows how a backend product becomes a card. Keeping it
// here means screens import a stable UI `Product` and never see the raw API shape.

const TONES: ProductTone[] = ['accent', 'warm', 'dark', 'character'];

/** Stable per-id tone so a product looks the same every render. */
function toneForId(id: string): ProductTone {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash + id.charCodeAt(i)) % TONES.length;
  return TONES[hash];
}

export function mapApiProductToUi(api: ApiProduct): Product {
  return {
    id: api.id,
    name: api.name,
    store: api.store,
    storeLogo: api.storeLogo ?? api.store.charAt(0).toUpperCase(),
    price: api.price,
    oldPrice: api.oldPrice,
    discountPct: api.discountPct,
    imageUrl: api.imageUrl,
    category: api.category,
    productUrl: api.productUrl,
    tone: toneForId(api.id),
  };
}

/** Map a search hit (which now carries full product fields) directly to a UI card. */
export function searchResultToProduct(result: SearchResult): Product {
  return {
    id: String(result.productId),
    name: result.name,
    store: result.vendor,
    storeLogo: result.vendor.charAt(0).toUpperCase(),
    price: result.price,
    imageUrl: result.imageUrl ?? undefined,
    category: result.category,
    productUrl: result.productUrl ?? undefined,
    tone: toneForId(String(result.productId)),
  };
}

/** Turn search hits into UI-ready product cards. Search results already carry full product data. */
export async function enrichResults(results: SearchResult[]): Promise<Product[]> {
  if (results.length === 0) return [];
  return results.map(searchResultToProduct);
}
