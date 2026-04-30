import { z } from 'zod';
import { buildCommand } from './build-command.ts';
import type { CommandMeta } from './command-types.ts';

const schema = z.object({}).strict();
const { execute } = buildCommand(() => '/me/planner/tasks', schema);

const meta: CommandMeta = {
  summary: 'List every Microsoft Planner task assigned to or owned by the signed-in user, across all plans.',
  category: 'tasks',
  graphMethod: 'GET',
  graphPathTemplate: '/me/planner/tasks',
  graphDocsUrl: 'https://learn.microsoft.com/en-us/graph/api/planneruser-list-tasks',
  options: [],
  example: 'ask-marcel list-planner-tasks',
  responseShape: 'collection of Microsoft Graph `plannerTask` resources under `value[]`',
};

export { execute, meta, schema };
