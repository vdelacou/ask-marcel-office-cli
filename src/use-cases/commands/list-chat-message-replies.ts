import { z } from 'zod';
import { buildCommand } from './build-command.ts';
import type { CommandMeta } from './command-types.ts';

const schema = z.object({ chatId: z.string().min(1), chatMessageId: z.string().min(1) });
const { execute } = buildCommand((p) => `/chats/${p.chatId}/messages/${p.chatMessageId}/replies`, schema);

const meta: CommandMeta = {
  summary: 'List the replies in a Microsoft Teams chat message thread.',
  category: 'chats',
  graphMethod: 'GET',
  graphPathTemplate: '/chats/{chat-id}/messages/{chat-message-id}/replies',
  graphDocsUrl: 'https://learn.microsoft.com/en-us/graph/api/chatmessage-list-replies',
  options: [
    { name: 'chat-id', key: 'chatId', required: true, description: 'Microsoft Teams chat ID. Returned by `ask-marcel list-chats`.' },
    { name: 'chat-message-id', key: 'chatMessageId', required: true, description: 'Root chatMessage ID. Returned by `ask-marcel list-chat-messages`.' },
  ],
  example: "ask-marcel list-chat-message-replies --chat-id '19:abc...@thread.v2' --chat-message-id '1734567890123'",
  responseShape: 'collection of Microsoft Graph `chatMessage` replies under `value[]`',
};

export { execute, meta, schema };
