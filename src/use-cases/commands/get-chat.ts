import { z } from 'zod';
import { buildCommand } from './build-command.ts';
import type { CommandMeta } from './command-types.ts';

const schema = z.object({ chatId: z.string().min(1) });
const { execute } = buildCommand((p) => `/chats/${p.chatId}`, schema);

const meta: CommandMeta = {
  summary: 'Get the metadata of a single Microsoft Teams chat (topic, type, members count, last update).',
  category: 'chats',
  graphMethod: 'GET',
  graphPathTemplate: '/chats/{chat-id}',
  graphDocsUrl: 'https://learn.microsoft.com/en-us/graph/api/chat-get',
  options: [{ name: 'chat-id', key: 'chatId', required: true, description: 'Microsoft Teams chat ID. Returned by `ask-marcel list-chats`.' }],
  example: "ask-marcel get-chat --chat-id '19:abc...@thread.v2'",
  responseShape: 'single Microsoft Graph `chat` resource',
};

export { execute, meta, schema };
