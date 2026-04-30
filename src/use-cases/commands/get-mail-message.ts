import { z } from 'zod';
import { buildCommand } from './build-command.ts';
import type { CommandMeta } from './command-types.ts';

const schema = z.object({ messageId: z.string().min(1) });
const { execute } = buildCommand((p) => `/me/messages/${p.messageId}`, schema);

const meta: CommandMeta = {
  summary: 'Get a single Outlook message by ID, including subject, sender, body, and flags.',
  category: 'mail',
  graphMethod: 'GET',
  graphPathTemplate: '/me/messages/{message-id}',
  graphDocsUrl: 'https://learn.microsoft.com/en-us/graph/api/message-get',
  options: [
    { name: 'message-id', key: 'messageId', required: true, description: 'Outlook message ID. Returned by `ask-marcel list-mail-messages` or `list-mail-folder-messages`.' },
  ],
  example: "ask-marcel get-mail-message --message-id 'AAMkAGI2...'",
  responseShape: 'single Microsoft Graph `message` resource',
};

export { execute, meta, schema };
