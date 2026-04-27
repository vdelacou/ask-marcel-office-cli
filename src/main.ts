import { buildDeps } from './composition/build-deps.ts';
import { buildCli } from './composition/cli.ts';
import { formatError } from './domain/utilities/format-error.ts';

const main = async (): Promise<void> => {
  const deps = buildDeps();
  const cli = buildCli({ auth: deps.auth, graph: deps.graph, logger: deps.logger });
  await cli.parseAsync();
};

try {
  await main();
} catch (e) {
  process.stderr.write(`[crash] ${formatError(e)}\n`);
  process.exit(1);
}
