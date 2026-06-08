import { postJson, getJson, ApiError } from './apiClient';
import { config } from './config';
import type { AuthUser } from './types';

/**
 * AUTH SERVICE  —  talks to node-auth (SuperTokens), NOT the springboot-api.
 *
 * Every call here targets `config.authBaseUrl` (http://localhost:3001) and relies on
 * SuperTokens' cookie-based sessions — apiClient sends credentials: 'include', so the
 * session cookies set on sign-in are returned automatically on later requests.
 *
 * Backend routes (mounted by SuperTokens middleware at apiBasePath "/auth"):
 *   POST /auth/signup   POST /auth/signin   POST /auth/signout
 *   (backend_repo/backend/node-auth/src/index.js)
 *
 * STATUS: there is no login/signup UI in the app yet, so nothing calls these today.
 * They are a working skeleton — wire them to a future auth screen and to
 * app/(tabs)/profile.tsx. For production, prefer the official `supertokens-react-native`
 * SDK, which adds automatic access-token refresh on top of these raw calls.
 */

const AUTH_OPTS = { baseUrl: config.authBaseUrl } as const;

/** SuperTokens expects credentials wrapped as a formFields array. */
function formFields(email: string, password: string) {
  return {
    formFields: [
      { id: 'email', value: email },
      { id: 'password', value: password },
    ],
  };
}

export async function signUp(email: string, password: string): Promise<AuthUser> {
  const res = await postJson<any>('/auth/signup', formFields(email, password), AUTH_OPTS);
  return { id: res?.user?.id ?? '', email: res?.user?.emails?.[0] ?? email };
}

export async function signIn(email: string, password: string): Promise<AuthUser> {
  const res = await postJson<any>('/auth/signin', formFields(email, password), AUTH_OPTS);
  return { id: res?.user?.id ?? '', email: res?.user?.emails?.[0] ?? email };
}

export async function signOut(): Promise<void> {
  await postJson('/auth/signout', {}, AUTH_OPTS);
}

/**
 * Whether a valid session cookie exists. Pings the node-auth session-protected route;
 * a 401 means "not signed in" rather than a hard error.
 * (node-auth route: GET /api/private/ping behind verifySession)
 */
export async function isSignedIn(): Promise<boolean> {
  try {
    await getJson('/api/private/ping', AUTH_OPTS);
    return true;
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) return false;
    throw err;
  }
}
