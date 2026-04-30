import { z } from 'zod';
import { buildCommand } from './build-command.ts';
import type { CommandMeta } from './command-types.ts';

const schema = z.object({ driveId: z.string().min(1) });
const { execute } = buildCommand((p) => `/drives/${p.driveId}/root`, schema);

const meta: CommandMeta = {
  summary: 'Get the root folder (driveItem) of a OneDrive / SharePoint drive.',
  category: 'drive',
  graphMethod: 'GET',
  graphPathTemplate: '/drives/{drive-id}/root',
  graphDocsUrl: 'https://learn.microsoft.com/en-us/graph/api/driveitem-get',
  options: [{ name: 'drive-id', key: 'driveId', required: true, description: 'Microsoft Graph drive ID. Returned by `ask-marcel list-drives` in the `id` field.' }],
  example: "ask-marcel get-drive-root-item --drive-id 'b!1234'",
  responseShape: 'single Microsoft Graph `driveItem` resource (the root folder)',
};

export { execute, meta, schema };
