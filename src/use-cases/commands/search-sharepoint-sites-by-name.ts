import { z } from 'zod';
import { buildCommand } from './build-command.ts';
import type { CommandMeta } from './command-types.ts';

const schema = z.object({ query: z.string().min(1) });
const { execute } = buildCommand((p) => `/sites?search=${p.query}`, schema);

const meta: CommandMeta = {
  summary: 'Search the tenant for SharePoint sites whose display name or description matches a free-text query (returns up to 25).',
  category: 'sharepoint',
  graphMethod: 'GET',
  graphPathTemplate: '/sites?search={query}',
  graphDocsUrl: 'https://learn.microsoft.com/en-us/graph/api/site-search',
  options: [
    {
      name: 'query',
      key: 'query',
      required: true,
      description:
        'Free-text query. Matches site display name and description across the tenant. ' +
        'Use `search-sharepoint-sites` (no query) to instead list the sites the signed-in user follows.',
    },
  ],
  example: "ask-marcel search-sharepoint-sites-by-name --query 'marketing'",
  responseShape: 'collection of Microsoft Graph `site` resources under `value[]` (up to 25)',
};

export { execute, meta, schema };
