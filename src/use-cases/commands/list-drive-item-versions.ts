import { z } from 'zod';
import { buildCommand } from './build-command.ts';
import type { CommandMeta } from './command-types.ts';

const schema = z.object({ driveId: z.string().min(1), itemId: z.string().min(1) });
const { execute } = buildCommand((p) => `/drives/${p.driveId}/items/${p.itemId}/versions`, schema);

const meta: CommandMeta = {
  summary: 'List the historical versions of a OneDrive / SharePoint file (each save creates a new version).',
  category: 'drive',
  graphMethod: 'GET',
  graphPathTemplate: '/drives/{drive-id}/items/{item-id}/versions',
  graphDocsUrl: 'https://learn.microsoft.com/en-us/graph/api/driveitem-list-versions',
  options: [
    { name: 'drive-id', key: 'driveId', required: true, description: 'Microsoft Graph drive ID. Returned by `ask-marcel list-drives`.' },
    { name: 'item-id', key: 'itemId', required: true, description: 'driveItem ID of the file. Returned by `list-folder-files` or `search-onedrive-files`.' },
  ],
  example: "ask-marcel list-drive-item-versions --drive-id 'b!1234' --item-id '01ABC'",
  responseShape: 'collection of Microsoft Graph `driveItemVersion` resources under `value[]`',
};

export { execute, meta, schema };
