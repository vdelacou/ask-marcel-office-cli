import { Command } from 'commander';
import type { AuthManager } from '../infra/auth.ts';
import type { GraphClient } from '../infra/graph-client.ts';
import { render, renderError } from '../presenter/output.ts';
import { renderSingleCommand } from '../use-cases/commands/docs.ts';
import { CATEGORY_LABELS, CATEGORY_ORDER } from '../use-cases/commands/docs-render.ts';
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
  readonly onCommandError?: () => void;
};

const buildCli = (deps: BuildCliDeps): Command => {
  const { auth, graph, logger, processRunner, version } = deps;
  const program = new Command();

  const fail = (message: string): void => {
    renderError(message, logger);
    deps.onCommandError?.();
  };

  program
    .name('ask-marcel')
    .description('Microsoft Graph CLI')
    .version(version ?? '0.0.0');

  program.commandsGroup('Lifecycle:');

  program
    .command('login')
    .description('Authenticate (cached → refresh → browser)')
    .action(async () => {
      const result = await login.execute(auth);
      if (result.ok) render({ status: 'authenticated' }, logger);
      else fail(result.error.type === 'auth_cancelled' ? 'Authentication cancelled' : result.error.message);
    });

  program
    .command('logout')
    .description('Clear cached tokens')
    .action(async () => {
      const result = await logout.execute(auth);
      if (result.ok) render({ status: 'logged_out' }, logger);
      else fail(result.error.type === 'auth_cancelled' ? 'Logout cancelled' : result.error.message);
    });

  program
    .command('update')
    .description('Update ask-marcel to the latest version on npm (auto-detects npm vs bun)')
    .action(async () => {
      const manager = deps.packageManager ?? detectPackageManager(process.argv[1] ?? '');
      const result = await update.execute(processRunner, manager);
      if (result.ok) render({ status: 'updated', via: manager }, logger);
      else if (result.error.type === 'spawn_failed') fail(`update failed: ${result.error.message}`);
      else fail(`update install exited with code ${result.error.exitCode}`);
    });

  program
    .command('docs')
    .description('Print Markdown docs for a single command')
    .argument('<command>', 'Command name to show docs for (run `ask-marcel --help` to list every command)')
    .action((commandName: string) => {
      const result = renderSingleCommand(cmdRegistry, commandName);
      if (result.ok) process.stdout.write(`${result.value}\n`);
      else fail(`Unknown command "${result.error.name}". Run \`ask-marcel --help\` to list every command.`);
    });

  for (const category of CATEGORY_ORDER) {
    const entries = Object.entries(cmdRegistry).filter(([, c]) => c.meta.category === category);
    if (entries.length === 0) continue;
    program.commandsGroup(`${CATEGORY_LABELS[category]}:`);
    for (const [name, cmd] of entries) {
      const commandDef = program.command(name).description(cmd.meta.summary);
      for (const opt of cmd.meta.options) commandDef.requiredOption(`--${opt.name} <value>`, opt.description);
      const helpLines = [
        `\nGraph endpoint: ${cmd.meta.graphMethod} ${cmd.meta.graphPathTemplate}`,
        `Microsoft Learn: ${cmd.meta.graphDocsUrl}`,
        ...(cmd.meta.bodyTemplate ? [`\nRequest body:\n  ${cmd.meta.bodyTemplate}`] : []),
        `\nExample:\n  ${cmd.meta.example}`,
      ];
      commandDef.addHelpText('after', helpLines.join('\n'));
      commandDef.action(async (opts: Record<string, string>) => {
        const result = await cmd.execute(graph, opts);
        if (result.ok) render(result.value, logger);
        else fail(result.error.message);
      });
    }
  }

  return program;
};

export { buildCli };
export type { BuildCliDeps };
