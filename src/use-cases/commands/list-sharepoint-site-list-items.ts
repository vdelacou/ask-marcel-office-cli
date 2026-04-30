import { z } from 'zod';
import { buildCommand } from './build-command.ts';
import type { CommandMeta } from './command-types.ts';

const schema = z.object({ siteId: z.string().min(1), listId: z.string().min(1) });
const { execute } = buildCommand((p) => `/sites/${p.siteId}/lists/${p.listId}/items`, schema);

const meta: CommandMeta = {
  summary: 'List the rows (listItem resources) of a single SharePoint list.',
  category: 'sharepoint',
  graphMethod: 'GET',
  graphPathTemplate: '/sites/{site-id}/lists/{list-id}/items',
  graphDocsUrl: 'https://learn.microsoft.com/en-us/graph/api/listitem-list',
  options: [
    { name: 'site-id', key: 'siteId', required: true, description: 'SharePoint site ID. Returned by `ask-marcel search-sharepoint-sites`.' },
    { name: 'list-id', key: 'listId', required: true, description: 'SharePoint list ID or display name. Returned by `ask-marcel list-sharepoint-site-lists`.' },
  ],
  example: "ask-marcel list-sharepoint-site-list-items --site-id 'contoso.sharepoint.com,1234,5678' --list-id 'Tasks'",
  responseShape: 'collection of Microsoft Graph `listItem` resources under `value[]`',
};

export { execute, meta, schema };
