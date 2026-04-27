import { z } from 'zod';
import { buildCommand } from './build-command.ts';

const schema = z.object({ siteId: z.string().min(1), listId: z.string().min(1) });
const { execute } = buildCommand((p) => `/sites/${p.siteId}/lists/${p.listId}`, schema);

export { execute, schema };
