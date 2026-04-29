import { join } from 'node:path';
import type { AccessToken } from '../domain/access-token.ts';
import { accessToken } from '../domain/access-token.ts';
import type { FileSystem } from '../use-cases/ports/filesystem.ts';
import type { Logger } from '../use-cases/ports/logger.ts';
import { createBunFileSystem } from './filesystem-bun.ts';
import { createNodeFileSystem } from './filesystem-node.ts';

type BrowserTokenResult = { accessToken: AccessToken; refreshToken: string | null };

type BrowserAuth = {
  acquireToken: (scopes: string[], startUrl: string) => Promise<BrowserTokenResult | null>;
  close: () => Promise<void>;
};

type ResponseLike = {
  url(): string;
  headers(): Record<string, string>;
  text(): Promise<string>;
};

type ResponseHandler = (response: ResponseLike) => void;

type PageLike = {
  on(event: 'response', handler: ResponseHandler): void;
  goto(url: string, options: { waitUntil: 'domcontentloaded'; timeout: number }): Promise<unknown>;
  url(): string;
  evaluate(fn: () => void): Promise<unknown>;
  close(): Promise<void>;
};

type ContextLike = {
  newPage(): Promise<PageLike>;
  clearCookies(): Promise<void>;
  close(): Promise<void>;
};

type LaunchOptions = {
  headless: boolean;
  channel?: 'msedge' | 'chrome';
  args: string[];
};

type BrowserAuthApi = {
  launchPersistentContext(profileDir: string, options: LaunchOptions): Promise<ContextLike>;
};

type TraceFn = (message: string) => void;

type BrowserAuthConfig = {
  readonly logger: Logger;
  readonly fs: FileSystem;
  readonly trace?: TraceFn;
  readonly profileDir?: string;
  readonly initialSettleMs?: number;
  readonly postReloginSettleMs?: number;
  readonly pollIntervalMs?: number;
  readonly pollDeadlineMs?: number;
  readonly navigationTimeoutMs?: number;
};

const TOKEN_HOSTS = ['login.microsoftonline.com', 'login.live.com', 'login.microsoft.com'];

const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

const defaultProfileDir = (): string => {
  const envOverride = process.env.ASKMARCEL_BROWSER_PROFILE;
  if (envOverride) return envOverride;
  const base = process.env.USERPROFILE ?? process.env.HOME ?? '';
  return join(base, '.ask-marcel', 'browser-profile');
};

const cleanupSingletonLocks = async (dir: string, fs: FileSystem): Promise<void> => {
  for (const name of ['SingletonLock', 'SingletonCookie', 'SingletonSocket']) {
    await fs.deleteIfExists(join(dir, name));
  }
};

const createBrowserAuthFromApi = (api: BrowserAuthApi, config: BrowserAuthConfig): BrowserAuth => {
  const { logger, fs } = config;
  const trace: TraceFn = config.trace ?? ((m) => process.stderr.write(m));
  const profileDir = config.profileDir ?? defaultProfileDir();
  const initialSettleMs = config.initialSettleMs ?? 5000;
  const postReloginSettleMs = config.postReloginSettleMs ?? 3000;
  const pollIntervalMs = config.pollIntervalMs ?? 2000;
  const pollDeadlineMs = config.pollDeadlineMs ?? 5 * 60 * 1000;
  const navigationTimeoutMs = config.navigationTimeoutMs ?? 30_000;

  let context: ContextLike | null = null;

  const launchContext = async (): Promise<ContextLike> => {
    for (const channel of ['msedge', 'chrome'] as const) {
      try {
        const ctx = await api.launchPersistentContext(profileDir, {
          headless: false,
          channel,
          args: ['--disable-blink-features=AutomationControlled'],
        });
        logger.info('browser_launched', { channel });
        trace(`[DEBUG] browser launched with channel: ${channel}\n`);
        return ctx;
      } catch {
        logger.info('browser_launch_failed', { channel });
        trace(`[DEBUG] browser launch failed for channel: ${channel}\n`);
      }
    }
    const ctx = await api.launchPersistentContext(profileDir, {
      headless: false,
      args: ['--disable-blink-features=AutomationControlled'],
    });
    logger.info('browser_launched', { channel: 'bundled' });
    trace('[DEBUG] browser launched with channel: bundled\n');
    return ctx;
  };

  const acquireToken = async (scopes: string[], startUrl: string): Promise<BrowserTokenResult | null> => {
    await cleanupSingletonLocks(profileDir, fs);

    let capturedAccess: AccessToken | null = null;
    let capturedRefresh: string | null = null;

    context = await launchContext();
    const page = await context.newPage();

    const handleResponse = async (response: ResponseLike): Promise<void> => {
      if (capturedAccess) return;
      const url = response.url();
      if (!TOKEN_HOSTS.some((d) => url.includes(d))) return;
      const ct = response.headers()['content-type'] ?? '';
      if (!ct.includes('json')) return;
      try {
        const body = await response.text();
        if (!body.includes('access_token')) return;
        const data = JSON.parse(body) as { access_token?: string; refresh_token?: string };
        const raw = data.access_token ?? '';
        const validated = accessToken(raw);
        if (!validated.ok) {
          trace(`[DEBUG] non-graph token skipped, len: ${raw.length}\n`);
          return;
        }
        capturedAccess = validated.value;
        capturedRefresh = data.refresh_token ?? null;
        logger.info('token_captured', { len: validated.value.length });
        trace(`[DEBUG] graph token captured, len: ${validated.value.length}\n`);
      } catch {
        // ignore parse errors
      }
    };
    page.on('response', (r) => {
      void handleResponse(r);
    });

    logger.info('browser_navigating', { url: startUrl });
    trace(`[DEBUG] navigating to: ${startUrl}\n`);
    try {
      await page.goto(startUrl, { waitUntil: 'domcontentloaded', timeout: navigationTimeoutMs });
      logger.info('browser_navigated', { url: startUrl });
    } catch (navError) {
      const navMsg = navError instanceof Error ? navError.message : String(navError);
      trace(`[DEBUG] navigation error (non-fatal): ${navMsg}\n`);
      logger.info('browser_navigation_error', { message: navMsg });
    }

    const cleanup = async (): Promise<void> => {
      try {
        await page.close();
      } catch {
        // ignore
      }
      try {
        if (context) await context.close();
      } catch {
        // ignore
      }
      context = null;
    };

    await sleep(initialSettleMs);
    if (capturedAccess) {
      trace('[DEBUG] token captured during initial settle\n');
      await cleanup();
      return { accessToken: capturedAccess, refreshToken: capturedRefresh };
    }

    const currentUrl = page.url();
    if (!currentUrl.includes('login.microsoftonline.com') && !currentUrl.includes('login.live.com')) {
      trace('[DEBUG] already signed in — clearing session to force fresh login\n');
      logger.info('browser_force_relogin', { url: currentUrl });
      await context.clearCookies();
      try {
        await page.evaluate(() => {
          localStorage.clear();
          sessionStorage.clear();
        });
      } catch {
        // ignore
      }
      try {
        await page.goto(startUrl, { waitUntil: 'domcontentloaded', timeout: navigationTimeoutMs });
      } catch {
        // non-fatal
      }
      await sleep(postReloginSettleMs);
      if (capturedAccess) {
        trace('[DEBUG] token captured after force relogin\n');
        await cleanup();
        return { accessToken: capturedAccess, refreshToken: capturedRefresh };
      }
    }

    trace('[DEBUG] complete sign-in in the browser window — waiting up to 5 min\n');
    const deadline = Date.now() + pollDeadlineMs;
    while (Date.now() < deadline) {
      if (capturedAccess) {
        trace('[DEBUG] token found in polling loop, closing browser\n');
        await cleanup();
        return { accessToken: capturedAccess, refreshToken: capturedRefresh };
      }
      await sleep(pollIntervalMs);
    }

    trace('[DEBUG] polling loop timeout expired, no token captured\n');
    await cleanup();
    return null;
  };

  const close = async (): Promise<void> => {
    logger.info('browser_auth_close');
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

const defaultFileSystem = (): FileSystem => (typeof globalThis.Bun !== 'undefined' ? createBunFileSystem() : createNodeFileSystem());

const createBrowserAuth = (deps: { logger: Logger; fs?: FileSystem }): BrowserAuth => {
  const api: BrowserAuthApi = {
    launchPersistentContext: async (profileDir, options) => {
      for (const k of ['HTTP_PROXY', 'HTTPS_PROXY', 'http_proxy', 'https_proxy']) {
        delete process.env[k];
      }
      const { chromium } = await import('playwright');
      const ctx = await chromium.launchPersistentContext(profileDir, options);
      return ctx;
    },
  };

  return createBrowserAuthFromApi(api, { logger: deps.logger, fs: deps.fs ?? defaultFileSystem() });
};

export { createBrowserAuth, createBrowserAuthFromApi };
export type { BrowserAuth, BrowserAuthApi, BrowserAuthConfig, BrowserTokenResult, ContextLike, PageLike, ResponseLike };
