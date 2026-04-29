import { formatError } from '../domain/utilities/format-error.ts';
import { err, ok } from '../domain/result.ts';
import type { FileSystem } from '../use-cases/ports/filesystem.ts';

export const createBunFileSystem = (): FileSystem => ({
  readJson: async <T>(path: string) => {
    const file = Bun.file(path);
    if (!(await file.exists())) return err({ type: 'not_found' });
    try {
      return ok((await file.json()) as T);
    } catch (e) {
      return err({ type: 'parse_failed', message: formatError(e) });
    }
  },
  writeText: async (path, content) => {
    try {
      await Bun.write(path, content);
      return ok(undefined);
    } catch (e) {
      return err({ type: 'io_failed', message: formatError(e) });
    }
  },
  deleteIfExists: async (path) => {
    const file = Bun.file(path);
    if (!(await file.exists())) return ok(undefined);
    try {
      await file.delete();
      return ok(undefined);
    } catch (e) {
      return err({ type: 'io_failed', message: formatError(e) });
    }
  },
});
