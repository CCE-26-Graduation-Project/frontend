/**
 * FAVOURITES SERVICE — talks to the springboot-api secure favourites endpoints.
 *
 * All routes here live under /api/secure/favourites, which means they require a valid
 * JWT in the Authorization header. The springboot SecurityConfig grants access to
 * /api/secure/** only to authenticated users. If no session exists, the server returns
 * 401 and ApiError is thrown — callers (FavouritesContext) catch this and degrade
 * gracefully to local-only state.
 *
 * Backend controller: springboot-api/.../api/FavouriteController.java
 */

import { getJson, postJson, deleteJson } from './apiClient';
import type { FavouriteResultDto } from './types';
import type { Product, ProductTone } from '../constants/data';

const BASE = '/api/secure/favourites';

// ─── Tone derivation (same algorithm used in products.ts) ────────────────────
// Gives each product a stable visual tone based on its ID so placeholder colours
// are consistent across sessions and across search / favourites screens.
const TONES: ProductTone[] = ['accent', 'warm', 'dark', 'character'];

function toneForId(id: string): ProductTone {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash + id.charCodeAt(i)) % TONES.length;
  return TONES[hash];
}

// ─── DTO → UI mapper ─────────────────────────────────────────────────────────

/**
 * Convert a FavouriteResultDto (wire shape from the backend) to a Product
 * (UI shape consumed by cards and the detail screen).
 * Mirrors the approach in products.ts / searchResultToProduct.
 */
export function favouriteToProduct(dto: FavouriteResultDto): Product {
  return {
    id: String(dto.productId),
    name: dto.name,
    store: dto.vendor,
    storeLogo: dto.vendor.charAt(0).toUpperCase(),
    price: `EGP ${dto.price.toFixed(2)}`,
    imageUrl: dto.imageUrl ?? undefined,
    imageUrls: dto.imageUrls,
    category: dto.category,
    productUrl: dto.productUrl ?? undefined,
    tone: toneForId(String(dto.productId)),
    saved: true, // anything returned by this endpoint is by definition saved
  };
}

// ─── API calls ───────────────────────────────────────────────────────────────

/**
 * Fetch all favourites for the currently signed-in user.
 * Throws ApiError(401) when not authenticated — callers should handle this.
 * GET /api/secure/favourites
 */
export async function getFavourites(): Promise<FavouriteResultDto[]> {
  return getJson<FavouriteResultDto[]>(BASE);
}

/**
 * Save a product to the user's favourites.
 * The backend is idempotent — calling this twice for the same product is safe.
 * POST /api/secure/favourites/{productId}
 */
export async function addFavourite(productId: string): Promise<void> {
  // Spring responds with 204 No Content on success; postJson returns null for empty bodies.
  await postJson<void>(`${BASE}/${productId}`, {});
}

/**
 * Remove a product from the user's favourites.
 * DELETE /api/secure/favourites/{productId}
 */
export async function removeFavourite(productId: string): Promise<void> {
  await deleteJson<void>(`${BASE}/${productId}`);
}
