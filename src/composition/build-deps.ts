import { join } from 'node:path';
import type { AuthManager } from '../infra/auth.ts';
import { createAuthManager } from '../infra/auth.ts';
import { createBunFileSystem } from '../infra/filesystem-bun.ts';
import { createNodeFileSystem } from '../infra/filesystem-node.ts';
import type { GraphClient } from '../infra/graph-client.ts';
import { createGraphClient } from '../infra/graph-client.ts';
import { createWinstonLogger } from '../infra/logger.ts';
import type { FileSystem } from '../use-cases/ports/filesystem.ts';
import type { Logger } from '../use-cases/ports/logger.ts';

export type BuildDepsConfig = {
  readonly logLevel?: string;
  readonly cachePath?: string;
  readonly home?: string;
  readonly fs?: FileSystem;
};

const defaultCachePath = (home: string): string => join(home, '.ask-marcel', 'token-cache.json');

const defaultFileSystem = (): FileSystem => (typeof globalThis.Bun !== 'undefined' ? createBunFileSystem() : createNodeFileSystem());

export const buildDeps = (config: BuildDepsConfig = {}): Readonly<{ logger: Logger; auth: AuthManager; graph: GraphClient }> => {
  const home = config.home ?? process.env.HOME ?? process.env.USERPROFILE ?? '';
  const cachePath = config.cachePath ?? defaultCachePath(home);
  const logLevel = config.logLevel ?? process.env.LOG_LEVEL ?? 'info';
  const fs = config.fs ?? defaultFileSystem();
  const logger = createWinstonLogger({ logLevel });
  const auth = createAuthManager({ cachePath, logger, fs });
  const graph = createGraphClient(auth);
  return { logger, auth, graph };
};
