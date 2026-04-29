import { err, ok } from '../domain/result.ts';
import { formatError } from '../domain/utilities/format-error.ts';
import type { ProcessRunner } from '../use-cases/ports/process-runner.ts';

export const createBunProcessRunner = (): ProcessRunner => ({
  runInherit: async (command, args) => {
    try {
      const proc = Bun.spawn([command, ...args], { stdio: ['inherit', 'inherit', 'inherit'] });
      const exitCode = await proc.exited;
      return ok({ exitCode });
    } catch (e) {
      return err({ type: 'spawn_failed', message: formatError(e) });
    }
  },
});
