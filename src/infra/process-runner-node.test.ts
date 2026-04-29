import { describe, expect, it } from 'bun:test';
import { createNodeProcessRunner } from './process-runner-node.ts';

describe('Node process runner adapter', () => {
  it('returns exitCode 0 when the spawned command succeeds', async () => {
    const runner = createNodeProcessRunner();
    const result = await runner.runInherit('true', []);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.exitCode).toBe(0);
  });

  it('returns the non-zero exitCode when the spawned command fails', async () => {
    const runner = createNodeProcessRunner();
    const result = await runner.runInherit('false', []);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.exitCode).not.toBe(0);
  });

  it('returns spawn_failed when the command does not exist', async () => {
    const runner = createNodeProcessRunner();
    const result = await runner.runInherit('definitely-not-a-real-command-zX9', []);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.type).toBe('spawn_failed');
  });

  it('returns spawn_failed when args spread throws synchronously inside the Promise executor', async () => {
    const runner = createNodeProcessRunner();
    // Force a TypeError out of `[...args]` by smuggling a non-iterable past
    // the type system. Exercises the executor-level catch branch.
    const result = await runner.runInherit('echo', null as unknown as ReadonlyArray<string>);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.type).toBe('spawn_failed');
  });
});
