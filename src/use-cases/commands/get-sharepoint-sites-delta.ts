import { z } from 'zod';
import { buildCommand } from './build-command.ts';
import type { CommandMeta } from './command-types.ts';

const schema = z.object({}).strict();
const { execute } = buildCommand(() => '/sites/delta()', schema);

const meta: CommandMeta = {
  summary: 'Get the incremental change set of SharePoint sites in the tenant. Use the `@odata.deltaLink` from a previous response to resume.',
  category: 'sharepoint',
  graphMethod: 'GET',
  graphPathTemplate: '/sites/delta()',
  graphDocsUrl: 'https://learn.microsoft.com/en-us/graph/api/site-delta',
  options: [],
  example: 'ask-marcel get-sharepoint-sites-delta',
  responseShape: 'collection of changed Microsoft Graph `site` resources under `value[]` plus an `@odata.deltaLink` token',
};

export { execute, meta, schema };
