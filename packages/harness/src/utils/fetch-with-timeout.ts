// Default abort deadline for outbound tool fetches, in milliseconds.
export const DEFAULT_FETCH_TIMEOUT_MS = 8000;

/**
 * `fetch` wrapper that aborts the request after `timeoutMs` elapses.
 *
 * Uses an {@link AbortController} so a stalled upstream rejects the returned
 * promise instead of hanging forever; callers' existing try/catch then handle
 * it as a normal failure. The abort timer is always cleared.
 *
 * @param input - The request URL.
 * @param init - Optional fetch init (headers, method, body, ...). Any caller
 *   `signal` is overridden by the internal abort signal.
 * @param timeoutMs - Abort deadline in milliseconds.
 * @returns The fetch {@link Response}; rejects on network error or timeout.
 */
export const fetchWithTimeout = async (
  input: string | URL,
  init?: RequestInit,
  timeoutMs = DEFAULT_FETCH_TIMEOUT_MS,
): Promise<Response> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
};
