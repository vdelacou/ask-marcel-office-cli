import { z } from 'zod';
import type { Result } from '../../domain/result.ts';
import type { GraphClient } from '../../infra/graph-client.ts';

const schema = z.object({ driveId: z.string().min(1), query: z.string().min(1) });

const execute = async (graph: GraphClient, params: Record<string, string>): Promise<Result<unknown, import('../../infra/graph-client.ts').GraphError>> => {
  const parsed = schema.safeParse(params);
  if (!parsed.success) throw new Error(`validation failed: ${parsed.error.message}`);
  return graph.get(`/drives/${parsed.data.driveId}/search(q='${parsed.data.query}')`);
};

export { execute, schema };
