import { z } from 'zod';
import { buildCommand } from './build-command.ts';

const schema = z.object({ plannerTaskId: z.string().min(1) });
const { execute } = buildCommand((p) => `/planner/tasks/${p.plannerTaskId}/details`, schema);

export { execute, schema };
