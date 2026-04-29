import { err, ok } from '../domain/result.ts';
import type { FileSystem } from '../use-cases/ports/filesystem.ts';

export type FileSystemFake = FileSystem & {
  readonly seed: (path: string, content: string) => void;
  readonly snapshot: (path: string) => string | undefined;
  readonly has: (path: string) => boolean;
};

export const createFileSystemFake = (): FileSystemFake => {
  const store = new Map<string, string>();

  return {
    readJson: async <T>(path: string) => {
      const raw = store.get(path);
      if (raw === undefined) return err({ type: 'not_found' });
      try {
        return ok(JSON.parse(raw) as T);
      } catch (e) {
        return err({ type: 'parse_failed', message: e instanceof Error ? e.message : String(e) });
      }
    },
    writeText: async (path, content) => {
      store.set(path, content);
      return ok(undefined);
    },
    deleteIfExists: async (path) => {
      store.delete(path);
      return ok(undefined);
    },
    seed: (path, content) => {
      store.set(path, content);
    },
    snapshot: (path) => store.get(path),
    has: (path) => store.has(path),
  };
};
