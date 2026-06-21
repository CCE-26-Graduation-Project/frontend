import { useCallback, useRef, useState } from 'react';
import {
  searchByText,
  searchByImage,
  searchMultimodal,
  enrichResults,
  ApiError,
  NetworkError,
} from '../services';
import type { Product } from '../constants/data';

/**
 * PAGINATED SEARCH HOOK
 *
 * Owns the full search lifecycle so the screens (app/results.tsx, app/(tabs)/browse.tsx)
 * don't each re-implement it:
 *   • search(params)  → run a fresh search at page 0 (replaces the list)
 *   • loadMore()      → fetch the next page and APPEND it (the "Load more" button)
 *
 * The backend (/api/public/search) returns a SearchPage: { content, page, totalPages,
 * totalElements }. We accumulate `content` across pages and expose `hasMore` so the UI
 * knows whether to show the Load-more button.
 *
 * Concurrency: a monotonically increasing `runId` invalidates in-flight requests, so a
 * slow page-0 response from an old query can never overwrite a newer search, and a
 * load-more that resolves after a new search started is discarded.
 */

export interface SearchParams {
  text: string;
  imageUri: string | null;
}

interface Options {
  /** Called with each batch of NEW cards (initial page and every load-more). */
  onResults?: (cards: Product[]) => void;
  /** Start in the loading state — use on screens that search immediately on mount. */
  initialLoading?: boolean;
}

function messageFor(err: unknown): string {
  if (err instanceof NetworkError)
    return "Can't reach the server. Check your connection and that the API is running.";
  if (err instanceof ApiError) return err.message;
  return 'Something went wrong while searching.';
}

// Pick the search mode from what the user provided: image + text → multimodal,
// image only → image search, text only → text search.
function fetchPage(params: SearchParams, page: number) {
  const q = params.text.trim();
  const img = params.imageUri;
  return img
    ? q
      ? searchMultimodal(q, img, page)
      : searchByImage(img, page)
    : searchByText(q, page);
}

export function usePaginatedSearch({ onResults, initialLoading = false }: Options = {}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(initialLoading);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadMoreError, setLoadMoreError] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [totalElements, setTotalElements] = useState(0);

  // Refs carry the latest values into async callbacks without stale closures and
  // without forcing the callbacks to be re-created on every state change.
  const onResultsRef = useRef(onResults);
  onResultsRef.current = onResults;
  const paramsRef = useRef<SearchParams | null>(null);
  const pageRef = useRef(0);
  const totalPagesRef = useRef(0);
  const runIdRef = useRef(0);
  const loadingMoreRef = useRef(false);

  const search = useCallback(async (params: SearchParams) => {
    const q = params.text.trim();
    const img = params.imageUri;
    const runId = ++runIdRef.current; // invalidate any in-flight request
    paramsRef.current = params;
    pageRef.current = 0;
    totalPagesRef.current = 0;
    loadingMoreRef.current = false;
    setLoadingMore(false);
    setLoadMoreError(false);

    // Nothing to search — clear out and bail (e.g. the query box was emptied).
    if (!q && !img) {
      setProducts([]);
      setError(null);
      setLoading(false);
      setHasMore(false);
      setTotalElements(0);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const pageDto = await fetchPage(params, 0);
      if (runId !== runIdRef.current) return; // superseded by a newer search
      const cards = await enrichResults(pageDto.content);
      if (runId !== runIdRef.current) return;
      pageRef.current = pageDto.page;
      totalPagesRef.current = pageDto.totalPages;
      setProducts(cards);
      setTotalElements(pageDto.totalElements);
      setHasMore(pageDto.page + 1 < pageDto.totalPages);
      onResultsRef.current?.(cards);
    } catch (err) {
      if (runId !== runIdRef.current) return;
      setError(messageFor(err));
      setProducts([]);
      setHasMore(false);
    } finally {
      if (runId === runIdRef.current) setLoading(false);
    }
  }, []);

  const loadMore = useCallback(async () => {
    // Guard against double taps and against loading past the last page.
    if (loadingMoreRef.current || !paramsRef.current) return;
    if (pageRef.current + 1 >= totalPagesRef.current) return;

    const runId = runIdRef.current; // tie this fetch to the current search session
    const nextPage = pageRef.current + 1;
    loadingMoreRef.current = true;
    setLoadingMore(true);
    setLoadMoreError(false);
    try {
      const pageDto = await fetchPage(paramsRef.current, nextPage);
      if (runId !== runIdRef.current) return; // a new search started meanwhile
      const cards = await enrichResults(pageDto.content);
      if (runId !== runIdRef.current) return;
      pageRef.current = pageDto.page;
      totalPagesRef.current = pageDto.totalPages;
      setProducts((prev) => [...prev, ...cards]); // APPEND, don't replace
      setTotalElements(pageDto.totalElements);
      setHasMore(pageDto.page + 1 < pageDto.totalPages);
      onResultsRef.current?.(cards);
    } catch {
      if (runId === runIdRef.current) setLoadMoreError(true);
    } finally {
      loadingMoreRef.current = false;
      if (runId === runIdRef.current) setLoadingMore(false);
    }
  }, []);

  const reset = useCallback(() => {
    runIdRef.current++;
    loadingMoreRef.current = false;
    paramsRef.current = null;
    pageRef.current = 0;
    totalPagesRef.current = 0;
    setProducts([]);
    setError(null);
    setLoading(false);
    setLoadingMore(false);
    setHasMore(false);
    setLoadMoreError(false);
    setTotalElements(0);
  }, []);

  return {
    products,
    loading,
    loadingMore,
    error,
    loadMoreError,
    hasMore,
    totalElements,
    search,
    loadMore,
    reset,
  };
}
