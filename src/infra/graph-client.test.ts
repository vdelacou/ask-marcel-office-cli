import { describe, expect, it } from 'bun:test';
import { accessTokenUnsafe } from '../domain/access-token.ts';
import { ok } from '../domain/result.ts';
import type { AuthManager } from './auth.ts';
import type { FetchFn } from './graph-client.ts';
import { createGraphClient } from './graph-client.ts';

const fakeAuth = (): AuthManager => ({ getAccessToken: async () => ok(accessTokenUnsafe('test-token')), logout: async () => ok(undefined) });

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

  it('falls back to the response status text when the error body is not parseable JSON', async () => {
    const fetchFn: FetchFn = async () => new Response('not-json-at-all', { status: 503, statusText: 'Service Unavailable' });
    const client = createGraphClient(fakeAuth(), fetchFn);
    const result = await client.get('/me');
    expect(result.ok).toBe(false);
    if (!result.ok && result.error.type === 'api_error') {
      expect(result.error.status).toBe(503);
      expect(result.error.message).toBe('Service Unavailable');
    }
  });

  it('reports an Auth cancelled message when the auth manager returns auth_cancelled', async () => {
    const cancelledAuth = {
      getAccessToken: async () => ({ ok: false as const, error: { type: 'auth_cancelled' as const } }),
      logout: async () => ok(undefined),
    };
    const client = createGraphClient(cancelledAuth);
    const result = await client.get('/me');
    expect(result.ok).toBe(false);
    if (!result.ok && result.error.type === 'auth_failed') {
      expect(result.error.message).toBe('Auth cancelled');
    }
  });

  it('reports a generic network_error message when fetch throws a non-Error value', async () => {
    const throwingFetch: FetchFn = async () => {
      throw 'string thrown';
    };
    const client = createGraphClient(fakeAuth(), throwingFetch);
    const result = await client.get('/me');
    expect(result.ok).toBe(false);
    if (!result.ok && result.error.type === 'network_error') {
      expect(result.error.message).toBe('string thrown');
    }
  });

  it('reports a generic network_error message when fetch throws a non-string non-Error value', async () => {
    const throwingFetch: FetchFn = async () => {
      throw { weird: 'thing' };
    };
    const client = createGraphClient(fakeAuth(), throwingFetch);
    const result = await client.get('/me');
    expect(result.ok).toBe(false);
    if (!result.ok && result.error.type === 'network_error') {
      expect(result.error.message).toBe('network request failed');
    }
  });

  it('getBinary returns the Location header as @microsoft.graph.downloadUrl on a 302 redirect', async () => {
    const fetchFn: FetchFn = async () => new Response(null, { status: 302, headers: { location: 'https://cdn.example/signed?token=abc' } });
    const client = createGraphClient(fakeAuth(), fetchFn);
    const result = await client.getBinary('/me/drive/items/i1/content');
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toEqual({ '@microsoft.graph.downloadUrl': 'https://cdn.example/signed?token=abc' });
  });

  it('getBinary returns a 3xx without a Location header as an api_error', async () => {
    const fetchFn: FetchFn = async () => new Response('weird', { status: 304 });
    const client = createGraphClient(fakeAuth(), fetchFn);
    const result = await client.getBinary('/me/photo/$value');
    expect(result.ok).toBe(false);
    if (!result.ok && result.error.type === 'api_error') {
      expect(result.error.status).toBe(304);
    }
  });

  it('getBinary returns text/* responses as a { text } envelope rather than base64', async () => {
    const html = '<html lang="en"><body>OneNote page</body></html>';
    const fetchFn: FetchFn = async () => new Response(html, { status: 200, headers: { 'content-type': 'text/html' } });
    const client = createGraphClient(fakeAuth(), fetchFn);
    const result = await client.getBinary('/me/onenote/pages/p1/content');
    expect(result.ok).toBe(true);
    if (result.ok) {
      const v = result.value as { contentType: string; size: number; text: string };
      expect(v.contentType).toBe('text/html');
      expect(v.text).toBe(html);
      expect(v.size).toBe(html.length);
    }
  });

  it('getBinary base64-encodes binary bodies and reports content-type and size', async () => {
    const bytes = new Uint8Array([0xff, 0xd8, 0xff, 0xe0]);
    const fetchFn: FetchFn = async () => new Response(bytes, { status: 200, headers: { 'content-type': 'image/jpeg' } });
    const client = createGraphClient(fakeAuth(), fetchFn);
    const result = await client.getBinary('/me/photo/$value');
    expect(result.ok).toBe(true);
    if (result.ok) {
      const v = result.value as { contentType: string; size: number; base64: string };
      expect(v.contentType).toBe('image/jpeg');
      expect(v.size).toBe(4);
      expect(v.base64).toBe(btoa(String.fromCharCode(0xff, 0xd8, 0xff, 0xe0)));
    }
  });

  it('getBinary returns parsed JSON when the response advertises application/json', async () => {
    const fetchFn: FetchFn = async () => Response.json({ '@odata.context': 'foo', value: 'bar' });
    const client = createGraphClient(fakeAuth(), fetchFn);
    const result = await client.getBinary('/some/json/binary/endpoint');
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toEqual({ '@odata.context': 'foo', value: 'bar' });
  });

  it('getBinary returns api_error on a non-redirect non-OK response', async () => {
    const fetchFn: FetchFn = async () =>
      new Response(JSON.stringify({ error: { message: 'no permission' } }), {
        status: 403,
        headers: { 'content-type': 'application/json' },
      });
    const client = createGraphClient(fakeAuth(), fetchFn);
    const result = await client.getBinary('/me/photo/$value');
    expect(result.ok).toBe(false);
    if (!result.ok && result.error.type === 'api_error') {
      expect(result.error.status).toBe(403);
      expect(result.error.message).toBe('no permission');
    }
  });

  it('getBinary surfaces auth_failed when the auth manager fails', async () => {
    const failingAuth: AuthManager = {
      getAccessToken: async () => ({ ok: false, error: { type: 'auth_failed', message: 'token gone' } }),
      logout: async () => ok(undefined),
    };
    const client = createGraphClient(failingAuth);
    const result = await client.getBinary('/me/photo/$value');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.type).toBe('auth_failed');
  });

  it('getBinary surfaces network_error when fetch throws', async () => {
    const throwing: FetchFn = async () => {
      throw new Error('socket');
    };
    const client = createGraphClient(fakeAuth(), throwing);
    const result = await client.getBinary('/me/photo/$value');
    expect(result.ok).toBe(false);
    if (!result.ok && result.error.type === 'network_error') {
      expect(result.error.message).toBe('socket');
    }
  });

  it('makes authenticated POST requests with a JSON-serialised body', async () => {
    let captured: { url: string; method?: string; body?: string } | null = null;
    const fetchFn: FetchFn = async (url, init) => {
      captured = { url, method: init?.method, body: typeof init?.body === 'string' ? init.body : undefined };
      return Response.json({ value: [{ hits: [{ rank: 1 }] }] });
    };
    const client = createGraphClient(fakeAuth(), fetchFn);
    const result = await client.post('/search/query', { requests: [{ entityTypes: ['chatMessage'] }] });
    expect(result.ok).toBe(true);
    expect(captured).not.toBeNull();
    if (captured !== null) {
      const c = captured as { url: string; method?: string; body?: string };
      expect(c.url).toBe('https://graph.microsoft.com/v1.0/search/query');
      expect(c.method).toBe('POST');
      expect(c.body).toBe(JSON.stringify({ requests: [{ entityTypes: ['chatMessage'] }] }));
    }
  });
});
