import { join } from 'node:path';
import type { AuthManager } from '../infra/auth.ts';
import { createAuthManager } from '../infra/auth.ts';
import type { GraphClient } from '../infra/graph-client.ts';
import { createGraphClient } from '../infra/graph-client.ts';
import { createWinstonLogger } from '../infra/logger.ts';
import type { Logger } from '../use-cases/ports/logger.ts';

export type BuildDepsConfig = {
  readonly logLevel?: string;
};

const CACHE_PATH = join(process.env.HOME ?? process.env.USERPROFILE ?? '', '.ask-marcel', 'token-cache.json');

export const buildDeps = (config: BuildDepsConfig = {}): Readonly<{ logger: Logger; auth: AuthManager; graph: GraphClient }> => {
  const resolvedLevel = config.logLevel ?? process.env.LOG_LEVEL ?? 'info';
  process.env.LOG_LEVEL = resolvedLevel;
  const logger = createWinstonLogger();
  const auth = createAuthManager({ cachePath: CACHE_PATH, logger });
  const graph = createGraphClient(auth);
  return { logger, auth, graph };
};
