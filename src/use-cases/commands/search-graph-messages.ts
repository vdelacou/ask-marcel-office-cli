import { z } from 'zod';
import type { Result } from '../../domain/result.ts';
import type { GraphClient, GraphError } from '../../infra/graph-client.ts';
import type { CommandMeta } from './command-types.ts';

const schema = z.object({ query: z.string().min(1) });

const execute = async (graph: GraphClient, params: Record<string, string>): Promise<Result<unknown, GraphError>> => {
  const parsed = schema.safeParse(params);
  if (!parsed.success) throw new Error(`validation failed: ${parsed.error.message}`);
  return graph.post('/search/query', {
    requests: [{ entityTypes: ['chatMessage'], query: { queryString: parsed.data.query } }],
  });
};

const meta: CommandMeta = {
  summary: 'Search Microsoft Teams channel messages and 1:1 / group chat messages with a free-text or KQL query (Microsoft Search API).',
  category: 'teams',
  graphMethod: 'POST',
  graphPathTemplate: '/search/query',
  graphDocsUrl: 'https://learn.microsoft.com/en-us/graph/api/search-query',
  bodyTemplate: '{ "requests": [{ "entityTypes": ["chatMessage"], "query": { "queryString": "{query}" } }] }',
  options: [
    {
      name: 'query',
      key: 'query',
      required: true,
      description:
        'KQL or free-text query. Searches every Teams channel message and 1:1 / group chat message the signed-in user can read. ' +
        'Examples: `quarterly review`, `from:alice@contoso.com`, `subject:standup sent>=2026-01-01`.',
    },
  ],
  example: "ask-marcel search-graph-messages --query 'quarterly review'",
  responseShape: 'Microsoft Search response: `value[].hitsContainers[].hits[]` where each `hit.resource` is a `chatMessage` resource',
};

export { execute, meta, schema };
