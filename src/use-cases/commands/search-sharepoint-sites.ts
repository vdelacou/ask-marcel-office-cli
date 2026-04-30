import { z } from 'zod';
import { buildCommand } from './build-command.ts';
import type { CommandMeta } from './command-types.ts';

const schema = z.object({}).strict();
const { execute } = buildCommand(() => '/sites', schema);

const meta: CommandMeta = {
  summary: 'List the SharePoint sites the signed-in user has access to (returns the followed sites by default).',
  category: 'sharepoint',
  graphMethod: 'GET',
  graphPathTemplate: '/sites',
  graphDocsUrl: 'https://learn.microsoft.com/en-us/graph/api/site-search',
  options: [],
  example: 'ask-marcel search-sharepoint-sites',
  responseShape: 'collection of Microsoft Graph `site` resources under `value[]`',
};

export { execute, meta, schema };
