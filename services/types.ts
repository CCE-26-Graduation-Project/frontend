/**
 * API-layer types — the shapes that cross the wire between this app and the backend.
 *
 * Keep these SEPARATE from the UI types in constants/data.ts. The mapping from an API
 * shape to a UI shape lives in services/products.ts (`mapApiProductToUi`). That boundary
 * is what lets the backend change without touching every screen.
 */

/**
 * Exactly what POST /api/public/search returns today.
 * Mirrors the backend record `SearchResultDto(UUID productId, Double similarity)`.
 * (springboot-api/.../search/SearchResultDto.java)
 *
 * NOTE: the search endpoint returns ONLY these two fields — no name/price/image.
 * To turn these into displayable cards we need product details, fetched separately
 * (see services/products.ts → getProductsByIds).
 */
export interface SearchResult {
  productId: string;
  similarity: number;
  name: string;
  price: string;
  vendor: string;
  category: string;
  imageUrl: string | null;
  productUrl: string | null;
}

/**
 * Full product details as a future GET /api/public/products endpoint WOULD return them.
 * This is the contract the UI is built against, so the moment the backend ships that
 * endpoint, the results/detail screens light up with real data and nothing else changes.
 *
 * ┌──────────────────────────────────────────────────────────────────────────────┐
 * │ EMBEDDING COLUMNS — txt_emb / img_emb                                          │
 * │                                                                                │
 * │ The Postgres `products` table also has vector columns `txt_emb` (text          │
 * │ embedding) and `img_emb` (image embedding). They power similarity search ONLY  │
 * │ and must NEVER be sent to the app (they are large and useless to the UI), so   │
 * │ they are intentionally absent from this type.                                  │
 * │                                                                                │
 * │ IF YOU LATER DROP one of them on the backend:                                  │
 * │   • Drop img_emb  → also remove searchByImage + the image branch of            │
 * │                     searchMultimodal in services/search.ts, and the camera     │
 * │                     wiring in app/(tabs)/camera.tsx. Nothing here changes.      │
 * │   • Drop txt_emb  → also remove searchByText + the text branch of              │
 * │                     searchMultimodal in services/search.ts, and the search box │
 * │                     handoff in app/search.tsx → app/results.tsx.               │
 * │ Because embeddings never appear in this type, removing them never breaks the   │
 * │ UI layer — only the search paths above need pruning.                           │
 * └──────────────────────────────────────────────────────────────────────────────┘
 */
export interface ApiProduct {
  id: string;
  name: string;
  store: string;
  storeLogo?: string;
  price: string;
  oldPrice?: string;
  discountPct?: number;
  imageUrl?: string; // remote image; UI falls back to a placeholder when absent
  productUrl?: string; // "Go to store" deep link
  category?: string;
  details?: string[];
  specs?: [string, string][];
  description?: string;
}

/** Authenticated user, as exposed by the secure backend endpoint(s). */
export interface AuthUser {
  id: string;
  email: string;
}
