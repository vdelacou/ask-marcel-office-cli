import { describe, expect, it } from 'bun:test';
import { createBunProcessRunner } from './process-runner-bun.ts';

describe('Bun process runner adapter', () => {
  it('returns exitCode 0 when the spawned command succeeds', async () => {
    const runner = createBunProcessRunner();
    const result = await runner.runInherit('true', []);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.exitCode).toBe(0);
  });

  it('returns the non-zero exitCode when the spawned command fails', async () => {
    const runner = createBunProcessRunner();
    const result = await runner.runInherit('false', []);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.exitCode).not.toBe(0);
  });

  it('returns spawn_failed when the command does not exist', async () => {
    const runner = createBunProcessRunner();
    const result = await runner.runInherit('definitely-not-a-real-command-zX9', []);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.type).toBe('spawn_failed');
  });
});
