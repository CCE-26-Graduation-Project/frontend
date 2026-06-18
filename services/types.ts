/**
 * API-layer types — the shapes that cross the wire between this app and the backend.
 *
 * Keep these SEPARATE from the UI types in constants/data.ts. The mapping from an API
 * shape to a UI shape lives in services/products.ts. That boundary lets the backend
 * change without touching every screen.
 */

/** Mirrors SearchResultDto in springboot-api/.../search/SearchResultDto.java */
export interface SearchResult {
  productId: string;
  similarity: number;
  name: string;
  price: number;
  vendor: string;
  category: string;
  imageUrl: string | null;
  productUrl: string | null;
  color: string | null;
  imageUrls: string[];
  isFavourite: boolean;
}

/** Mirrors TrendingResultDto in springboot-api/.../trending/TrendingResultDto.java */
export interface TrendingResultDto {
  productId: string;
  name: string;
  price: number;
  vendor: string;
  category: string;
  productUrl: string | null;
  imageUrl: string | null;
  color: string | null;
  searchCount: number;
  imageUrls: string[];
}

/**
 * Mirrors FavouriteResultDto in springboot-api/.../favourites/FavouriteResultDto.java
 * Returned by GET /api/secure/favourites — requires a valid JWT session.
 */
export interface FavouriteResultDto {
  productId: string;
  name: string;
  price: number;
  vendor: string;
  category: string;
  productUrl: string | null;
  color: string | null;
  imageUrls: string[];
}

/** Authenticated user, as exposed by the secure backend endpoint(s). */
export interface AuthUser {
  id: string;
  email: string;
}
