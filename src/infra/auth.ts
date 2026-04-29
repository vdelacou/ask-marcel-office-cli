import type { AccessToken } from '../domain/access-token.ts';
import { accessToken } from '../domain/access-token.ts';
import { decodeJwtPayload } from '../domain/jwt-utils.ts';
import type { Result } from '../domain/result.ts';
import { err, ok } from '../domain/result.ts';
import type { FileSystem } from '../use-cases/ports/filesystem.ts';
import type { Logger } from '../use-cases/ports/logger.ts';
import type { BrowserAuth } from './browser-auth.ts';
import { createBrowserAuth } from './browser-auth.ts';
import { createBunFileSystem } from './filesystem-bun.ts';
import { createNodeFileSystem } from './filesystem-node.ts';

type CachedToken = { access_token: string; expires_on: number; refresh_token: string };
type AuthError = { type: 'auth_failed'; message: string } | { type: 'auth_cancelled' };
type AuthManager = { getAccessToken: () => Promise<Result<AccessToken, AuthError>>; logout: () => Promise<Result<void, AuthError>> };

const CLIENT_ID = '5e3ce6c0-2b1f-4285-8d4b-75ee78787346';
const SCOPES = 'https://graph.microsoft.com/.default openid profile offline_access';
const SPA_ORIGIN = 'https://teams.microsoft.com';
const TEAMS_URL = 'https://teams.microsoft.com/';

const createAuthManagerFromApi = (browserAuth: BrowserAuth, cachePath: string, logger: Logger, fs: FileSystem): AuthManager => {
  const persist = async (access: AccessToken, refresh: string | null): Promise<void> => {
    const claims = decodeJwtPayload(access);
    const exp = claims.exp as number | undefined;
    await fs.writeText(cachePath, JSON.stringify({ access_token: access, expires_on: exp ?? 0, refresh_token: refresh ?? '' }));
  };

  const refreshToken = async (cached: CachedToken): Promise<Result<AccessToken, AuthError>> => {
    const body = new URLSearchParams({ client_id: CLIENT_ID, grant_type: 'refresh_token', refresh_token: cached.refresh_token, scope: SCOPES });
    let res: Response;
    try {
      res = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded', Origin: SPA_ORIGIN },
        body,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return err({ type: 'auth_failed', message: msg });
    }
    if (!res.ok) return err({ type: 'auth_failed', message: `refresh failed (${res.status})` });
    const json = (await res.json()) as { access_token: string; expires_in: number; refresh_token?: string };
    const validated = accessToken(json.access_token ?? '');
    if (!validated.ok) return err({ type: 'auth_failed', message: 'invalid token from refresh' });
    const token: CachedToken = {
      access_token: validated.value,
      expires_on: Math.floor(Date.now() / 1000) + json.expires_in,
      refresh_token: json.refresh_token ?? cached.refresh_token,
    };
    await fs.writeText(cachePath, JSON.stringify(token));
    logger.info('auth.ladder.rung', { rung: 'refresh' });
    return ok(validated.value);
  };

  const acquireViaBrowser = async (): Promise<Result<AccessToken, AuthError>> => {
    try {
      const result = await browserAuth.acquireToken(SCOPES.split(' '), TEAMS_URL);
      if (!result) return err({ type: 'auth_cancelled' });
      await persist(result.accessToken, result.refreshToken);
      logger.info('auth.ladder.rung', { rung: 'browser' });
      return ok(result.accessToken);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return err({ type: 'auth_failed', message: msg });
    }
  };

  const getAccessToken = async (): Promise<Result<AccessToken, AuthError>> => {
    const cachedRead = await fs.readJson<CachedToken>(cachePath);
    const cached = cachedRead.ok ? cachedRead.value : null;
    if (cached) {
      const validated = accessToken(cached.access_token);
      if (validated.ok) {
        logger.info('auth.ladder.rung', { rung: 'cache' });
        return ok(validated.value);
      }
    }
    if (cached?.refresh_token) {
      const refreshed = await refreshToken(cached);
      if (refreshed.ok) return refreshed;
    }
    return acquireViaBrowser();
  };

  const logout = async (): Promise<Result<void, AuthError>> => {
    try {
      await fs.deleteIfExists(cachePath);
      await browserAuth.close();
      return ok(undefined);
    } catch (e) {
      await fs.deleteIfExists(cachePath);
      return err({ type: 'auth_failed', message: e instanceof Error ? e.message : String(e) });
    }
  };

  return { getAccessToken, logout };
};

const defaultFileSystem = (): FileSystem => (typeof globalThis.Bun !== 'undefined' ? createBunFileSystem() : createNodeFileSystem());

const createAuthManager = (deps: { cachePath: string; logger: Logger; fs?: FileSystem }): AuthManager =>
  createAuthManagerFromApi(createBrowserAuth({ logger: deps.logger, fs: deps.fs ?? defaultFileSystem() }), deps.cachePath, deps.logger, deps.fs ?? defaultFileSystem());

export { createAuthManager, createAuthManagerFromApi };
export type { AuthError, AuthManager };
