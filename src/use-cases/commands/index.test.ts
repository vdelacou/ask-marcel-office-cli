import { describe, expect, it } from 'bun:test';
import { commands } from './index.ts';

describe('commands index', () => {
  it('exports a non-empty commands record', () => {
    const names = Object.keys(commands);
    expect(names.length).toBeGreaterThan(0);
    expect(names).toContain('list-drives');
    expect(names).toContain('list-joined-teams');
  });
});
