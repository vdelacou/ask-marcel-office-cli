import { z } from 'zod';
import { buildCommand } from './build-command.ts';
import type { CommandMeta } from './command-types.ts';

const schema = z.object({ siteId: z.string().min(1), path: z.string().min(1) });
const { execute } = buildCommand((p) => `/sites/${p.siteId}/getByPath(path='${p.path}')`, schema);

const meta: CommandMeta = {
  summary: 'Resolve a SharePoint subsite by its server-relative path under a parent site (e.g. `/teams/marketing`).',
  category: 'sharepoint',
  graphMethod: 'GET',
  graphPathTemplate: "/sites/{site-id}/getByPath(path='{path}')",
  graphDocsUrl: 'https://learn.microsoft.com/en-us/graph/api/site-getbypath',
  options: [
    { name: 'site-id', key: 'siteId', required: true, description: 'Parent SharePoint site ID. Returned by `ask-marcel search-sharepoint-sites`, or the literal `root`.' },
    { name: 'path', key: 'path', required: true, description: 'Server-relative path of the subsite, including the leading slash (e.g. `/teams/marketing`).' },
  ],
  example: "ask-marcel get-sharepoint-site-by-path --site-id 'root' --path '/teams/marketing'",
  responseShape: 'single Microsoft Graph `site` resource',
};

export { execute, meta, schema };
