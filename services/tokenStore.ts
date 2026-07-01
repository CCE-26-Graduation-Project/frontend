import * as SecureStore from 'expo-secure-store';
import { config } from './config';

const ACCESS_KEY  = 'snoop_access_token';
const REFRESH_KEY = 'snoop_refresh_token';
const USER_KEY    = 'snoop_user';

export async function saveTokens(accessToken: string, refreshToken: string): Promise<void> {
  await SecureStore.setItemAsync(ACCESS_KEY, accessToken);
  if (refreshToken) await SecureStore.setItemAsync(REFRESH_KEY, refreshToken);
}

export async function getAccessToken(): Promise<string | null> {
  try { return await SecureStore.getItemAsync(ACCESS_KEY); } catch { return null; }
}

export async function getRefreshToken(): Promise<string | null> {
  try { return await SecureStore.getItemAsync(REFRESH_KEY); } catch { return null; }
}

export async function saveUser(user: { id: string; email: string; name?: string }): Promise<void> {
  await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
}

export async function getSavedUser(): Promise<{ id: string; email: string; name?: string } | null> {
  try {
    const raw = await SecureStore.getItemAsync(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export async function clearTokens(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync(ACCESS_KEY).catch(() => {}),
    SecureStore.deleteItemAsync(REFRESH_KEY).catch(() => {}),
    SecureStore.deleteItemAsync(USER_KEY).catch(() => {}),
  ]);
}

/**
 * Attempts to refresh the access token using the stored refresh token.
 * Calls POST /auth/session/refresh on node-auth (SuperTokens).
 * Returns true and saves the new tokens on success; clears all tokens and
 * returns false if the refresh token is missing, expired, or the request fails.
 */
export async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) return false;
  try {
    const response = await fetch(`${config.authBaseUrl}/auth/session/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'rid': 'session', 'st-refresh-token': refreshToken },
      body: '{}',
    });
    if (!response.ok) {
      await clearTokens();
      return false;
    }
    const newAccess   = response.headers.get('st-access-token');
    const newRefresh  = response.headers.get('st-refresh-token');
    if (newAccess) {
      await saveTokens(newAccess, newRefresh ?? refreshToken);
      return true;
    }
    await clearTokens();
    return false;
  } catch {
    return false;
  }
}

/**
 * Decodes the stored JWT and checks it hasn't expired (with a 30-second buffer).
 * Returns false if no token exists, it can't be parsed, or it's within 30s of expiry.
 */
export async function isTokenValid(): Promise<boolean> {
  const token = await getAccessToken();
  if (!token) return false;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    // base64url → padded base64 → JSON
    const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = b64.padEnd(b64.length + (4 - (b64.length % 4)) % 4, '=');
    const json = decodeURIComponent(
      Array.from(atob(padded))
        .map(c => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join(''),
    );
    const payload = JSON.parse(json) as { exp?: number };
    if (typeof payload.exp !== 'number') return true; // no expiry claim → assume valid
    return payload.exp * 1000 > Date.now() + 30_000;
  } catch {
    return false;
  }
}
