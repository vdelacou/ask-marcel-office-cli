import { z } from 'zod';
import { buildCommand } from './build-command.ts';
import type { CommandMeta } from './command-types.ts';

const schema = z.object({}).strict();
const { execute } = buildCommand(() => '/me/messages', schema);

const meta: CommandMeta = {
  summary: 'List the most recent messages in the signed-in user’s default Outlook inbox (no filter).',
  category: 'mail',
  graphMethod: 'GET',
  graphPathTemplate: '/me/messages',
  graphDocsUrl: 'https://learn.microsoft.com/en-us/graph/api/user-list-messages',
  options: [],
  example: 'ask-marcel list-mail-messages',
  responseShape: 'collection of Microsoft Graph `message` resources under `value[]`',
};

export { execute, meta, schema };
