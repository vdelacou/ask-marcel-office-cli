import { Command } from 'commander';
import type { AuthManager } from '../infra/auth.ts';
import type { GraphClient } from '../infra/graph-client.ts';
import { render, renderError } from '../presenter/output.ts';
import { commands as cmdRegistry } from '../use-cases/commands/index.ts';
import * as login from '../use-cases/commands/login.ts';
import * as logout from '../use-cases/commands/logout.ts';
import * as update from '../use-cases/commands/update.ts';
import type { Logger } from '../use-cases/ports/logger.ts';
import type { ProcessRunner } from '../use-cases/ports/process-runner.ts';
import { detectPackageManager } from './package-manager.ts';

type BuildCliDeps = {
  readonly auth: AuthManager;
  readonly graph: GraphClient;
  readonly logger: Logger;
  readonly processRunner: ProcessRunner;
  readonly version?: string;
  readonly packageManager?: 'npm' | 'bun';
};

const buildCli = (deps: BuildCliDeps): Command => {
  const { auth, graph, logger, processRunner, version } = deps;
  const program = new Command();

  program
    .name('ask-marcel')
    .description('Microsoft Graph CLI')
    .version(version ?? '0.0.0');

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

  program
    .command('update')
    .description('Update ask-marcel to the latest version on npm')
    .action(async () => {
      const manager = deps.packageManager ?? detectPackageManager(process.argv[1] ?? '');
      const result = await update.execute(processRunner, manager);
      if (result.ok) render({ status: 'updated', via: manager }, logger);
      else if (result.error.type === 'spawn_failed') renderError(`update failed: ${result.error.message}`, logger);
      else renderError(`update install exited with code ${result.error.exitCode}`, logger);
    });

  for (const [name, cmd] of Object.entries(cmdRegistry)) {
    const description = cmd.meta?.summary ?? `Graph API: ${name}`;
    const commandDef = program.command(name).description(description);
    const schemaKeys = getSchemaKeys(cmd.schema);
    for (const key of schemaKeys) {
      const optionMeta = cmd.meta?.options.find((o) => o.key === key);
      commandDef.requiredOption(`--${camelToKebab(key)} <value>`, optionMeta?.description ?? key);
    }
    if (cmd.meta) {
      const lines = [`\nGraph endpoint: ${cmd.meta.graphMethod} ${cmd.meta.graphPathTemplate}`, `Microsoft Learn: ${cmd.meta.graphDocsUrl}`, `\nExample:\n  ${cmd.meta.example}`];
      commandDef.addHelpText('after', lines.join('\n'));
    }
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
export type { BuildCliDeps };
