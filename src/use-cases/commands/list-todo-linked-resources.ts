import { z } from 'zod';
import { buildCommand } from './build-command.ts';
import type { CommandMeta } from './command-types.ts';

const schema = z.object({ todoTaskListId: z.string().min(1), todoTaskId: z.string().min(1) });
const { execute } = buildCommand((p) => `/me/todo/lists/${p.todoTaskListId}/tasks/${p.todoTaskId}/linkedResources`, schema);

const meta: CommandMeta = {
  summary: 'List the linked resources (URLs, emails, files) attached to a Microsoft To Do task.',
  category: 'tasks',
  graphMethod: 'GET',
  graphPathTemplate: '/me/todo/lists/{todo-task-list-id}/tasks/{todo-task-id}/linkedResources',
  graphDocsUrl: 'https://learn.microsoft.com/en-us/graph/api/todotask-list-linkedresources',
  options: [
    { name: 'todo-task-list-id', key: 'todoTaskListId', required: true, description: 'To Do task list ID. Returned by `ask-marcel list-todo-task-lists`.' },
    { name: 'todo-task-id', key: 'todoTaskId', required: true, description: 'To Do task ID. Returned by `ask-marcel list-todo-tasks`.' },
  ],
  example: "ask-marcel list-todo-linked-resources --todo-task-list-id 'AAMkAGI...' --todo-task-id 'AAMkABC...'",
  responseShape: 'collection of Microsoft Graph `linkedResource` resources under `value[]`',
};

export { execute, meta, schema };
