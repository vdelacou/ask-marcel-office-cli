import { z } from 'zod';
import { buildCommand } from './build-command.ts';

const schema = z.object({ siteId: z.string().min(1), path: z.string().min(1) });
const { execute } = buildCommand((p) => `/sites/${p.siteId}/getByPath(path='${p.path}')`, schema);

export { execute, schema };
