import { z } from 'zod';
import { buildCommand } from './build-command.ts';

const schema = z.object({ notebookId: z.string().min(1) });
const { execute } = buildCommand((p) => `/me/onenote/notebooks/${p.notebookId}/sections`, schema);

export { execute, schema };
