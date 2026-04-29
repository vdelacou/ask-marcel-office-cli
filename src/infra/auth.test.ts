import { afterEach, describe, expect, it } from 'bun:test';
import { accessTokenUnsafe } from '../domain/access-token.ts';
import { ok } from '../domain/result.ts';
import { installFetchMock } from '../test-helpers/fetch-mock.ts';
import { createFileSystemFake } from '../test-helpers/filesystem-fake.ts';
import { createLoggerFake } from '../test-helpers/logger-fake.ts';
import { createAuthManagerFromApi } from './auth.ts';
import type { BrowserAuth, BrowserTokenResult } from './browser-auth.ts';

const CACHE_PATH = '/virtual/token-cache.json';

const fakeBrowserAuth = (config?: { acquireResult?: BrowserTokenResult | null; acquireError?: Error }): BrowserAuth => ({
  acquireToken: async () => {
    if (config?.acquireError) throw config.acquireError;
    return config?.acquireResult ?? null;
  },
  close: async () => {},
});

const futureToken = (): BrowserTokenResult => {
  const future = Math.floor(Date.now() / 1000) + 3600;
  const header = btoa(JSON.stringify({ alg: 'RS256' }));
  const payload = btoa(JSON.stringify({ exp: future, aud: 'https://graph.microsoft.com', tid: 'tenant-1' }));
  return { accessToken: accessTokenUnsafe(`${header}.${payload}.sig`), refreshToken: 'new-refresh' };
};

describe('auth manager recovery ladder', () => {
  it('returns cached token when fresh and valid', async () => {
    const future = Math.floor(Date.now() / 1000) + 3600;
    const header = btoa(JSON.stringify({ alg: 'RS256' }));
    const payload = btoa(JSON.stringify({ exp: future, aud: 'https://graph.microsoft.com' }));
    const fs = createFileSystemFake();
    fs.seed(CACHE_PATH, JSON.stringify({ access_token: `${header}.${payload}.sig`, expires_on: future, refresh_token: 'old-refresh' }));

    const logger = createLoggerFake();
    const auth = createAuthManagerFromApi(fakeBrowserAuth(), CACHE_PATH, logger, fs);

    const result = await auth.getAccessToken();
    expect(result).toEqual(ok(accessTokenUnsafe(`${header}.${payload}.sig`)));
    expect(logger.calls.some((l) => l.event === 'auth.ladder.rung' && (l.meta as Record<string, unknown>)?.rung === 'cache')).toBe(true);
  });

  it('refreshes expired token when refresh_token exists', async () => {
    const mock = installFetchMock([
      {
        match: (url, init) => {
          let bodyStr = '';
          if (typeof init?.body === 'string') bodyStr = init.body;
          else if (init?.body instanceof URLSearchParams) bodyStr = init.body.toString();
          return url.includes('/token') && bodyStr.includes('refresh_token=old-refresh');
        },
        respond: () => {
          const future = Math.floor(Date.now() / 1000) + 3600;
          const header = btoa(JSON.stringify({ alg: 'RS256' }));
          const payload = btoa(JSON.stringify({ exp: future, aud: 'https://graph.microsoft.com' }));
          return new Response(JSON.stringify({ access_token: `${header}.${payload}.sig`, expires_in: 3600, refresh_token: 'new-refresh' }));
        },
      },
    ]);
    afterEach(() => mock.restore());

    const past = Math.floor(Date.now() / 1000) - 100;
    const fs = createFileSystemFake();
    fs.seed(CACHE_PATH, JSON.stringify({ access_token: 'expired-token', expires_on: past, refresh_token: 'old-refresh' }));

    const logger = createLoggerFake();
    const auth = createAuthManagerFromApi(fakeBrowserAuth(), CACHE_PATH, logger, fs);

    const result = await auth.getAccessToken();
    expect(result.ok).toBe(true);
  });

  it('falls to browser when refresh fails', async () => {
    const mock = installFetchMock([
      {
        match: () => true,
        respond: () => new Response(JSON.stringify({ error: 'invalid_grant' }), { status: 400 }),
      },
    ]);
    afterEach(() => mock.restore());

    const past = Math.floor(Date.now() / 1000) - 100;
    const fs = createFileSystemFake();
    fs.seed(CACHE_PATH, JSON.stringify({ access_token: 'expired-token', expires_on: past, refresh_token: 'old-refresh' }));

    const browserToken = futureToken();
    const logger = createLoggerFake();
    const auth = createAuthManagerFromApi(fakeBrowserAuth({ acquireResult: browserToken }), CACHE_PATH, logger, fs);

    const result = await auth.getAccessToken();
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toBe(browserToken.accessToken);
  });

  it('acquires token via browser when no cache exists', async () => {
    const fs = createFileSystemFake();
    const browserToken = futureToken();
    const logger = createLoggerFake();
    const auth = createAuthManagerFromApi(fakeBrowserAuth({ acquireResult: browserToken }), CACHE_PATH, logger, fs);

    const result = await auth.getAccessToken();
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toBe(browserToken.accessToken);
  });

  it('returns auth_cancelled when browser returns null', async () => {
    const fs = createFileSystemFake();
    const logger = createLoggerFake();
    const auth = createAuthManagerFromApi(fakeBrowserAuth({ acquireResult: null }), CACHE_PATH, logger, fs);

    const result = await auth.getAccessToken();
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.type).toBe('auth_cancelled');
  });

  it('returns auth_failed when browser throws', async () => {
    const fs = createFileSystemFake();
    const logger = createLoggerFake();
    const auth = createAuthManagerFromApi(fakeBrowserAuth({ acquireError: new Error('browser launch failed') }), CACHE_PATH, logger, fs);

    const result = await auth.getAccessToken();
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.type).toBe('auth_failed');
  });

  it('skips browser when cached token has wrong audience', async () => {
    const future = Math.floor(Date.now() / 1000) + 3600;
    const header = btoa(JSON.stringify({ alg: 'RS256' }));
    const payload = btoa(JSON.stringify({ exp: future, aud: 'management.core.windows.net' }));
    const fs = createFileSystemFake();
    fs.seed(CACHE_PATH, JSON.stringify({ access_token: `${header}.${payload}.sig`, expires_on: future, refresh_token: '' }));

    const browserToken = futureToken();
    const logger = createLoggerFake();
    const auth = createAuthManagerFromApi(fakeBrowserAuth({ acquireResult: browserToken }), CACHE_PATH, logger, fs);

    const result = await auth.getAccessToken();
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toBe(browserToken.accessToken);
  });

  it('clears cache file on logout', async () => {
    const future = Math.floor(Date.now() / 1000) + 3600;
    const fs = createFileSystemFake();
    fs.seed(CACHE_PATH, JSON.stringify({ access_token: 'token', expires_on: future, refresh_token: 'refresh' }));

    const logger = createLoggerFake();
    const auth = createAuthManagerFromApi(fakeBrowserAuth(), CACHE_PATH, logger, fs);

    const result = await auth.logout();
    expect(result.ok).toBe(true);
    expect(fs.has(CACHE_PATH)).toBe(false);
  });

  it('still clears cache on logout when browser close fails', async () => {
    const future = Math.floor(Date.now() / 1000) + 3600;
    const fs = createFileSystemFake();
    fs.seed(CACHE_PATH, JSON.stringify({ access_token: 'token', expires_on: future, refresh_token: 'refresh' }));

    const failingBrowser: BrowserAuth = {
      acquireToken: async () => null,
      close: async () => {
        throw new Error('close failed');
      },
    };

    const logger = createLoggerFake();
    const auth = createAuthManagerFromApi(failingBrowser, CACHE_PATH, logger, fs);

    const result = await auth.logout();
    expect(result.ok).toBe(false);
    if (!result.ok && result.error.type === 'auth_failed') {
      expect(result.error.message).toBe('close failed');
    }
    expect(fs.has(CACHE_PATH)).toBe(false);
  });
});
