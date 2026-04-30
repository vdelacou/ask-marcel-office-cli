import { z } from 'zod';
import { buildCommand } from './build-command.ts';
import type { CommandMeta } from './command-types.ts';

const schema = z.object({ siteId: z.string().min(1) });
const { execute } = buildCommand((p) => `/sites/${p.siteId}/lists`, schema);

const meta: CommandMeta = {
  summary: 'List all SharePoint lists (custom + built-in document libraries) on a site.',
  category: 'sharepoint',
  graphMethod: 'GET',
  graphPathTemplate: '/sites/{site-id}/lists',
  graphDocsUrl: 'https://learn.microsoft.com/en-us/graph/api/list-list',
  options: [{ name: 'site-id', key: 'siteId', required: true, description: 'SharePoint site ID. Returned by `ask-marcel search-sharepoint-sites`.' }],
  example: "ask-marcel list-sharepoint-site-lists --site-id 'contoso.sharepoint.com,1234,5678'",
  responseShape: 'collection of Microsoft Graph `list` resources under `value[]`',
};

export { execute, meta, schema };
