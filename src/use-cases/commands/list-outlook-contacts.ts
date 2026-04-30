import { z } from 'zod';
import { buildCommand } from './build-command.ts';
import type { CommandMeta } from './command-types.ts';

const schema = z.object({}).strict();
const { execute } = buildCommand(() => '/me/contacts', schema);

const meta: CommandMeta = {
  summary: 'List the personal Outlook contacts in the signed-in user’s default contacts folder.',
  category: 'contacts',
  graphMethod: 'GET',
  graphPathTemplate: '/me/contacts',
  graphDocsUrl: 'https://learn.microsoft.com/en-us/graph/api/user-list-contacts',
  options: [],
  example: 'ask-marcel list-outlook-contacts',
  responseShape: 'collection of Microsoft Graph `contact` resources under `value[]`',
};

export { execute, meta, schema };
