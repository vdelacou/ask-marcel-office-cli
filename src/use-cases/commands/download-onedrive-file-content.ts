import { z } from 'zod';
import type { Result } from '../../domain/result.ts';
import type { GraphClient } from '../../infra/graph-client.ts';
import type { CommandMeta } from './command-types.ts';

const schema = z.object({ driveId: z.string().min(1), itemId: z.string().min(1) });

const execute = async (graph: GraphClient, params: Record<string, string>): Promise<Result<unknown, import('../../infra/graph-client.ts').GraphError>> => {
  const parsed = schema.safeParse(params);
  if (!parsed.success) throw new Error(`validation failed: ${parsed.error.message}`);
  return graph.getBinary(`/drives/${parsed.data.driveId}/items/${parsed.data.itemId}/content`);
};

const meta: CommandMeta = {
  summary:
    'Download the binary content of a file stored in OneDrive / SharePoint. Graph normally returns a 302 redirect to a pre-signed CDN URL, surfaced as `@microsoft.graph.downloadUrl`; if it returns bytes directly they are base64-encoded for safe JSON output.',
  category: 'drive',
  graphMethod: 'GET',
  graphPathTemplate: '/drives/{drive-id}/items/{item-id}/content',
  graphDocsUrl: 'https://learn.microsoft.com/en-us/graph/api/driveitem-get-content',
  options: [
    { name: 'drive-id', key: 'driveId', required: true, description: 'Microsoft Graph drive ID. Returned by `ask-marcel list-drives`.' },
    { name: 'item-id', key: 'itemId', required: true, description: 'driveItem ID of the file to download. Returned by `ask-marcel list-folder-files` or `search-onedrive-files`.' },
  ],
  example: "ask-marcel download-onedrive-file-content --drive-id 'b!1234' --item-id '01ABC'",
  responseShape: '`{ "@microsoft.graph.downloadUrl": "..." }` for the typical 302 case, or `{ contentType, size, base64 }` when Graph streams bytes directly',
};

export { execute, meta, schema };
