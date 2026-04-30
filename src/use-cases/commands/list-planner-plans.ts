import { z } from 'zod';
import { buildCommand } from './build-command.ts';
import type { CommandMeta } from './command-types.ts';

const schema = z.object({}).strict();
const { execute } = buildCommand(() => '/me/planner/plans', schema);

const meta: CommandMeta = {
  summary:
    'List every Microsoft Planner plan the signed-in user has access to (across every group). Use this to discover plan IDs without needing an existing task as the entry point.',
  category: 'tasks',
  graphMethod: 'GET',
  graphPathTemplate: '/me/planner/plans',
  graphDocsUrl: 'https://learn.microsoft.com/en-us/graph/api/planneruser-list-plans',
  options: [],
  example: 'ask-marcel list-planner-plans',
  responseShape: 'collection of Microsoft Graph `plannerPlan` resources under `value[]`',
};

export { execute, meta, schema };
