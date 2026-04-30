import { z } from 'zod';
import type { Result } from '../../domain/result.ts';
import type { GraphClient, GraphError } from '../../infra/graph-client.ts';
import type { CommandMeta } from './command-types.ts';

const schema = z.object({
  driveId: z.string().min(1),
  itemId: z.string().min(1),
  versionId: z.string().min(1),
});

const execute = async (graph: GraphClient, params: Record<string, string>): Promise<Result<unknown, GraphError>> => {
  const parsed = schema.safeParse(params);
  if (!parsed.success) throw new Error(`validation failed: ${parsed.error.message}`);
  return graph.getBinary(`/drives/${parsed.data.driveId}/items/${parsed.data.itemId}/versions/${parsed.data.versionId}/content`);
};

const meta: CommandMeta = {
  summary:
    'Download the binary content of a specific *non-current* historical version of a OneDrive / SharePoint file. Graph refuses to serve the current version through this endpoint with "You cannot get the content of the current version" — for the current version use `download-onedrive-file-content` instead. Same envelope as that command (302 → downloadUrl, or base64 bytes).',
  category: 'drive',
  graphMethod: 'GET',
  graphPathTemplate: '/drives/{drive-id}/items/{item-id}/versions/{version-id}/content',
  graphDocsUrl: 'https://learn.microsoft.com/en-us/graph/api/driveitemversion-get-content',
  options: [
    {
      name: 'drive-id',
      key: 'driveId',
      required: true,
      description:
        'Microsoft Graph drive ID. Use `ask-marcel list-drives` for the personal OneDrive, ' +
        'or `ask-marcel list-sharepoint-site-drives --site-id <id>` for a SharePoint document library.',
    },
    { name: 'item-id', key: 'itemId', required: true, description: 'driveItem ID of the file. Returned by `list-folder-files` or `search-onedrive-files`.' },
    {
      name: 'version-id',
      key: 'versionId',
      required: true,
      description:
        'driveItemVersion ID. Returned by `ask-marcel list-drive-item-versions`. Use the `id` field of an entry under `value[]`. ' +
        'Pick a non-current version — the first entry (e.g. `12.0`) is the live file and Graph rejects this endpoint for it; use `value[1]` or older.',
    },
  ],
  example: "ask-marcel download-drive-item-version-content --drive-id 'b!1234' --item-id '01ABC' --version-id '4.0'",
  responseShape: '`{ "@microsoft.graph.downloadUrl": "..." }` for the typical 302 case, or `{ contentType, size, base64 }` when Graph streams bytes directly',
};

export { execute, meta, schema };
