import { z } from 'zod';
import { buildCommand } from './build-command.ts';
import type { CommandMeta } from './command-types.ts';

const schema = z.object({
  driveId: z.string().min(1),
  itemId: z.string().min(1),
  versionId: z.string().min(1),
});
const { execute } = buildCommand((p) => `/drives/${p.driveId}/items/${p.itemId}/versions/${p.versionId}/content`, schema);

const meta: CommandMeta = {
  summary: 'Download (or follow the redirect to) the binary content of a specific historical version of a OneDrive / SharePoint file.',
  category: 'drive',
  graphMethod: 'GET',
  graphPathTemplate: '/drives/{drive-id}/items/{item-id}/versions/{version-id}/content',
  graphDocsUrl: 'https://learn.microsoft.com/en-us/graph/api/driveitemversion-get-content',
  options: [
    { name: 'drive-id', key: 'driveId', required: true, description: 'Microsoft Graph drive ID. Returned by `ask-marcel list-drives`.' },
    { name: 'item-id', key: 'itemId', required: true, description: 'driveItem ID of the file. Returned by `list-folder-files` or `search-onedrive-files`.' },
    {
      name: 'version-id',
      key: 'versionId',
      required: true,
      description: 'driveItemVersion ID. Returned by `ask-marcel list-drive-item-versions`. Use the `id` field of an entry under `value[]`.',
    },
  ],
  example: "ask-marcel download-drive-item-version-content --drive-id 'b!1234' --item-id '01ABC' --version-id '4.0'",
  responseShape: 'binary content of the historical version (or a 302 redirect to a pre-signed CDN URL)',
};

export { execute, meta, schema };
