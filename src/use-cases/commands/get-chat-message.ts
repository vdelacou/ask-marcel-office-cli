import { z } from 'zod';
import { buildCommand } from './build-command.ts';
import type { CommandMeta } from './command-types.ts';

const schema = z.object({ chatId: z.string().min(1), chatMessageId: z.string().min(1) });
const { execute } = buildCommand((p) => `/chats/${p.chatId}/messages/${p.chatMessageId}`, schema);

const meta: CommandMeta = {
  summary: 'Get a single message in a Microsoft Teams chat by its ID.',
  category: 'chats',
  graphMethod: 'GET',
  graphPathTemplate: '/chats/{chat-id}/messages/{chat-message-id}',
  graphDocsUrl: 'https://learn.microsoft.com/en-us/graph/api/chatmessage-get',
  options: [
    { name: 'chat-id', key: 'chatId', required: true, description: 'Microsoft Teams chat ID. Returned by `ask-marcel list-chats`.' },
    { name: 'chat-message-id', key: 'chatMessageId', required: true, description: 'chatMessage ID. Returned by `ask-marcel list-chat-messages`.' },
  ],
  example: "ask-marcel get-chat-message --chat-id '19:abc...@thread.v2' --chat-message-id '1734567890123'",
  responseShape: 'single Microsoft Graph `chatMessage` resource',
};

export { execute, meta, schema };
