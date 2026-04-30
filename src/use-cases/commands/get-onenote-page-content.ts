import { z } from 'zod';
import type { Result } from '../../domain/result.ts';
import type { GraphClient, GraphError } from '../../infra/graph-client.ts';
import type { CommandMeta } from './command-types.ts';

const schema = z.object({ onenotePageId: z.string().min(1) });

const execute = async (graph: GraphClient, params: Record<string, string>): Promise<Result<unknown, GraphError>> => {
  const parsed = schema.safeParse(params);
  if (!parsed.success) throw new Error(`validation failed: ${parsed.error.message}`);
  return graph.getBinary(`/me/onenote/pages/${parsed.data.onenotePageId}/content`);
};

const meta: CommandMeta = {
  summary: 'Get the HTML body of a single OneNote page. Returned in a JSON envelope so the HTML survives transport.',
  category: 'notes',
  graphMethod: 'GET',
  graphPathTemplate: '/me/onenote/pages/{onenote-page-id}/content',
  graphDocsUrl: 'https://learn.microsoft.com/en-us/graph/api/page-get',
  options: [{ name: 'onenote-page-id', key: 'onenotePageId', required: true, description: 'OneNote page ID. Returned by `ask-marcel list-onenote-section-pages`.' }],
  example: "ask-marcel get-onenote-page-content --onenote-page-id '1-abc...'",
  responseShape: '`{ contentType: "text/html", size: <chars>, text: "<html>..." }` — the rendered OneNote page body wrapped in a JSON envelope',
};

export { execute, meta, schema };
