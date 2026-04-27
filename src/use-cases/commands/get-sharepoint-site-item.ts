import { z } from 'zod';
import { buildCommand } from './build-command.ts';

const schema = z.object({ siteId: z.string().min(1), baseItemId: z.string().min(1) });
const { execute } = buildCommand((p) => `/sites/${p.siteId}/items/${p.baseItemId}`, schema);

export { execute, schema };
