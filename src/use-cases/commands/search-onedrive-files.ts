import { z } from 'zod';
import type { Result } from '../../domain/result.ts';
import type { GraphClient } from '../../infra/graph-client.ts';
import type { CommandMeta } from './command-types.ts';

const schema = z.object({ driveId: z.string().min(1), query: z.string().min(1) });

const execute = async (graph: GraphClient, params: Record<string, string>): Promise<Result<unknown, import('../../infra/graph-client.ts').GraphError>> => {
  const parsed = schema.safeParse(params);
  if (!parsed.success) throw new Error(`validation failed: ${parsed.error.message}`);
  return graph.get(`/drives/${parsed.data.driveId}/search(q='${parsed.data.query}')`);
};

const meta: CommandMeta = {
  summary: 'Search a single OneDrive / SharePoint drive for files and folders matching a free-text query.',
  category: 'drive',
  graphMethod: 'GET',
  graphPathTemplate: "/drives/{drive-id}/search(q='{query}')",
  graphDocsUrl: 'https://learn.microsoft.com/en-us/graph/api/driveitem-search',
  options: [
    { name: 'drive-id', key: 'driveId', required: true, description: 'Microsoft Graph drive ID to search inside. Returned by `ask-marcel list-drives`.' },
    { name: 'query', key: 'query', required: true, description: 'Free-text search query. Matches filename, content, and metadata.' },
  ],
  example: "ask-marcel search-onedrive-files --drive-id 'b!1234' --query 'q1 budget'",
  responseShape: 'collection of Microsoft Graph `driveItem` resources under `value[]`',
};

export { execute, meta, schema };
