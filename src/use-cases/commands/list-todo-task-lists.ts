import { z } from 'zod';
import { buildCommand } from './build-command.ts';
import type { CommandMeta } from './command-types.ts';

const schema = z.object({}).strict();
const { execute } = buildCommand(() => '/me/todo/lists', schema);

const meta: CommandMeta = {
  summary: 'List the signed-in user’s Microsoft To Do task lists (e.g. `Tasks`, `Flagged Emails`, custom lists).',
  category: 'tasks',
  graphMethod: 'GET',
  graphPathTemplate: '/me/todo/lists',
  graphDocsUrl: 'https://learn.microsoft.com/en-us/graph/api/todo-list-lists',
  options: [],
  example: 'ask-marcel list-todo-task-lists',
  responseShape: 'collection of Microsoft Graph `todoTaskList` resources under `value[]`',
};

export { execute, meta, schema };
