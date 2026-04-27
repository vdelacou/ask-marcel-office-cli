import { describe, expect, it } from 'bun:test';
import { ok } from '../domain/result.ts';
import type { AuthManager } from './auth.ts';
import type { FetchFn } from './graph-client.ts';
import { createGraphClient } from './graph-client.ts';

const fakeAuth = (): AuthManager => ({ getAccessToken: async () => ok('test-token'), logout: async () => ok(undefined) });

const fakeFetch = (responses: Array<{ match: (url: string) => boolean; body: unknown; status?: number }>): FetchFn => {
  return async (url: string) => {
    const handler = responses.find((r) => r.match(url));
    if (!handler) throw new Error(`no fetch handler matched ${url}`);
    return Response.json(handler.body, { status: handler.status ?? 200 });
  };
};

describe('graph client', () => {
  it('makes authenticated GET requests to the Graph API', async () => {
    const fetchFn = fakeFetch([{ match: (url) => url === 'https://graph.microsoft.com/v1.0/me/drives', body: { value: [{ id: 'drive-1', name: 'OneDrive' }] } }]);

    const client = createGraphClient(fakeAuth(), fetchFn);
    const result = await client.get('/me/drives');
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toEqual({ value: [{ id: 'drive-1', name: 'OneDrive' }] });
  });

  it('returns an error when the API returns an error status', async () => {
    const fetchFn = fakeFetch([{ match: (url) => url.includes('/me/drives'), body: { error: { message: 'not found' } }, status: 404 }]);

    const client = createGraphClient(fakeAuth(), fetchFn);
    const result = await client.get('/me/drives');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.type).toBe('api_error');
  });

  it('returns an error when auth fails', async () => {
    const client = createGraphClient({
      getAccessToken: async () => ({ ok: false, error: { type: 'auth_failed' as const, message: 'no auth' } }),
      logout: async () => ok(undefined),
    });
    const result = await client.get('/me/drives');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.type).toBe('auth_failed');
  });

  it('returns network_error when fetch throws', async () => {
    const throwingFetch: FetchFn = async () => {
      throw new Error('fetch failed');
    };

    const client = createGraphClient(fakeAuth(), throwingFetch);
    const result = await client.get('/me/drives');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.type).toBe('network_error');
      expect(result.error.message).toBe('fetch failed');
    }
  });
});
