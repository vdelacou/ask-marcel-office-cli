import { z } from 'zod';
import { buildCommand } from './build-command.ts';
import type { CommandMeta } from './command-types.ts';

const schema = z.object({}).strict();
const { execute } = buildCommand(() => '/me/chats', schema);

const meta: CommandMeta = {
  summary: 'List the Microsoft Teams chats (1:1, group, meeting) the signed-in user is a member of.',
  category: 'chats',
  graphMethod: 'GET',
  graphPathTemplate: '/me/chats',
  graphDocsUrl: 'https://learn.microsoft.com/en-us/graph/api/chat-list',
  options: [],
  example: 'ask-marcel list-chats',
  responseShape: 'collection of Microsoft Graph `chat` resources under `value[]`',
};

export { execute, meta, schema };
