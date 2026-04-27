import { describe, expect, it } from 'bun:test';
import { createLoggerFake } from '../test-helpers/logger-fake.ts';
import type { BrowserAuthApi, BrowserTokenResult } from './browser-auth.ts';
import { createBrowserAuthFromApi } from './browser-auth.ts';

const fakeApi = (config?: { acquireResult?: BrowserTokenResult | null; acquireError?: Error }): BrowserAuthApi => ({
  acquireToken: async () => {
    if (config?.acquireError) throw config.acquireError;
    return config?.acquireResult ?? null;
  },
  close: async () => {},
});

describe('createBrowserAuthFromApi', () => {
  it('delegates acquireToken to the injected API', async () => {
    const api = fakeApi({ acquireResult: { accessToken: 'test-token', refreshToken: 'refresh' } });
    const logger = createLoggerFake();
    const auth = createBrowserAuthFromApi(api, logger);

    const result = await auth.acquireToken(['https://graph.microsoft.com/.default'], 'https://teams.microsoft.com');
    expect(result).toEqual({ accessToken: 'test-token', refreshToken: 'refresh' });
  });

  it('returns null when the injected API returns null', async () => {
    const api = fakeApi({ acquireResult: null });
    const logger = createLoggerFake();
    const auth = createBrowserAuthFromApi(api, logger);

    const result = await auth.acquireToken(['https://graph.microsoft.com/.default'], 'https://teams.microsoft.com');
    expect(result).toBeNull();
  });

  it('delegates close to the injected API', async () => {
    const api = fakeApi();
    const logger = createLoggerFake();
    const auth = createBrowserAuthFromApi(api, logger);

    await auth.close();
    const logs = logger.calls.filter((l) => l.event === 'browser_auth_close');
    expect(logs.length).toBe(1);
  });

  it('returns null when the injected API throws', async () => {
    const api: BrowserAuthApi = {
      acquireToken: async () => {
        throw new Error('browser crashed');
      },
      close: async () => {},
    };
    const logger = createLoggerFake();
    const auth = createBrowserAuthFromApi(api, logger);

    const result = await auth.acquireToken(['https://graph.microsoft.com/.default'], 'https://teams.microsoft.com');
    expect(result).toBeNull();
  });
});
