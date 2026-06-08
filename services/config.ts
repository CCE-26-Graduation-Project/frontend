import { Platform } from 'react-native';

/**
 * Central runtime configuration for every backend connection.
 *
 * The app talks to TWO separate backend services (see backend_repo/backend):
 *   1. node-auth      → http://localhost:3001  (SuperTokens email/password + sessions, mounted under /auth)
 *   2. springboot-api → http://localhost:8080  (product search + secure endpoints, mounted under /api)
 *
 * Override any value at build/run time with an Expo public env var (EXPO_PUBLIC_*),
 * e.g. in a `.env` file or the shell:
 *     EXPO_PUBLIC_API_BASE_URL=https://api.myhost.com
 *
 * IMPORTANT — how "localhost" resolves per platform:
 *   • iOS simulator / web  → localhost reaches your dev machine.
 *   • Android emulator     → localhost is the emulator itself; the host machine is 10.0.2.2.
 *   • Physical device      → neither works; set EXPO_PUBLIC_*_BASE_URL to your machine's LAN IP.
 */

// Default host used in development, chosen per platform (see note above).
const DEV_HOST = Platform.select({ android: '10.0.2.2', default: 'localhost' }) ?? 'localhost';

export const config = {
  /** node-auth service base URL — used by services/auth.ts (/auth/* SuperTokens routes). */
  authBaseUrl: process.env.EXPO_PUBLIC_AUTH_BASE_URL ?? `http://${DEV_HOST}:3001`,

  /** springboot-api base URL — used by services/search.ts and services/products.ts (/api/*). */
  apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL ?? `http://${DEV_HOST}:8080`,

  /** Abort any request that takes longer than this (ms). */
  requestTimeoutMs: Number(process.env.EXPO_PUBLIC_API_TIMEOUT_MS ?? 30000),
} as const;
