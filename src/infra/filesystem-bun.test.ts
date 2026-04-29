import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createBunFileSystem } from './filesystem-bun.ts';

let tmp: string;

beforeEach(() => {
  tmp = mkdtempSync(join(tmpdir(), 'atelier-fs-bun-'));
});

afterEach(() => {
  rmSync(tmp, { recursive: true, force: true });
});

describe('Bun filesystem adapter', () => {
  it('reads a JSON file as a typed value', async () => {
    const path = join(tmp, 'cfg.json');
    writeFileSync(path, JSON.stringify({ token: 'abc' }));
    const fs = createBunFileSystem();
    const result = await fs.readJson<{ token: string }>(path);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.token).toBe('abc');
  });

  it('returns not_found when the JSON file is missing', async () => {
    const fs = createBunFileSystem();
    const result = await fs.readJson(join(tmp, 'missing.json'));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.type).toBe('not_found');
  });

  it('returns parse_failed when the JSON file is corrupt', async () => {
    const path = join(tmp, 'bad.json');
    writeFileSync(path, '{not valid json');
    const fs = createBunFileSystem();
    const result = await fs.readJson(path);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.type).toBe('parse_failed');
  });

  it('writes text to a new file, creating parent directories on demand', async () => {
    const path = join(tmp, 'nested', 'sub', 'cache.json');
    const fs = createBunFileSystem();
    const result = await fs.writeText(path, '{"hello":"world"}');
    expect(result.ok).toBe(true);
    expect(await Bun.file(path).text()).toBe('{"hello":"world"}');
  });

  it('overwrites an existing file', async () => {
    const path = join(tmp, 'cache.json');
    writeFileSync(path, 'old');
    const fs = createBunFileSystem();
    const result = await fs.writeText(path, 'new');
    expect(result.ok).toBe(true);
    expect(await Bun.file(path).text()).toBe('new');
  });

  it('deletes an existing file', async () => {
    const path = join(tmp, 'cache.json');
    writeFileSync(path, 'data');
    const fs = createBunFileSystem();
    const result = await fs.deleteIfExists(path);
    expect(result.ok).toBe(true);
    expect(await Bun.file(path).exists()).toBe(false);
  });

  it('is a no-op when deleting a missing file', async () => {
    const fs = createBunFileSystem();
    const result = await fs.deleteIfExists(join(tmp, 'never-existed.json'));
    expect(result.ok).toBe(true);
  });

  it('returns io_failed when Bun.write cannot create the destination file', async () => {
    const fs = createBunFileSystem();
    // Make a regular file at `tmp/blocker`, then try to write to a path that
    // requires `tmp/blocker` to be a directory. ENOTDIR fires the catch.
    const blocker = join(tmp, 'blocker');
    writeFileSync(blocker, 'I am a file, not a directory');
    const result = await fs.writeText(join(blocker, 'sub.json'), 'payload');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.type).toBe('io_failed');
  });
});
