import { z } from 'zod';
import { buildCommand } from './build-command.ts';

const schema = z.object({}).strict();
const { execute } = buildCommand(() => '/sites', schema);

export { execute, schema };
