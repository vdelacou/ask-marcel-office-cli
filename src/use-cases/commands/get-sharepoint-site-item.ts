import { z } from 'zod';
import { buildCommand } from './build-command.ts';
import type { CommandMeta } from './command-types.ts';

const schema = z.object({ siteId: z.string().min(1), baseItemId: z.string().min(1) });
const { execute } = buildCommand((p) => `/sites/${p.siteId}/items/${p.baseItemId}`, schema);

const meta: CommandMeta = {
  summary: 'Get a single baseItem (page, root-level item, etc.) on a SharePoint site by ID.',
  category: 'sharepoint',
  graphMethod: 'GET',
  graphPathTemplate: '/sites/{site-id}/items/{base-item-id}',
  graphDocsUrl: 'https://learn.microsoft.com/en-us/graph/api/baseitem-get',
  options: [
    { name: 'site-id', key: 'siteId', required: true, description: 'SharePoint site ID. Returned by `ask-marcel search-sharepoint-sites`.' },
    { name: 'base-item-id', key: 'baseItemId', required: true, description: 'baseItem ID on the site. Returned by `ask-marcel list-sharepoint-site-items`.' },
  ],
  example: "ask-marcel get-sharepoint-site-item --site-id 'contoso.sharepoint.com,1234,5678' --base-item-id '17'",
  responseShape: 'single Microsoft Graph `baseItem` resource',
};

export { execute, meta, schema };
