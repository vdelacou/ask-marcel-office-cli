import { describe, expect, it } from 'bun:test';
import { detectPackageManager } from './package-manager.ts';

describe('detectPackageManager', () => {
  it('detects bun when the bin path lives under a .bun prefix', () => {
    expect(detectPackageManager('/Users/alice/.bun/install/global/node_modules/ask-marcel-office-cli/dist/cli.js')).toBe('bun');
  });

  it('detects bun when the path uses Windows-style separators', () => {
    expect(detectPackageManager('C:\\Users\\alice\\.bun\\install\\global\\node_modules\\ask-marcel-office-cli\\dist\\cli.js')).toBe('bun');
  });

  it('defaults to npm for a typical npm-prefix install path', () => {
    expect(detectPackageManager('/usr/local/lib/node_modules/ask-marcel-office-cli/dist/cli.js')).toBe('npm');
  });

  it('defaults to npm for an empty bin path', () => {
    expect(detectPackageManager('')).toBe('npm');
  });
});
