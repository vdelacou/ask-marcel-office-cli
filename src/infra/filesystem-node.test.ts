import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { chmodSync, existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createNodeFileSystem } from './filesystem-node.ts';

let tmp: string;

beforeEach(() => {
  tmp = mkdtempSync(join(tmpdir(), 'atelier-fs-node-'));
});

afterEach(() => {
  try {
    chmodSync(tmp, 0o700);
  } catch {
    // ignore — only relevant for tests that chmod the directory
  }
  rmSync(tmp, { recursive: true, force: true });
});

describe('Node filesystem adapter', () => {
  it('reads a JSON file as a typed value', async () => {
    const path = join(tmp, 'cfg.json');
    writeFileSync(path, JSON.stringify({ token: 'abc' }));
    const fs = createNodeFileSystem();
    const result = await fs.readJson<{ token: string }>(path);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.token).toBe('abc');
  });

  it('returns not_found when the JSON file is missing', async () => {
    const fs = createNodeFileSystem();
    const result = await fs.readJson(join(tmp, 'missing.json'));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.type).toBe('not_found');
  });

  it('returns parse_failed when the JSON file is corrupt', async () => {
    const path = join(tmp, 'bad.json');
    writeFileSync(path, '{not valid json');
    const fs = createNodeFileSystem();
    const result = await fs.readJson(path);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.type).toBe('parse_failed');
  });

  it('returns io_failed when the file is unreadable', async () => {
    const path = join(tmp, 'forbidden.json');
    writeFileSync(path, '{}');
    chmodSync(path, 0o000);
    const fs = createNodeFileSystem();
    const result = await fs.readJson(path);
    chmodSync(path, 0o600);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.type).toBe('io_failed');
  });

  it('writes text to a new file, creating parent directories on demand', async () => {
    const path = join(tmp, 'nested', 'sub', 'cache.json');
    const fs = createNodeFileSystem();
    const result = await fs.writeText(path, '{"hello":"world"}');
    expect(result.ok).toBe(true);
    expect(readFileSync(path, 'utf-8')).toBe('{"hello":"world"}');
  });

  it('returns io_failed when the destination directory is not writable', async () => {
    const dir = join(tmp, 'ro');
    writeFileSync(join(tmp, 'placeholder'), 'x');
    chmodSync(tmp, 0o500);
    const fs = createNodeFileSystem();
    const result = await fs.writeText(join(dir, 'cannot.json'), 'x');
    chmodSync(tmp, 0o700);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.type).toBe('io_failed');
  });

  it('deletes an existing file', async () => {
    const path = join(tmp, 'cache.json');
    writeFileSync(path, 'data');
    const fs = createNodeFileSystem();
    const result = await fs.deleteIfExists(path);
    expect(result.ok).toBe(true);
    expect(existsSync(path)).toBe(false);
  });

  it('is a no-op when deleting a missing file', async () => {
    const fs = createNodeFileSystem();
    const result = await fs.deleteIfExists(join(tmp, 'never-existed.json'));
    expect(result.ok).toBe(true);
  });
});
