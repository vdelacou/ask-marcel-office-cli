import { describe, expect, it } from 'bun:test';
import { createFileSystemFake } from '../test-helpers/filesystem-fake.ts';
import { buildDeps } from './build-deps.ts';

describe('buildDeps composition root', () => {
  it('wires logger, auth manager, and graph client when given an explicit cache path', () => {
    const fs = createFileSystemFake();
    const deps = buildDeps({ cachePath: '/virtual/cache.json', logLevel: 'error', fs });
    expect(typeof deps.logger.info).toBe('function');
    expect(typeof deps.auth.getAccessToken).toBe('function');
    expect(typeof deps.auth.logout).toBe('function');
    expect(typeof deps.graph.get).toBe('function');
  });

  it('falls back to a home-derived cache path when none is provided', () => {
    const fs = createFileSystemFake();
    const deps = buildDeps({ home: '/virtual/home', logLevel: 'error', fs });
    expect(typeof deps.auth.getAccessToken).toBe('function');
  });

  it('uses default config values when no config is provided', () => {
    const previousLevel = process.env.LOG_LEVEL;
    process.env.LOG_LEVEL = 'error';
    try {
      const deps = buildDeps();
      expect(typeof deps.logger.info).toBe('function');
    } finally {
      if (previousLevel === undefined) delete process.env.LOG_LEVEL;
      else process.env.LOG_LEVEL = previousLevel;
    }
  });

  it('returns a cached token via the default Bun filesystem adapter when run under Bun', async () => {
    const tmpCache = `/tmp/atelier-build-deps-cache-${Date.now()}.json`;
    const future = Math.floor(Date.now() / 1000) + 3600;
    const header = btoa(JSON.stringify({ alg: 'RS256' }));
    const payload = btoa(JSON.stringify({ exp: future, aud: 'https://graph.microsoft.com' }));
    const seededToken = `${header}.${payload}.sig`;
    await Bun.write(tmpCache, JSON.stringify({ access_token: seededToken, expires_on: future, refresh_token: '' }));
    try {
      const deps = buildDeps({ cachePath: tmpCache, logLevel: 'error' });
      const result = await deps.auth.getAccessToken();
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.value).toBe(seededToken as never);
    } finally {
      await Bun.file(tmpCache).delete();
    }
  });
});
