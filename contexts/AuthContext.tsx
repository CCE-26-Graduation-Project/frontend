/**
 * AuthContext — global state for the signed-in user.
 *
 * HOW IT WORKS
 * ────────────
 * On mount, the context restores the user from secure storage via getSignedInUser()
 * (no network call — just reads the persisted JWT + user object). Any screen that
 * needs to know who's signed in (or display their name) reads `user` from here
 * instead of re-fetching it locally — a local fetch-on-mount only runs once and
 * goes stale the moment the user signs out/in again on a screen that stays mounted
 * in the background (e.g. a tab navigator keeps other tabs alive).
 *
 * UPDATING THE USER
 * ──────────────────
 * setUser() is called directly by profile.tsx after sign in/up (with the AuthUser
 * returned from the backend) and after sign out/delete (with null). Every screen
 * subscribed via useAuth() re-renders immediately with the new value.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getSignedInUser } from '../services/auth';
import type { AuthUser } from '../services/types';

interface AuthContextType {
  /** The signed-in user, or null if signed out. */
  user: AuthUser | null;
  /** True while the initial restore-from-storage check is in flight. */
  loading: boolean;
  /** Sets the signed-in user (or null to clear it). */
  setUser: (user: AuthUser | null) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getSignedInUser()
      .then((u) => { if (!cancelled) setUserState(u); })
      .catch(() => { if (!cancelled) setUserState(null); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const setUser = useCallback((u: AuthUser | null) => {
    setUserState(u);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
