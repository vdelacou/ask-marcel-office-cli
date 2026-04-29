import { err, ok } from '../domain/result.ts';
import type { ProcessRunner, ProcessRunResult } from '../use-cases/ports/process-runner.ts';

export type ProcessRunnerFake = ProcessRunner & {
  readonly calls: ReadonlyArray<{ readonly command: string; readonly args: ReadonlyArray<string> }>;
};

export type ProcessRunnerFakeConfig = {
  readonly resultPerCall?: ReadonlyArray<ProcessRunResult>;
  readonly throwOn?: ReadonlyArray<number>;
};

export const createProcessRunnerFake = (config: ProcessRunnerFakeConfig = {}): ProcessRunnerFake => {
  const calls: { command: string; args: ReadonlyArray<string> }[] = [];
  let idx = 0;
  return {
    calls,
    runInherit: async (command, args) => {
      const i = idx;
      idx += 1;
      calls.push({ command, args });
      if (config.throwOn?.includes(i)) return err({ type: 'spawn_failed', message: `fake spawn failed at call ${i}` });
      const result = config.resultPerCall?.[i] ?? { exitCode: 0 };
      return ok(result);
    },
  };
};
