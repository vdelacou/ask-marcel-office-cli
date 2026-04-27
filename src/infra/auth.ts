import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import type { Result } from '../domain/result.ts';
import { err, ok } from '../domain/result.ts';
import type { Logger } from '../use-cases/ports/logger.ts';
import type { BrowserAuth } from './browser-auth.ts';
import { createBrowserAuth } from './browser-auth.ts';
import { decodeJwtPayload, isGraphToken, isTokenFresh } from './jwt-utils.ts';

type CachedToken = { access_token: string; expires_on: number; refresh_token: string };
type AuthError = { type: 'auth_failed'; message: string } | { type: 'auth_cancelled' };
type AuthManager = { getAccessToken: () => Promise<Result<string, AuthError>>; logout: () => Promise<Result<void, AuthError>> };

const CLIENT_ID = '5e3ce6c0-2b1f-4285-8d4b-75ee78787346';
const SCOPES = 'https://graph.microsoft.com/.default openid profile offline_access';
const SPA_ORIGIN = 'https://teams.microsoft.com';
const TEAMS_URL = 'https://teams.microsoft.com/';

const readCache = (path: string): CachedToken | null => {
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, 'utf-8')) as CachedToken;
  } catch {
    return null;
  }
};

const writeCache = (path: string, data: CachedToken): void => {
  const dir = dirname(path);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(path, JSON.stringify(data));
};

const createAuthManagerFromApi = (browserAuth: BrowserAuth, cachePath: string, logger: Logger): AuthManager => {
  const persist = (access: string, refresh: string | null): void => {
    const claims = decodeJwtPayload(access);
    const exp = claims.exp as number | undefined;
    writeCache(cachePath, { access_token: access, expires_on: exp ?? 0, refresh_token: refresh ?? '' });
  };

  const refreshToken = async (cached: CachedToken): Promise<Result<string, AuthError>> => {
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
    if (!json.access_token || !isTokenFresh(json.access_token) || !isGraphToken(json.access_token)) {
      return err({ type: 'auth_failed', message: 'invalid token from refresh' });
    }
    const token: CachedToken = {
      access_token: json.access_token,
      expires_on: Math.floor(Date.now() / 1000) + json.expires_in,
      refresh_token: json.refresh_token ?? cached.refresh_token,
    };
    writeCache(cachePath, token);
    logger.info('auth.ladder.rung', { rung: 'refresh' });
    return ok(token.access_token);
  };

  const acquireViaBrowser = async (): Promise<Result<string, AuthError>> => {
    try {
      const result = await browserAuth.acquireToken(SCOPES.split(' '), TEAMS_URL);
      if (!result) return err({ type: 'auth_cancelled' });
      if (!isTokenFresh(result.accessToken) || !isGraphToken(result.accessToken)) {
        return err({ type: 'auth_failed', message: 'invalid token from browser' });
      }
      persist(result.accessToken, result.refreshToken);
      logger.info('auth.ladder.rung', { rung: 'browser' });
      return ok(result.accessToken);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return err({ type: 'auth_failed', message: msg });
    }
  };

  const getAccessToken = async (): Promise<Result<string, AuthError>> => {
    const cached = readCache(cachePath);
    if (cached && isTokenFresh(cached.access_token) && isGraphToken(cached.access_token)) {
      logger.info('auth.ladder.rung', { rung: 'cache' });
      return ok(cached.access_token);
    }
    if (cached?.refresh_token) {
      const refreshed = await refreshToken(cached);
      if (refreshed.ok) return refreshed;
    }
    return acquireViaBrowser();
  };

  const logout = async (): Promise<Result<void, AuthError>> => {
    try {
      if (existsSync(cachePath)) unlinkSync(cachePath);
      await browserAuth.close();
      return ok(undefined);
    } catch (e) {
      if (existsSync(cachePath)) unlinkSync(cachePath);
      return err({ type: 'auth_failed', message: e instanceof Error ? e.message : String(e) });
    }
  };

  return { getAccessToken, logout };
};

const createAuthManager = (deps: { cachePath: string; logger: Logger }): AuthManager =>
  createAuthManagerFromApi(createBrowserAuth({ logger: deps.logger }), deps.cachePath, deps.logger);

export { createAuthManager, createAuthManagerFromApi };
export type { AuthError, AuthManager };
