import { describe, expect, it } from 'bun:test';
import type { Command, CommandMeta } from './command-types.ts';
import { commands } from './index.ts';

const camelToKebab = (s: string): string => s.replaceAll(/([A-Z])/g, '-$1').toLowerCase();

const schemaKeys = (schema: Command['schema']): string[] => {
  const shape = (schema as unknown as { shape?: Record<string, unknown> }).shape;
  return shape ? Object.keys(shape) : [];
};

const placeholders = (template: string): string[] => Array.from(template.matchAll(/\{([a-z][a-z0-9-]*)\}/g), (m) => m[1] ?? '');

type PopulatedEntry = readonly [string, Command & { meta: CommandMeta }];

const populated: ReadonlyArray<PopulatedEntry> = Object.entries(commands).flatMap(([name, cmd]) => {
  const meta = cmd.meta;
  return meta ? [[name, { ...cmd, meta }] as PopulatedEntry] : [];
});

describe('command meta — invariants on every populated command', () => {
  it('finds at least one populated command (slice 1 must populate ≥1 to validate the design)', () => {
    expect(populated.length).toBeGreaterThan(0);
  });

  for (const [name, cmd] of populated) {
    describe(`meta for \`${name}\``, () => {
      it('has a non-empty summary', () => {
        expect(cmd.meta.summary.trim().length).toBeGreaterThan(0);
      });

      it('declares one CommandOptionMeta entry per Zod schema field', () => {
        const keys = schemaKeys(cmd.schema).toSorted((a, b) => a.localeCompare(b));
        const optionKeys = cmd.meta.options.map((o) => o.key).toSorted((a, b) => a.localeCompare(b));
        expect(optionKeys).toEqual(keys);
      });

      it('uses kebab-case `name` matching the camelCase `key` in every option', () => {
        for (const opt of cmd.meta.options) {
          expect(opt.name).toBe(camelToKebab(opt.key));
          expect(opt.description.trim().length).toBeGreaterThan(0);
        }
      });

      it('references each option exactly once in graphPathTemplate (and references nothing else)', () => {
        const expected = cmd.meta.options.map((o) => o.name).toSorted((a, b) => a.localeCompare(b));
        const found = placeholders(cmd.meta.graphPathTemplate).toSorted((a, b) => a.localeCompare(b));
        expect(found).toEqual(expected);
      });

      it('publishes a Microsoft Learn URL for the underlying Graph endpoint', () => {
        expect(cmd.meta.graphDocsUrl).toMatch(/^https:\/\/learn\.microsoft\.com\/en-us\/graph\/api\//);
      });

      it('provides a runnable example beginning with `ask-marcel`', () => {
        expect(cmd.meta.example).toMatch(/^ask-marcel /);
      });
    });
  }
});
