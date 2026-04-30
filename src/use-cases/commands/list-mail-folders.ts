import { z } from 'zod';
import { buildCommand } from './build-command.ts';
import type { CommandMeta } from './command-types.ts';

const schema = z.object({}).strict();
const { execute } = buildCommand(() => '/me/mailFolders', schema);

const meta: CommandMeta = {
  summary: 'List the top-level mail folders in the signed-in user’s Outlook mailbox (Inbox, Sent Items, etc.).',
  category: 'mail',
  graphMethod: 'GET',
  graphPathTemplate: '/me/mailFolders',
  graphDocsUrl: 'https://learn.microsoft.com/en-us/graph/api/user-list-mailfolders',
  options: [],
  example: 'ask-marcel list-mail-folders',
  responseShape: 'collection of Microsoft Graph `mailFolder` resources under `value[]`',
};

export { execute, meta, schema };
