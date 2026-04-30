import { z } from 'zod';
import { buildCommand } from './build-command.ts';
import type { CommandMeta } from './command-types.ts';

const schema = z.object({ mailFolderId: z.string().min(1) });
const { execute } = buildCommand((p) => `/me/mailFolders/${p.mailFolderId}/messageRules`, schema);

const meta: CommandMeta = {
  summary: 'List the inbox / folder rules attached to a single Outlook mail folder.',
  category: 'mail',
  graphMethod: 'GET',
  graphPathTemplate: '/me/mailFolders/{mail-folder-id}/messageRules',
  graphDocsUrl: 'https://learn.microsoft.com/en-us/graph/api/mailfolder-list-messagerules',
  options: [
    {
      name: 'mail-folder-id',
      key: 'mailFolderId',
      required: true,
      description: 'mailFolder ID. Returned by `ask-marcel list-mail-folders`. Well-known names also work, e.g. `inbox`.',
    },
  ],
  example: "ask-marcel list-mail-rules --mail-folder-id 'inbox'",
  responseShape: 'collection of Microsoft Graph `messageRule` resources under `value[]`',
};

export { execute, meta, schema };
