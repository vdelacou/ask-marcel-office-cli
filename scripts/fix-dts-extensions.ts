#!/usr/bin/env bun
/*
 * Build post-step: rewrite `.ts` import paths to `.js` inside emitted .d.ts
 * files.
 *
 * tsc's `rewriteRelativeImportExtensions: true` does not rewrite extensions
 * inside declaration emit (only inside JS emit, which we disable via
 * `emitDeclarationOnly: true`). This script walks `dist/` and replaces
 * trailing `.ts'` with `.js'` in every `.d.ts` file.
 */

import { readdir } from 'node:fs/promises';
import { join } from 'node:path';

const REWRITE = /(['"])(\.{1,2}\/[^'"]+?)\.ts\1/g;

const walk = async (dir: string): Promise<string[]> => {
  const out: string[] = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...(await walk(path)));
    } else if (entry.isFile() && path.endsWith('.d.ts')) {
      out.push(path);
    }
  }
  return out;
};

const files = await walk('dist');
let touched = 0;
for (const path of files) {
  const file = Bun.file(path);
  const text = await file.text();
  const next = text.replaceAll(REWRITE, "$1$2.js$1");
  if (next !== text) {
    await Bun.write(path, next);
    touched += 1;
  }
}
process.stderr.write(`fix-dts-extensions: rewrote .ts → .js in ${touched}/${files.length} declaration files\n`);
