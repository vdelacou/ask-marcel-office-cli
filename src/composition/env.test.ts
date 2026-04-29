import { afterEach, describe, expect, it } from 'bun:test';
import { envVarUnsafe } from '../domain/env-var.ts';
import { getEnvOrThrow } from './env.ts';

const KEY = 'ATELIER_TEST_ENV_KEY_KbA9z';

afterEach(() => {
  delete process.env[KEY];
});

describe('getEnvOrThrow', () => {
  it('returns the value when the env var is set', () => {
    process.env[KEY] = 'present';
    expect(getEnvOrThrow(KEY)).toBe(envVarUnsafe('present'));
  });

  it('throws a clear error when the env var is missing', () => {
    delete process.env[KEY];
    expect(() => getEnvOrThrow(KEY)).toThrow(`missing required env var: ${KEY}`);
  });

  it('treats an empty string the same as missing', () => {
    process.env[KEY] = '';
    expect(() => getEnvOrThrow(KEY)).toThrow(`missing required env var: ${KEY}`);
  });
});
