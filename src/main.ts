import updateNotifier from 'update-notifier';
import pkg from '../package.json' with { type: 'json' };
import { buildDeps } from './composition/build-deps.ts';
import { buildCli } from './composition/cli.ts';
import { formatError } from './domain/utilities/format-error.ts';

const ONE_WEEK_MS = 1000 * 60 * 60 * 24 * 7;

const main = async (): Promise<void> => {
  updateNotifier({ pkg: { name: pkg.name, version: pkg.version }, updateCheckInterval: ONE_WEEK_MS }).notify({ defer: false });
  const deps = buildDeps();
  const cli = buildCli({ auth: deps.auth, graph: deps.graph, logger: deps.logger, version: pkg.version });
  await cli.parseAsync();
};

try {
  await main();
} catch (e) {
  process.stderr.write(`[crash] ${formatError(e)}\n`);
  process.exit(1);
}
