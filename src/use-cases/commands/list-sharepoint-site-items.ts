import { z } from 'zod';
import { buildCommand } from './build-command.ts';
import type { CommandMeta } from './command-types.ts';

const schema = z.object({ siteId: z.string().min(1) });
const { execute } = buildCommand((p) => `/sites/${p.siteId}/items`, schema);

const meta: CommandMeta = {
  summary: 'List the baseItem resources directly under a SharePoint site (typically pages and root-level items).',
  category: 'sharepoint',
  graphMethod: 'GET',
  graphPathTemplate: '/sites/{site-id}/items',
  graphDocsUrl: 'https://learn.microsoft.com/en-us/graph/api/baseitem-list',
  options: [{ name: 'site-id', key: 'siteId', required: true, description: 'SharePoint site ID. Returned by `ask-marcel search-sharepoint-sites`.' }],
  example: "ask-marcel list-sharepoint-site-items --site-id 'contoso.sharepoint.com,1234,5678'",
  responseShape: 'collection of Microsoft Graph `baseItem` resources under `value[]`',
};

export { execute, meta, schema };
