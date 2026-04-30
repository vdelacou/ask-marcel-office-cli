#!/usr/bin/env bun
/*
 * Read the cached Microsoft Graph access token and print ONLY its `scp`
 * claim (space-separated Graph scopes). Never prints the token itself.
 *
 * Used to audit which commands the Teams web client token can actually
 * reach. See README "Quality gates" for context.
 */

import { homedir } from 'node:os';
import { join } from 'node:path';
import { decodeJwtPayload } from '../src/domain/jwt-utils.ts';

const cachePath = join(homedir(), '.ask-marcel', 'token-cache.json');

const file = Bun.file(cachePath);
if (!(await file.exists())) {
  process.stderr.write(`no token cache at ${cachePath}\n`);
  process.exit(1);
}

const cache = (await file.json()) as { access_token?: string };
if (!cache.access_token) {
  process.stderr.write('cache file has no access_token field\n');
  process.exit(1);
}

const payload = decodeJwtPayload(cache.access_token);
const scp = payload.scp;
if (typeof scp !== 'string') {
  process.stderr.write('payload has no `scp` claim or it is not a string\n');
  process.exit(1);
}

process.stdout.write(`${scp}\n`);
