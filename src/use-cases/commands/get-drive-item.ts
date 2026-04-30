import { z } from 'zod';
import { buildCommand } from './build-command.ts';
import type { CommandMeta } from './command-types.ts';

const schema = z.object({ driveId: z.string().min(1), itemId: z.string().min(1) });
const { execute } = buildCommand((p) => `/drives/${p.driveId}/items/${p.itemId}`, schema);

const meta: CommandMeta = {
  summary: 'Get the metadata (driveItem resource) of a single file or folder in OneDrive / SharePoint.',
  category: 'drive',
  graphMethod: 'GET',
  graphPathTemplate: '/drives/{drive-id}/items/{item-id}',
  graphDocsUrl: 'https://learn.microsoft.com/en-us/graph/api/driveitem-get',
  options: [
    { name: 'drive-id', key: 'driveId', required: true, description: 'Microsoft Graph drive ID. Returned by `ask-marcel list-drives`.' },
    { name: 'item-id', key: 'itemId', required: true, description: 'driveItem ID. Returned by `list-folder-files`, `search-onedrive-files`, or `get-drive-root-item`.' },
  ],
  example: "ask-marcel get-drive-item --drive-id 'b!1234' --item-id '01ABC'",
  responseShape: 'single Microsoft Graph `driveItem` resource',
};

export { execute, meta, schema };
