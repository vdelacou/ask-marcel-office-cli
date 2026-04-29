#!/usr/bin/env bun
/*
 * Build post-step: prepend `#!/usr/bin/env node` to dist/cli.js and chmod 0o755
 * so that npm symlinks it as an executable global bin.
 *
 * Bun build does not insert shebangs, so this runs after `bun build`.
 */

import { chmodSync } from 'node:fs';

const TARGET = 'dist/cli.js';
const SHEBANG = '#!/usr/bin/env node\n';

const file = Bun.file(TARGET);
if (!(await file.exists())) {
  process.stderr.write(`add-shebang: ${TARGET} not found — did bun build run?\n`);
  process.exit(1);
}

const existing = await file.text();
if (existing.startsWith('#!')) {
  process.stderr.write(`add-shebang: ${TARGET} already has a shebang — leaving as-is\n`);
} else {
  await Bun.write(TARGET, SHEBANG + existing);
  process.stderr.write(`add-shebang: shebang prepended to ${TARGET}\n`);
}

chmodSync(TARGET, 0o755);
process.stderr.write(`add-shebang: ${TARGET} marked executable\n`);
