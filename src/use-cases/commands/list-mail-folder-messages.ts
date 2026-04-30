import { z } from 'zod';
import { buildCommand } from './build-command.ts';
import type { CommandMeta } from './command-types.ts';

const schema = z.object({ mailFolderId: z.string().min(1) });
const { execute } = buildCommand((p) => `/me/mailFolders/${p.mailFolderId}/messages`, schema);

const meta: CommandMeta = {
  summary: 'List the messages inside a specific Outlook mail folder (Inbox, custom folder, etc.).',
  category: 'mail',
  graphMethod: 'GET',
  graphPathTemplate: '/me/mailFolders/{mail-folder-id}/messages',
  graphDocsUrl: 'https://learn.microsoft.com/en-us/graph/api/mailfolder-list-messages',
  options: [
    {
      name: 'mail-folder-id',
      key: 'mailFolderId',
      required: true,
      description: 'mailFolder ID. Returned by `ask-marcel list-mail-folders`. Well-known names also work, e.g. `inbox`, `sentitems`, `drafts`.',
    },
  ],
  example: "ask-marcel list-mail-folder-messages --mail-folder-id 'inbox'",
  responseShape: 'collection of Microsoft Graph `message` resources under `value[]`',
};

export { execute, meta, schema };
