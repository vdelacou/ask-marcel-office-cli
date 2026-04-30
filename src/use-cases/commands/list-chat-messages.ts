import { z } from 'zod';
import { buildCommand } from './build-command.ts';
import type { CommandMeta } from './command-types.ts';

const schema = z.object({ chatId: z.string().min(1) });
const { execute } = buildCommand((p) => `/chats/${p.chatId}/messages`, schema);

const meta: CommandMeta = {
  summary: 'List the messages in a single Microsoft Teams chat thread (1:1, group, or meeting chat).',
  category: 'chats',
  graphMethod: 'GET',
  graphPathTemplate: '/chats/{chat-id}/messages',
  graphDocsUrl: 'https://learn.microsoft.com/en-us/graph/api/chat-list-messages',
  options: [
    {
      name: 'chat-id',
      key: 'chatId',
      required: true,
      description: 'Microsoft Teams chat thread ID. Returned by `ask-marcel list-chats` in the `id` field of each chat.',
    },
  ],
  example: "ask-marcel list-chat-messages --chat-id '19:abc...@thread.v2'",
  responseShape: 'collection of Microsoft Graph `chatMessage` resources under `value[]`',
};

export { execute, meta, schema };
