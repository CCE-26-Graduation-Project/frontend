import { Platform } from 'react-native';
import { postMultipart } from './apiClient';
import type { SearchResult } from './types';

/**
 * SEARCH SERVICE  —  WIRED to springboot-api.
 *
 * Backend endpoint:  POST /api/public/search   (multipart/form-data)
 *   form parts (both optional, but at least one required):
 *     • text → matched against the product TEXT embedding   (DB column: txt_emb)
 *     • file → matched against the product IMAGE embedding  (DB column: img_emb)
 *   returns: SearchResult[]  =  [{ productId, similarity }, ...]
 *   (springboot-api/.../api/SearchController.java → SearchService.search)
 *
 * Connected to:
 *   • app/search.tsx   → search box submits a query, app/results.tsx calls searchByText()
 *   • app/(tabs)/camera.tsx → captured image calls searchByImage()
 *
 * The endpoint returns only IDs + scores. Turning those into product cards is a second
 * step — see services/products.ts (enrichResults / getProductsByIds).
 */

const SEARCH_PATH = '/api/public/search';

// ════════════════════════════════════════════════════════════════════════════════
// TEXT-EMBEDDING SEARCH  (backend column: txt_emb)
// To remove text search later, delete this function AND the text branch of
// searchMultimodal below. See the embedding note in services/types.ts.
// ════════════════════════════════════════════════════════════════════════════════
export async function searchByText(text: string): Promise<SearchResult[]> {
  const trimmed = text.trim();
  if (!trimmed) return [];

  const form = new FormData();
  form.append('text', trimmed);
  return postMultipart<SearchResult[]>(SEARCH_PATH, form);
}

// ════════════════════════════════════════════════════════════════════════════════
// IMAGE-EMBEDDING SEARCH  (backend column: img_emb)
// To remove image search later, delete this function AND the image branch of
// searchMultimodal below, AND the camera wiring in app/(tabs)/camera.tsx.
// ════════════════════════════════════════════════════════════════════════════════
export async function searchByImage(imageUri: string): Promise<SearchResult[]> {
  const form = new FormData();
  await appendImagePart(form, imageUri);
  return postMultipart<SearchResult[]>(SEARCH_PATH, form);
}

// ════════════════════════════════════════════════════════════════════════════════
// MULTIMODAL SEARCH  (uses BOTH txt_emb + img_emb; backend averages the two scores)
// If you drop one embedding, delete the matching branch here as noted above.
// ════════════════════════════════════════════════════════════════════════════════
export async function searchMultimodal(text: string, imageUri: string): Promise<SearchResult[]> {
  const form = new FormData();

  const trimmed = text.trim();
  if (trimmed) {
    form.append('text', trimmed); // ← text branch (txt_emb)
  }

  await appendImagePart(form, imageUri); // ← image branch (img_emb)

  return postMultipart<SearchResult[]>(SEARCH_PATH, form);
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
