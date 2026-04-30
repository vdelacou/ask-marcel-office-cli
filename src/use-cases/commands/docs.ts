import type { Result } from '../../domain/result.ts';
import { err, ok } from '../../domain/result.ts';
import type { Command } from './command-types.ts';
import type { CommandManifest, CommandManifestEntry } from './docs-render.ts';
import { renderCommandMarkdown } from './docs-render.ts';

export type DocsError = { type: 'unknown_command'; readonly name: string; readonly available: ReadonlyArray<string> };

const toEntry = (name: string, cmd: Command): CommandManifestEntry => ({
  name,
  summary: cmd.meta.summary,
  category: cmd.meta.category,
  graphMethod: cmd.meta.graphMethod,
  graphPathTemplate: cmd.meta.graphPathTemplate,
  graphDocsUrl: cmd.meta.graphDocsUrl,
  options: cmd.meta.options,
  example: cmd.meta.example,
  ...(cmd.meta.responseShape ? { responseShape: cmd.meta.responseShape } : {}),
});

const buildEntries = (registry: Readonly<Record<string, Command>>): ReadonlyArray<CommandManifestEntry> =>
  Object.entries(registry)
    .map(([name, cmd]) => toEntry(name, cmd))
    .toSorted((a, b) => a.name.localeCompare(b.name));

export const buildManifest = (registry: Readonly<Record<string, Command>>, packageName: string, version: string, now: () => Date = () => new Date()): CommandManifest => ({
  package: packageName,
  version,
  generatedAt: now().toISOString(),
  commands: buildEntries(registry),
});

export const renderSingleCommand = (registry: Readonly<Record<string, Command>>, name: string): Result<string, DocsError> => {
  const cmd = registry[name];
  if (!cmd) return err({ type: 'unknown_command', name, available: Object.keys(registry).toSorted((a, b) => a.localeCompare(b)) });
  return ok(renderCommandMarkdown(toEntry(name, cmd)));
};
