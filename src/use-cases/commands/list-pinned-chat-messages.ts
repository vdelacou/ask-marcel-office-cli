import { z } from 'zod';
import { buildCommand } from './build-command.ts';
import type { CommandMeta } from './command-types.ts';

const schema = z.object({ chatId: z.string().min(1) });
const { execute } = buildCommand((p) => `/chats/${p.chatId}/pinnedMessages`, schema);

const meta: CommandMeta = {
  summary: 'List the pinned messages in a Microsoft Teams chat.',
  category: 'chats',
  graphMethod: 'GET',
  graphPathTemplate: '/chats/{chat-id}/pinnedMessages',
  graphDocsUrl: 'https://learn.microsoft.com/en-us/graph/api/chat-list-pinnedmessages',
  options: [{ name: 'chat-id', key: 'chatId', required: true, description: 'Microsoft Teams chat ID. Returned by `ask-marcel list-chats`.' }],
  example: "ask-marcel list-pinned-chat-messages --chat-id '19:abc...@thread.v2'",
  responseShape: 'collection of Microsoft Graph `pinnedChatMessageInfo` resources under `value[]`',
};

export { execute, meta, schema };
