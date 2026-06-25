import { config } from './config';
import { getAccessToken, getRefreshToken, refreshAccessToken } from './tokenStore';
import { emitSessionExpired } from './sessionEvents';

/**
 * Low-level HTTP layer shared by every service module (auth, search, products).
 *
 * Nothing in the app should call `fetch` directly — go through these helpers so that
 * timeouts, JSON parsing, error shape, and session-cookie handling stay consistent.
 * To add a new endpoint, write a function in the relevant service module that calls
 * `getJson` / `postJson` / `postMultipart` — you never touch this file.
 */

/** Thrown for any non-2xx response. `status` + `body` let callers branch on the failure. */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: unknown,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/** Thrown when the network request never completes (offline, timeout, server down). */
export class NetworkError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'NetworkError';
  }
}

interface RequestOptions {
  /** Which backend to hit. Defaults to the springboot-api (apiBaseUrl). */
  baseUrl?: string;
  /** Extra headers merged on top of the defaults. */
  headers?: Record<string, string>;
  /** Body — already-serialized (string) or FormData for multipart. */
  body?: BodyInit;
  /** Send SuperTokens session cookies with the request. Default: true. */
  withCredentials?: boolean;
  signal?: AbortSignal;
  /** Internal flag — prevents recursive retry after token refresh. */
  _retried?: boolean;
}

/**
 * The single choke point through which every request flows.
 * Adds a timeout, parses JSON, and normalizes errors into ApiError / NetworkError.
 */
async function request<T>(method: string, path: string, options: RequestOptions = {}): Promise<T> {
  const baseUrl = options.baseUrl ?? config.apiBaseUrl;
  const url = `${baseUrl}${path}`;

  // For all springboot-api requests, attach the stored JWT as a Bearer token so
  // Spring Security can authenticate the user on /api/secure/** endpoints and
  // optionally enrich public /api/public/** responses with isFavourite state.
  const headers: Record<string, string> = { ...options.headers };
  const isSpringApi = !options.baseUrl || options.baseUrl === config.apiBaseUrl;
  if (isSpringApi) {
    const token = await getAccessToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  // Per-request timeout via AbortController (React Native fetch supports this).
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.requestTimeoutMs);

  // Let the caller's own abort signal also cancel the request.
  if (options.signal) {
    options.signal.addEventListener('abort', () => controller.abort());
  }

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers,
      body: options.body,
      credentials: options.withCredentials === false ? 'omit' : 'include',
      signal: controller.signal,
    });
  } catch (err) {
    throw new NetworkError(`Request to ${url} failed (server unreachable or timed out).`, err);
  } finally {
    clearTimeout(timeout);
  }

  // Parse the body once; tolerate empty bodies (e.g. 204) and non-JSON error pages.
  const raw = await response.text();
  let parsed: unknown = null;
  if (raw) {
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = raw; // backend returned plain text — keep it for the error message
    }
  }

  if (!response.ok) {
    // On 401 from the springboot-api, attempt a token refresh and retry the
    // request once. Only do this when we actually had a refresh token (i.e.
    // the user was signed in) to avoid spurious session-expired modals for
    // unauthenticated users hitting public endpoints that happen to 401.
    if (response.status === 401 && isSpringApi && !options._retried) {
      const hasRefreshToken = !!(await getRefreshToken());
      if (hasRefreshToken) {
        const refreshed = await refreshAccessToken();
        if (refreshed) {
          return request<T>(method, path, { ...options, _retried: true });
        }
        // Refresh failed — session is fully expired; show the global modal.
        emitSessionExpired();
      }
    }

    // Spring/Node error handlers return { "error": "..." }; fall back to a generic message.
    let message = `HTTP ${response.status} on ${path}`;
    if (parsed && typeof parsed === 'object' && 'error' in parsed) {
      message = String((parsed as { error: unknown }).error);
    }
    throw new ApiError(response.status, parsed, message);
  }

  return parsed as T;
}

// ─── Public helpers — these are what service modules import ──────────────────────

export function getJson<T>(path: string, options?: RequestOptions): Promise<T> {
  return request<T>('GET', path, options);
}

export function postJson<T>(path: string, data: unknown, options: RequestOptions = {}): Promise<T> {
  return request<T>('POST', path, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
    body: JSON.stringify(data),
  });
}

/**
 * POST multipart/form-data — used for the search endpoint, which accepts a text part
 * and/or a file part. Do NOT set Content-Type manually: the runtime adds the multipart
 * boundary automatically when the body is a FormData instance.
 */
export function postMultipart<T>(path: string, form: FormData, options: RequestOptions = {}): Promise<T> {
  return request<T>('POST', path, { ...options, body: form });
}

/** DELETE without a body — used for removing a resource by ID (e.g. favourites). */
export function deleteJson<T>(path: string, options?: RequestOptions): Promise<T> {
  return request<T>('DELETE', path, options);
}
