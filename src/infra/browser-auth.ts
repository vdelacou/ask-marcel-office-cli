import { existsSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import type { Logger } from '../use-cases/ports/logger.ts';

type BrowserTokenResult = { accessToken: string; refreshToken: string | null };

type BrowserAuthApi = {
  acquireToken: (scopes: string[], startUrl: string) => Promise<BrowserTokenResult | null>;
  close: () => Promise<void>;
};

type BrowserAuth = {
  acquireToken: (scopes: string[], startUrl: string) => Promise<BrowserTokenResult | null>;
  close: () => Promise<void>;
};

const createBrowserAuthFromApi = (api: BrowserAuthApi, logger: Logger): BrowserAuth => ({
  acquireToken: async (scopes, startUrl) => {
    try {
      logger.info('browser_auth_acquire', { scopes, startUrl });
      return await api.acquireToken(scopes, startUrl);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      logger.info('browser_auth_error', { message: msg });
      return null;
    }
  },
  close: async () => {
    logger.info('browser_auth_close');
    return api.close();
  },
});

const createBrowserAuth = (deps: { logger: Logger }): BrowserAuth => {
  let context: import('playwright').BrowserContext | null = null;

  const acquireToken = async (scopes: string[], startUrl: string): Promise<BrowserTokenResult | null> => {
    const { chromium } = await import('playwright');
    const profileDir = getProfileDir();

    cleanupSingletonLocks(profileDir);

    let capturedAccess: string | null = null;
    let capturedRefresh: string | null = null;

    for (const channel of ['msedge', 'chrome'] as const) {
      try {
        context = await chromium.launchPersistentContext(profileDir, {
          headless: false,
          channel,
          args: ['--disable-blink-features=AutomationControlled'],
        });
        deps.logger.info('browser_launched', { channel });
        process.stderr.write(`[DEBUG] browser launched with channel: ${channel}\n`);
        break;
      } catch {
        deps.logger.info('browser_launch_failed', { channel });
        process.stderr.write(`[DEBUG] browser launch failed for channel: ${channel}\n`);
      }
    }
    if (!context) {
      context = await chromium.launchPersistentContext(profileDir, {
        headless: false,
        args: ['--disable-blink-features=AutomationControlled'],
      });
      deps.logger.info('browser_launched', { channel: 'bundled' });
      process.stderr.write('[DEBUG] browser launched with channel: bundled\n');
    }

    const page = await context.newPage();

    const tokenUrls = ['login.microsoftonline.com', 'login.live.com', 'login.microsoft.com'];
    page.on('response', async (response) => {
      if (capturedAccess) return;
      const url = response.url();
      if (!tokenUrls.some((d) => url.includes(d))) return;
      const ct = response.headers()['content-type'] ?? '';
      if (!ct.includes('json')) return;
      try {
        const body = await response.text();
        if (!body.includes('access_token')) return;
        const data = JSON.parse(body) as { access_token?: string; refresh_token?: string };
        const access = data.access_token ?? '';
        if (access.startsWith('eyJ')) {
          capturedAccess = access;
          capturedRefresh = data.refresh_token ?? null;
          deps.logger.info('token_captured', { len: access.length });
          process.stderr.write(`[DEBUG] token captured, len: ${access.length}\n`);
        }
      } catch {
        // ignore parse errors
      }
    });

    deps.logger.info('browser_navigating', { url: startUrl });
    process.stderr.write(`[DEBUG] navigating to: ${startUrl}\n`);
    try {
      await page.goto(startUrl, { waitUntil: 'domcontentloaded', timeout: 30_000 });
      deps.logger.info('browser_navigated', { url: startUrl });
    } catch (navError) {
      const navMsg = navError instanceof Error ? navError.message : String(navError);
      process.stderr.write(`[DEBUG] navigation error: ${navMsg}\n`);
      deps.logger.info('browser_navigation_error', { message: navMsg });
    }

    process.stderr.write('[DEBUG] entering polling loop (5 min deadline)\n');
    const deadline = Date.now() + 5 * 60 * 1000;
    while (Date.now() < deadline) {
      if (capturedAccess) {
        process.stderr.write('[DEBUG] token found in polling loop, closing page\n');
        await page.close();
        return { accessToken: capturedAccess, refreshToken: capturedRefresh };
      }
      await new Promise((r) => setTimeout(r, 2000));
    }

    process.stderr.write('[DEBUG] polling loop timeout expired, no token captured\n');

    await page.close();
    return null;
  };

  const close = async (): Promise<void> => {
    if (context) {
      try {
        await context.close();
      } catch {
        // ignore
      }
      context = null;
    }
  };

  return { acquireToken, close };
};

const getProfileDir = (): string => {
  const envOverride = process.env.ASKMARCEL_BROWSER_PROFILE;
  if (envOverride) {
    if (!existsSync(envOverride)) mkdirSync(envOverride, { recursive: true });
    return envOverride;
  }
  const base = process.env.USERPROFILE ?? process.env.HOME ?? '';
  const dir = join(base, '.ask-marcel', 'browser-profile');
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  return dir;
};

const cleanupSingletonLocks = (dir: string): void => {
  for (const name of ['SingletonLock', 'SingletonCookie', 'SingletonSocket']) {
    try {
      rmSync(join(dir, name), { force: true });
    } catch {
      // ignore
    }
  }
};

export { createBrowserAuth, createBrowserAuthFromApi };
export type { BrowserAuth, BrowserAuthApi, BrowserTokenResult };
