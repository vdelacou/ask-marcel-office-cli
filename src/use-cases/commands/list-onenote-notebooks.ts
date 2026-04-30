import { z } from 'zod';
import { buildCommand } from './build-command.ts';
import type { CommandMeta } from './command-types.ts';

const schema = z.object({}).strict();
const { execute } = buildCommand(() => '/me/onenote/notebooks', schema);

const meta: CommandMeta = {
  summary: 'List the OneNote notebooks the signed-in user owns or has access to (sorted by `createdDateTime` desc by Graph; soft-deleted notebooks excluded).',
  category: 'notes',
  graphMethod: 'GET',
  graphPathTemplate: '/me/onenote/notebooks',
  graphDocsUrl: 'https://learn.microsoft.com/en-us/graph/api/onenote-list-notebooks',
  options: [],
  example: 'ask-marcel list-onenote-notebooks',
  responseShape: 'collection of Microsoft Graph `notebook` resources under `value[]`',
};

export { execute, meta, schema };
