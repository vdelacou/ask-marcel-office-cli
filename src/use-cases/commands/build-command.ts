import type { z } from 'zod';
import type { Command } from './command-types.ts';

const buildCommand = (pathFn: (params: Record<string, string>) => string, schema: z.ZodType): Pick<Command, 'schema' | 'execute'> => {
  const execute: Command['execute'] = async (graph, params) => {
    const parsed = schema.safeParse(params);
    if (!parsed.success) throw new Error(`validation failed: ${parsed.error.message}`);
    const path = pathFn(parsed.data as Record<string, string>);
    return graph.get(path);
  };
  return { schema, execute };
};

export { buildCommand };
