import { config } from './config';
import type { AuthUser } from './types';
import { NetworkError } from './apiClient';
import { saveTokens, clearTokens, isTokenValid, saveUser, getSavedUser } from './tokenStore';

/**
 * AUTH SERVICE — talks directly to node-auth (SuperTokens) on Azure.
 *
 * Uses raw fetch (not apiClient) so response headers are accessible — SuperTokens
 * delivers session tokens via `st-access-token` / `st-refresh-token` response headers
 * (tokenTransferMethod: "header"). The JWT in st-access-token is stored in device
 * secure storage and attached to all springboot-api requests by apiClient.ts.
 *
 * Backend: backend_repo/backend/node-auth/src/index.js
 * Deployed: https://nodeauth-gradproject.azurewebsites.net
 *
 * SuperTokens returns HTTP 200 for BOTH success and auth errors — the actual
 * outcome is in the body `status` field, not the HTTP status code.
 */

/** Thrown for authentication-specific failures with a human-readable message. */
export class AuthError extends Error {
  constructor(
    public readonly code:
      | 'WRONG_CREDENTIALS'
      | 'EMAIL_EXISTS'
      | 'SIGN_IN_NOT_ALLOWED'
      | 'FIELD_ERROR'
      | 'UNKNOWN',
    message: string,
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

function buildBody(email: string, password: string): string {
  return JSON.stringify({
    formFields: [
      { id: 'email', value: email },
      { id: 'password', value: password },
    ],
  });
}

/** POST to the node-auth service, returning both parsed body and response headers. */
async function authPost(path: string, rid: string, body: string): Promise<{ data: unknown; headers: Headers }> {
  const url = `${config.authBaseUrl}${path}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.requestTimeoutMs);
  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', rid },
      body,
      signal: controller.signal,
    });
  } catch (err) {
    throw new NetworkError(`Auth service unreachable. Check your internet connection.`, err);
  } finally {
    clearTimeout(timeout);
  }
  const raw = await response.text();
  let data: unknown = null;
  try { data = raw ? JSON.parse(raw) : null; } catch { data = raw; }
  return { data, headers: response.headers };
}

export async function signIn(email: string, password: string): Promise<AuthUser> {
  const { data, headers } = await authPost('/auth/signin', 'emailpassword', buildBody(email, password));
  const d = data as Record<string, unknown>;

  if (d?.status === 'WRONG_CREDENTIALS_ERROR') {
    throw new AuthError('WRONG_CREDENTIALS', 'Incorrect email or password.');
  }
  if (d?.status === 'SIGN_IN_NOT_ALLOWED') {
    throw new AuthError('SIGN_IN_NOT_ALLOWED', 'This account is not allowed to sign in. Please contact support.');
  }
  if (d?.status !== 'OK') {
    throw new AuthError('UNKNOWN', 'Sign in failed. Please try again.');
  }

  const accessToken  = headers.get('st-access-token');
  const refreshToken = headers.get('st-refresh-token') ?? '';
  if (accessToken) await saveTokens(accessToken, refreshToken);

  const user = { id: (d.user as any)?.id ?? '', email: (d.user as any)?.emails?.[0] ?? email };
  await saveUser(user);
  return user;
}

export async function signUp(email: string, password: string): Promise<AuthUser> {
  const { data, headers } = await authPost('/auth/signup', 'emailpassword', buildBody(email, password));
  const d = data as Record<string, unknown>;

  if (d?.status === 'EMAIL_ALREADY_EXISTS_ERROR') {
    throw new AuthError('EMAIL_EXISTS', 'An account with this email already exists. Please sign in instead.');
  }
  if (d?.status === 'FIELD_ERROR') {
    const fields = d.formFields as Array<{ id: string; error: string }> | undefined;
    const firstError = fields?.find(f => f.error)?.error ?? 'Please check your email and password.';
    throw new AuthError('FIELD_ERROR', firstError);
  }
  if (d?.status !== 'OK') {
    throw new AuthError('UNKNOWN', 'Could not create account. Please try again.');
  }

  const accessToken  = headers.get('st-access-token');
  const refreshToken = headers.get('st-refresh-token') ?? '';
  if (accessToken) await saveTokens(accessToken, refreshToken);

  const user = { id: (d.user as any)?.id ?? '', email: (d.user as any)?.emails?.[0] ?? email };
  await saveUser(user);
  return user;
}

export async function signOut(): Promise<void> {
  try {
    const { getAccessToken } = await import('./tokenStore');
    const token = await getAccessToken();
    if (token) {
      await fetch(`${config.authBaseUrl}/auth/signout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'rid': 'session', 'Authorization': `Bearer ${token}` },
        body: '{}',
      });
    }
  } catch {
    // best-effort — always clear local state regardless
  } finally {
    await clearTokens();
  }
}

/**
 * Returns true if the locally stored JWT is present and not expired.
 * No network round-trip — fast enough to call on every app open.
 */
export async function isSignedIn(): Promise<boolean> {
  return isTokenValid();
}

/** Returns the persisted user object (email + id) if the session is still valid. */
export async function getSignedInUser(): Promise<AuthUser | null> {
  const valid = await isTokenValid();
  if (!valid) return null;
  return getSavedUser();
}
