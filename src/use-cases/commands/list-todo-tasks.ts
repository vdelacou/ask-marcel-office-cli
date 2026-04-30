import { z } from 'zod';
import { buildCommand } from './build-command.ts';
import type { CommandMeta } from './command-types.ts';

const schema = z.object({ todoTaskListId: z.string().min(1) });
const { execute } = buildCommand((p) => `/me/todo/lists/${p.todoTaskListId}/tasks`, schema);

const meta: CommandMeta = {
  summary: 'List the tasks in a single Microsoft To Do task list.',
  category: 'tasks',
  graphMethod: 'GET',
  graphPathTemplate: '/me/todo/lists/{todo-task-list-id}/tasks',
  graphDocsUrl: 'https://learn.microsoft.com/en-us/graph/api/todotasklist-list-tasks',
  options: [{ name: 'todo-task-list-id', key: 'todoTaskListId', required: true, description: 'To Do task list ID. Returned by `ask-marcel list-todo-task-lists`.' }],
  example: "ask-marcel list-todo-tasks --todo-task-list-id 'AAMkAGI...'",
  responseShape: 'collection of Microsoft Graph `todoTask` resources under `value[]`',
};

export { execute, meta, schema };
