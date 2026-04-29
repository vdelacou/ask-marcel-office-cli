import { z } from 'zod';
import type { Result } from '../../domain/result.ts';
import { err, ok } from '../../domain/result.ts';
import type { ProcessRunner } from '../ports/process-runner.ts';

export type UpdateError = { type: 'spawn_failed'; message: string } | { type: 'install_failed'; exitCode: number };

export type PackageManager = 'npm' | 'bun';

const PACKAGE = 'ask-marcel-office-cli';

const argsFor = (manager: PackageManager): string[] => (manager === 'bun' ? ['add', '-g', `${PACKAGE}@latest`] : ['i', '-g', `${PACKAGE}@latest`]);

const schema = z.object({}).strict();

const execute = async (runner: ProcessRunner, manager: PackageManager): Promise<Result<{ readonly exitCode: number }, UpdateError>> => {
  const result = await runner.runInherit(manager, argsFor(manager));
  if (!result.ok) return err({ type: 'spawn_failed', message: result.error.message });
  if (result.value.exitCode !== 0) return err({ type: 'install_failed', exitCode: result.value.exitCode });
  return ok({ exitCode: result.value.exitCode });
};

export { execute, schema };
