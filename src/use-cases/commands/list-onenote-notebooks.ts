import { z } from 'zod';
import { buildCommand } from './build-command.ts';

const schema = z.object({}).strict();
const { execute } = buildCommand(() => '/me/onenote/notebooks', schema);

export { execute, schema };
