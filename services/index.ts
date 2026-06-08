/**
 * Backend service layer — single import surface for the whole app.
 *
 * Screens import from here, e.g.:
 *     import { searchByText, enrichResults } from '../services';
 *
 * Files:
 *   config.ts     base URLs (per-platform) + timeouts
 *   apiClient.ts  fetch wrapper: timeout, JSON, errors, session cookies
 *   types.ts      wire shapes (SearchResult, ApiProduct, AuthUser)
 *   search.ts     WIRED  → POST /api/public/search  (text/img embeddings)
 *   products.ts   STUBS  → product details/trending + API→UI mapping
 *   auth.ts       node-auth (SuperTokens) sign in/up/out + session check
 */

export { config } from './config';
export { ApiError, NetworkError, getJson, postJson, postMultipart } from './apiClient';
export type { SearchResult, ApiProduct, AuthUser } from './types';

export { searchByText, searchByImage, searchMultimodal } from './search';
export {
  getProductsByIds,
  getProductById,
  getTrending,
  enrichResults,
  mapApiProductToUi,
  toPlaceholderProduct,
  NotImplementedError,
} from './products';
export { signUp, signIn, signOut, isSignedIn } from './auth';
