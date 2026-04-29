import type { Result } from '../../domain/result.ts';

export type ProcessRunnerError = { type: 'spawn_failed'; message: string };

export type ProcessRunResult = { readonly exitCode: number };

export type ProcessRunner = {
  readonly runInherit: (command: string, args: ReadonlyArray<string>) => Promise<Result<ProcessRunResult, ProcessRunnerError>>;
};
