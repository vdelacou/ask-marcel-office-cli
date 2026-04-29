import { Command } from 'commander';
import type { AuthManager } from '../infra/auth.ts';
import type { GraphClient } from '../infra/graph-client.ts';
import { render, renderError } from '../presenter/output.ts';
import { commands as cmdRegistry } from '../use-cases/commands/index.ts';
import * as login from '../use-cases/commands/login.ts';
import * as logout from '../use-cases/commands/logout.ts';
import type { Logger } from '../use-cases/ports/logger.ts';

const buildCli = (deps: { auth: AuthManager; graph: GraphClient; logger: Logger; version?: string }): Command => {
  const { auth, graph, logger, version } = deps;
  const program = new Command();

  program.name('ask-marcel').description('Microsoft Graph CLI').version(version ?? '0.0.0');

  program
    .command('login')
    .description('Authenticate (cached → refresh → browser)')
    .action(async () => {
      const result = await login.execute(auth);
      if (result.ok) render({ status: 'authenticated' }, logger);
      else renderError(result.error.type === 'auth_cancelled' ? 'Authentication cancelled' : result.error.message, logger);
    });

  program
    .command('logout')
    .description('Clear cached tokens')
    .action(async () => {
      const result = await logout.execute(auth);
      if (result.ok) render({ status: 'logged_out' }, logger);
      else renderError(result.error.type === 'auth_cancelled' ? 'Logout cancelled' : result.error.message, logger);
    });

  for (const [name, cmd] of Object.entries(cmdRegistry)) {
    const commandDef = program.command(name).description(`Graph API: ${name}`);
    const schemaKeys = getSchemaKeys(cmd.schema);
    for (const key of schemaKeys) commandDef.requiredOption(`--${camelToKebab(key)} <value>`, key);
    commandDef.action(async (opts: Record<string, string>) => {
      const result = await cmd.execute(graph, opts);
      if (result.ok) render(result.value, logger);
      else renderError(result.error.message, logger);
    });
  }

  return program;
};

const getSchemaKeys = (schema: import('zod').ZodType): string[] => {
  const def = schema as unknown as Record<string, unknown>;
  const shape = def.shape as Record<string, unknown> | undefined;
  if (shape) return Object.keys(shape);
  return [];
};

const camelToKebab = (s: string): string => s.replaceAll(/([A-Z])/g, '-$1').toLowerCase();

export { buildCli };
