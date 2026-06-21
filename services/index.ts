/**
 * Backend service layer — single import surface for the whole app.
 *
 * Screens import from here, e.g.:
 *     import { searchByText, enrichResults } from '../services';
 *
 * Files:
 *   config.ts       base URLs (per-platform) + timeouts
 *   apiClient.ts    fetch wrapper: timeout, JSON, errors, session cookies
 *   types.ts        wire shapes (SearchResult, TrendingResultDto, FavouriteResultDto, AuthUser)
 *   search.ts       WIRED → POST /api/public/search  (text/img embeddings)
 *   products.ts     WIRED → GET /api/public/trending + API→UI mapping
 *   favourites.ts   WIRED → GET/POST/DELETE /api/secure/favourites
 *   auth.ts         node-auth (SuperTokens) sign in/up/out + session check
 */

export { config } from './config';
export { ApiError, NetworkError, getJson, postJson, postMultipart, deleteJson } from './apiClient';
export type { SearchResult, SearchPage, TrendingResultDto, FavouriteResultDto, AuthUser } from './types';

export { searchByText, searchByImage, searchMultimodal } from './search';
export {
  getTrending,
  enrichResults,
  searchResultToProduct,
  trendingResultToProduct,
} from './products';
export {
  getFavourites,
  addFavourite,
  removeFavourite,
  favouriteToProduct,
} from './favourites';
export { signUp, signIn, signOut, isSignedIn } from './auth';
