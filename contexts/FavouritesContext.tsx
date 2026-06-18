/**
 * FavouritesContext — global state for the user's saved products.
 *
 * HOW IT WORKS
 * ────────────
 * On mount, the context attempts to load the user's favourites from the backend
 * (GET /api/secure/favourites). If the user is not yet signed in, the server
 * returns 401 and we silently fall back to an empty local list — the app remains
 * fully functional, favourites just won't persist across sessions until auth is
 * wired up (see services/auth.ts + the future login screen in profile.tsx).
 *
 * TOGGLING A FAVOURITE
 * ────────────────────
 * toggleFavourite() uses an optimistic update pattern:
 *   1. Local state is updated immediately so the UI responds instantly.
 *   2. The backend call (POST or DELETE) is fired in the background.
 *   3. If the backend call fails, the local state is rolled back to what it was
 *      before the toggle, so the UI stays consistent with reality.
 *   4. If the user is not signed in (ApiError 401), we keep the local change but
 *      don't attempt the backend call — favourites survive for the session only.
 *
 * ADDING A SCREEN
 * ───────────────
 * Wrap the root layout with <FavouritesProvider> (already done in app/_layout.tsx).
 * Any screen or component can then call useFavourites() to read and update the list.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Product } from '../constants/data';
import { ApiError } from '../services/apiClient';
import {
  getFavourites,
  addFavourite,
  removeFavourite,
  favouriteToProduct,
} from '../services/favourites';

// ─── Context shape ────────────────────────────────────────────────────────────

interface FavouritesContextType {
  /** Current list of saved products (UI shape). */
  favourites: Product[];
  /** True while the initial backend fetch is in flight. */
  loading: boolean;
  /**
   * Toggle a product's saved state. Optimistically updates local state,
   * then syncs with the backend in the background.
   */
  toggleFavourite: (product: Product) => void;
  /** Returns true if the product with the given id is currently saved. */
  isFavourite: (id: string) => boolean;
  /**
   * Merges a batch of products into the favourites list without backend calls.
   * Only products with saved === true are added; products already present are skipped.
   * Called after search results arrive to pre-seed from the isFavourite field.
   */
  seedFavourites: (products: Product[]) => void;
}

const FavouritesContext = createContext<FavouritesContextType | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function FavouritesProvider({ children }: { children: React.ReactNode }) {
  const [favourites, setFavourites] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  // Track whether the user has an active session so we know whether backend
  // calls are worth attempting. Starts as true (optimistic) and flips on 401.
  const [authenticated, setAuthenticated] = useState(true);

  // ── Load favourites from backend on mount ──────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function loadFavourites() {
      try {
        const dtos = await getFavourites();
        if (!cancelled) {
          // Map the wire-format DTOs to the UI Product shape used by all cards.
          setFavourites(dtos.map(favouriteToProduct));
        }
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          // Not signed in — disable backend sync for this session.
          // The list stays empty; the user can still toggle locally.
          setAuthenticated(false);
        }
        // Any other error (network down, 5xx): silently start with an empty list.
        // We don't surface this to the user because the favourites feature is
        // non-critical and the rest of the app works fine without it.
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadFavourites();
    return () => { cancelled = true; };
  }, []);

  // ── Toggle a product's saved state ────────────────────────────────────────
  const toggleFavourite = useCallback((product: Product) => {
    const alreadySaved = favourites.some((p) => p.id === product.id);

    // 1. Optimistic local update — the UI responds immediately.
    if (alreadySaved) {
      setFavourites((prev) => prev.filter((p) => p.id !== product.id));
    } else {
      setFavourites((prev) => [...prev, { ...product, saved: true }]);
    }

    // 2. If not authenticated, skip the backend call (local-only mode).
    if (!authenticated) return;

    // 3. Sync with the backend in the background.
    const backendCall = alreadySaved
      ? removeFavourite(product.id)
      : addFavourite(product.id);

    backendCall.catch((err) => {
      // 4. Roll back the optimistic update if the call failed.
      if (alreadySaved) {
        // We tried to remove it but failed — put it back.
        setFavourites((prev) => [...prev, { ...product, saved: true }]);
      } else {
        // We tried to add it but failed — remove it again.
        setFavourites((prev) => prev.filter((p) => p.id !== product.id));
      }

      if (err instanceof ApiError && err.status === 401) {
        // Session expired mid-session — stop trying the backend.
        setAuthenticated(false);
      }
    });
  }, [favourites, authenticated]);

  // ── isFavourite helper ────────────────────────────────────────────────────
  const isFavourite = useCallback(
    (id: string) => favourites.some((p) => p.id === id),
    [favourites],
  );

  // ── Seed from search results ──────────────────────────────────────────────
  const seedFavourites = useCallback((products: Product[]) => {
    const toAdd = products.filter((p) => p.saved);
    if (toAdd.length === 0) return;
    setFavourites((prev) => {
      const existingIds = new Set(prev.map((p) => p.id));
      const newOnes = toAdd.filter((p) => !existingIds.has(p.id));
      return newOnes.length > 0 ? [...prev, ...newOnes] : prev;
    });
  }, []);

  return (
    <FavouritesContext.Provider value={{ favourites, loading, toggleFavourite, isFavourite, seedFavourites }}>
      {children}
    </FavouritesContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useFavourites(): FavouritesContextType {
  const ctx = useContext(FavouritesContext);
  if (!ctx) throw new Error('useFavourites must be used inside <FavouritesProvider>');
  return ctx;
}
