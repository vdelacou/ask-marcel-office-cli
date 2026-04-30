import { z } from 'zod';
import { buildCommand } from './build-command.ts';
import type { CommandMeta } from './command-types.ts';

const schema = z.object({ siteId: z.string().min(1) });
const { execute } = buildCommand((p) => `/sites/${p.siteId}/drives`, schema);

const meta: CommandMeta = {
  summary: 'List the document libraries (drives) attached to a SharePoint site.',
  category: 'sharepoint',
  graphMethod: 'GET',
  graphPathTemplate: '/sites/{site-id}/drives',
  graphDocsUrl: 'https://learn.microsoft.com/en-us/graph/api/drive-list',
  options: [{ name: 'site-id', key: 'siteId', required: true, description: 'SharePoint site ID. Returned by `ask-marcel search-sharepoint-sites`.' }],
  example: "ask-marcel list-sharepoint-site-drives --site-id 'contoso.sharepoint.com,1234,5678'",
  responseShape: 'collection of Microsoft Graph `drive` resources under `value[]`',
};

export { execute, meta, schema };
