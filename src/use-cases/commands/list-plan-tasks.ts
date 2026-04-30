import { z } from 'zod';
import { buildCommand } from './build-command.ts';
import type { CommandMeta } from './command-types.ts';

const schema = z.object({ plannerPlanId: z.string().min(1) });
const { execute } = buildCommand((p) => `/planner/plans/${p.plannerPlanId}/tasks`, schema);

const meta: CommandMeta = {
  summary:
    'List every task within a Microsoft Planner plan, regardless of completion status (Graph orders by `orderHint`). Use `list-incomplete-planner-tasks` for the across-plans incomplete view.',
  category: 'tasks',
  graphMethod: 'GET',
  graphPathTemplate: '/planner/plans/{planner-plan-id}/tasks',
  graphDocsUrl: 'https://learn.microsoft.com/en-us/graph/api/plannerplan-list-tasks',
  options: [
    {
      name: 'planner-plan-id',
      key: 'plannerPlanId',
      required: true,
      description: 'Planner plan ID. Returned in the `planId` field of any task from `ask-marcel list-planner-tasks`.',
    },
  ],
  example: "ask-marcel list-plan-tasks --planner-plan-id 'xqQg5FS2LkCp935s-FIFm5gAB6'",
  responseShape: 'collection of Microsoft Graph `plannerTask` resources under `value[]`',
};

export { execute, meta, schema };
