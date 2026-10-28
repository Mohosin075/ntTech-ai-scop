import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError, fetchApi, isInvalidSessionError } from '../../../../../frontend/src/lib/api';

afterEach(() => vi.unstubAllGlobals());

describe('Frontend session error handling', () => {
  it.each([401, 404])('invalidates the session for HTTP %i', async status => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ message: 'Session invalid' }), { status })));
    const error = await fetchApi('/auth/me').catch(error => error);
    expect(error).toBeInstanceOf(ApiError);
    expect(isInvalidSessionError(error)).toBe(true);
  });

  it.each([429, 500, 502, 503])('preserves the session for HTTP %i, including non-JSON errors', async status => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('<html>Service unavailable</html>', { status })));
    const error = await fetchApi('/auth/me').catch(error => error);
    expect(error.status).toBe(status);
    expect(isInvalidSessionError(error)).toBe(false);
  });

  it('preserves the session when the network fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    const error = await fetchApi('/auth/me').catch(error => error);
    expect(isInvalidSessionError(error)).toBe(false);
  });
});
