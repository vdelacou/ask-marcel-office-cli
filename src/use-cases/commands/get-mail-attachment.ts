import { z } from 'zod';
import { buildCommand } from './build-command.ts';
import type { CommandMeta } from './command-types.ts';

const schema = z.object({ messageId: z.string().min(1), attachmentId: z.string().min(1) });
const { execute } = buildCommand((p) => `/me/messages/${p.messageId}/attachments/${p.attachmentId}`, schema);

const meta: CommandMeta = {
  summary: 'Get a single attachment on an Outlook message (metadata, plus the base64 `contentBytes` for file attachments).',
  category: 'mail',
  graphMethod: 'GET',
  graphPathTemplate: '/me/messages/{message-id}/attachments/{attachment-id}',
  graphDocsUrl: 'https://learn.microsoft.com/en-us/graph/api/attachment-get',
  options: [
    { name: 'message-id', key: 'messageId', required: true, description: 'Outlook message ID. Returned by `ask-marcel list-mail-messages`.' },
    { name: 'attachment-id', key: 'attachmentId', required: true, description: 'Attachment ID. Returned by `ask-marcel list-mail-attachments`.' },
  ],
  example: "ask-marcel get-mail-attachment --message-id 'AAMkAGI2...' --attachment-id 'AAMkABC...'",
  responseShape: 'single Microsoft Graph `attachment` resource',
};

export { execute, meta, schema };
