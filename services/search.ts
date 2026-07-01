import { Platform } from 'react-native';
import { getJson, postMultipart } from './apiClient';
import type { SearchPage } from './types';

// An empty page used as a safe default for blank queries or a malformed response,
// so callers can always read `.content` / `.totalPages` without null checks.
const EMPTY_PAGE: SearchPage = {
  content: [],
  page: 0,
  pageSize: 0,
  totalElements: 0,
  totalPages: 0,
};

// The backend returns a paginated SearchPageDto ({ content, page, totalPages, ... }).
// All three search variants POST the same form and differ only in which parts they
// attach, so the actual request lives here. `page` is a zero-based page index.
async function postSearch(form: FormData, page: number): Promise<SearchPage> {
  const pageDto = await postMultipart<SearchPage>(`${SEARCH_PATH}?page=${page}`, form);
  return pageDto ?? EMPTY_PAGE;
}

/**
 * SEARCH SERVICE  —  WIRED to springboot-api.
 *
 * Backend endpoint:  POST /api/public/search   (multipart/form-data)
 *   form parts (both optional, but at least one required):
 *     • text → matched against the product TEXT embedding   (DB column: txt_emb)
 *     • file → matched against the product IMAGE embedding  (DB column: img_emb)
 *   query param:  ?page=N  (zero-based; PAGE_SIZE is fixed at 20 on the backend)
 *   returns: SearchPage  =  { content: SearchResult[], page, pageSize, totalElements, totalPages }
 *   (springboot-api/.../api/SearchController.java → SearchService.search)
 *
 * Connected to:
 *   • app/search.tsx   → search box submits a query, app/results.tsx calls searchByText()
 *   • app/(tabs)/camera.tsx → captured image calls searchByImage()
 *
 * The endpoint returns full product data. Turning results into UI cards is done via
 * enrichResults() in services/products.ts.
 */

const SEARCH_PATH = '/api/public/search';

// ════════════════════════════════════════════════════════════════════════════════
// TEXT-EMBEDDING SEARCH  (backend column: txt_emb)
// To remove text search later, delete this function AND the text branch of
// searchMultimodal below. See the embedding note in services/types.ts.
// ════════════════════════════════════════════════════════════════════════════════
export async function searchByText(text: string, page = 0): Promise<SearchPage> {
  const trimmed = text.trim();
  if (!trimmed) return EMPTY_PAGE;

  const form = new FormData();
  form.append('text', trimmed);
  return postSearch(form, page);
}

// ════════════════════════════════════════════════════════════════════════════════
// IMAGE-EMBEDDING SEARCH  (backend column: img_emb)
// To remove image search later, delete this function AND the image branch of
// searchMultimodal below, AND the camera wiring in app/(tabs)/camera.tsx.
// ════════════════════════════════════════════════════════════════════════════════
export async function searchByImage(imageUri: string, page = 0): Promise<SearchPage> {
  const form = new FormData();
  await appendImagePart(form, imageUri);
  return postSearch(form, page);
}

// ════════════════════════════════════════════════════════════════════════════════
// MULTIMODAL SEARCH  (uses BOTH txt_emb + img_emb; backend averages the two scores)
// If you drop one embedding, delete the matching branch here as noted above.
// ════════════════════════════════════════════════════════════════════════════════
export async function searchMultimodal(text: string, imageUri: string, page = 0): Promise<SearchPage> {
  const form = new FormData();

  const trimmed = text.trim();
  if (trimmed) {
    form.append('text', trimmed); // ← text branch (txt_emb)
  }

  await appendImagePart(form, imageUri); // ← image branch (img_emb)

  return postSearch(form, page);
}

// ─── small helpers for image parts ───────────────────────────────────────────────

/**
 * Append the image to the form in a way that works on every platform:
 *   • web    → the picker yields a blob:/data: URL, which we fetch into a real Blob
 *              (the { uri, name, type } descriptor below is ignored by browsers).
 *   • native → React Native's FormData accepts a { uri, name, type } descriptor.
 */
async function appendImagePart(form: FormData, imageUri: string): Promise<void> {
  if (Platform.OS === 'web') {
    const blob = await (await fetch(imageUri)).blob();
    form.append('file', blob, fileNameFromUri(imageUri));
    return;
  }
  form.append('file', {
    uri: imageUri,
    name: fileNameFromUri(imageUri),
    type: mimeFromUri(imageUri),
  } as any);
}

// ════════════════════════════════════════════════════════════════════════════════
// AUTOCOMPLETE  (Elasticsearch-backed suggestions)
// GET /api/public/autocomplete?q=<query>&limit=<n>  → string[]
// Returns [] on any error so callers don't need to handle failures.
// ════════════════════════════════════════════════════════════════════════════════
export async function getAutocomplete(q: string, limit = 7): Promise<string[]> {
  const trimmed = q.trim();
  if (!trimmed) return [];
  try {
    const results = await getJson<string[]>(
      `/api/public/autocomplete?q=${encodeURIComponent(trimmed)}&limit=${limit}`
    );
    return Array.isArray(results) ? results : [];
  } catch (e) {
    console.warn('[autocomplete] request failed:', e);
    return [];
  }
}

function fileNameFromUri(uri: string): string {
  const last = uri.split('/').pop();
  return last && last.length > 0 ? last : `upload-${Date.now()}.jpg`;
}

function mimeFromUri(uri: string): string {
  const ext = uri.split('.').pop()?.toLowerCase();
  if (ext === 'png') return 'image/png';
  if (ext === 'webp') return 'image/webp';
  if (ext === 'heic') return 'image/heic';
  return 'image/jpeg';
}
