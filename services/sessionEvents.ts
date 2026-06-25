/**
 * Minimal event bus for session-expiry notifications.
 *
 * When the apiClient receives a 401 AND the refresh attempt also fails,
 * it calls emitSessionExpired(). The root layout registers a listener
 * via onSessionExpired() and shows a modal prompting the user to sign in.
 *
 * Only one listener is supported (the app root). The returned function
 * from onSessionExpired() removes the listener — pass it to useEffect's
 * cleanup so it unregisters on unmount.
 */

type Listener = () => void;
let _listener: Listener | null = null;

export function onSessionExpired(cb: Listener): () => void {
  _listener = cb;
  return () => { if (_listener === cb) _listener = null; };
}

export function emitSessionExpired(): void {
  _listener?.();
}
