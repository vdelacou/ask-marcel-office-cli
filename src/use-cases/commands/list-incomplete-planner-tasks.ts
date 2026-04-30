import { z } from 'zod';
import { buildCommand } from './build-command.ts';
import type { CommandMeta } from './command-types.ts';

const schema = z.object({}).strict();
const { execute } = buildCommand(() => '/me/planner/tasks?$filter=percentComplete ne 100', schema);

const meta: CommandMeta = {
  summary: 'List every incomplete Microsoft Planner task assigned to or owned by the signed-in user, across every plan.',
  category: 'tasks',
  graphMethod: 'GET',
  graphPathTemplate: '/me/planner/tasks?$filter=percentComplete ne 100',
  graphDocsUrl: 'https://learn.microsoft.com/en-us/graph/api/planneruser-list-tasks',
  options: [],
  example: 'ask-marcel list-incomplete-planner-tasks',
  responseShape: 'collection of Microsoft Graph `plannerTask` resources under `value[]` where `percentComplete < 100`',
};

export { execute, meta, schema };
