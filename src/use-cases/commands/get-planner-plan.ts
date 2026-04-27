import { z } from 'zod';
import { buildCommand } from './build-command.ts';

const schema = z.object({ plannerPlanId: z.string().min(1) });
const { execute } = buildCommand((p) => `/planner/plans/${p.plannerPlanId}`, schema);

export { execute, schema };
