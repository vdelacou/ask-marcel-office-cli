import type { EnvVar } from '../domain/env-var.ts';
import { envVar } from '../domain/env-var.ts';

export const getEnvOrThrow = (key: string): EnvVar => {
  const result = envVar(key, process.env[key]);
  if (!result.ok) throw new Error(`missing required env var: ${key}`);
  return result.value;
};
