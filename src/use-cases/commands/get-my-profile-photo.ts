import { z } from 'zod';
import type { Result } from '../../domain/result.ts';
import type { GraphClient, GraphError } from '../../infra/graph-client.ts';
import type { CommandMeta } from './command-types.ts';

const schema = z.object({}).strict();

const execute = async (graph: GraphClient, params: Record<string, string>): Promise<Result<unknown, GraphError>> => {
  const parsed = schema.safeParse(params);
  if (!parsed.success) throw new Error(`validation failed: ${parsed.error.message}`);
  return graph.getBinary('/me/photo/$value');
};

const meta: CommandMeta = {
  summary: 'Download the signed-in user’s profile photo (largest available size). Returned as a base64 envelope so the binary survives JSON output.',
  category: 'user',
  graphMethod: 'GET',
  graphPathTemplate: '/me/photo/$value',
  graphDocsUrl: 'https://learn.microsoft.com/en-us/graph/api/profilephoto-get',
  options: [],
  example: 'ask-marcel get-my-profile-photo',
  responseShape:
    '`{ contentType: "image/jpeg", size: <bytes>, base64: "<encoded>" }` (or `{ "@microsoft.graph.downloadUrl": "..." }` when Graph returns a 302 redirect to a CDN URL)',
};

export { execute, meta, schema };
