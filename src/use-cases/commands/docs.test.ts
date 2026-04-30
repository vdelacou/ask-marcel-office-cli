import { describe, expect, it } from 'bun:test';
import type { Command } from './command-types.ts';
import { buildManifest, renderSingleCommand } from './docs.ts';

const fakeCmd = (overrides: Partial<Command['meta']> = {}): Command => ({
  schema: { _: 'fake' } as never,
  execute: async () => ({ ok: true, value: undefined }),
  meta: {
    summary: 'fake summary',
    category: 'drive',
    graphMethod: 'GET',
    graphPathTemplate: '/fake',
    graphDocsUrl: 'https://learn.microsoft.com/en-us/graph/api/fake',
    options: [],
    example: 'ask-marcel fake',
    ...overrides,
  },
});

describe('buildManifest', () => {
  it('builds a manifest with package name, version, generatedAt, and sorted commands', () => {
    const registry: Readonly<Record<string, Command>> = { 'list-zebra': fakeCmd(), 'list-apple': fakeCmd() };
    const manifest = buildManifest(registry, 'fake-pkg', '0.0.1', () => new Date('2026-04-30T12:00:00Z'));
    expect(manifest.package).toBe('fake-pkg');
    expect(manifest.version).toBe('0.0.1');
    expect(manifest.generatedAt).toBe('2026-04-30T12:00:00.000Z');
    expect(manifest.commands.map((c) => c.name)).toEqual(['list-apple', 'list-zebra']);
  });

  it('omits responseShape when the source meta does not provide one', () => {
    const registry: Readonly<Record<string, Command>> = { foo: fakeCmd() };
    const manifest = buildManifest(registry, 'fake-pkg', '0.0.1');
    expect(manifest.commands[0]).not.toHaveProperty('responseShape');
  });

  it('keeps responseShape when the source meta provides one', () => {
    const registry: Readonly<Record<string, Command>> = { foo: fakeCmd({ responseShape: 'single thing' }) };
    const manifest = buildManifest(registry, 'fake-pkg', '0.0.1');
    expect(manifest.commands[0]?.responseShape).toBe('single thing');
  });

  it('uses the real `new Date()` when no clock injector is given', () => {
    const before = Date.now();
    const manifest = buildManifest({ foo: fakeCmd() }, 'fake-pkg', '0.0.1');
    const after = Date.now();
    const generatedAt = new Date(manifest.generatedAt).getTime();
    expect(generatedAt).toBeGreaterThanOrEqual(before);
    expect(generatedAt).toBeLessThanOrEqual(after);
  });
});

describe('renderSingleCommand', () => {
  it('returns Markdown for an existing command', () => {
    const registry: Readonly<Record<string, Command>> = { 'get-current-user': fakeCmd({ summary: 'returns the user' }) };
    const result = renderSingleCommand(registry, 'get-current-user');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toContain('# `get-current-user`');
      expect(result.value).toContain('returns the user');
    }
  });

  it('returns unknown_command with the alphabetically sorted available list when the command is missing', () => {
    const registry: Readonly<Record<string, Command>> = { 'list-zebra': fakeCmd(), 'list-apple': fakeCmd() };
    const result = renderSingleCommand(registry, 'list-banana');
    expect(result.ok).toBe(false);
    if (!result.ok && result.error.type === 'unknown_command') {
      expect(result.error.name).toBe('list-banana');
      expect(result.error.available).toEqual(['list-apple', 'list-zebra']);
    }
  });
});
