import { z } from 'zod';
import { buildCommand } from './build-command.ts';

const schema = z.object({}).strict();
const { execute } = buildCommand(() => '/me/planner/tasks', schema);

export { execute, schema };
