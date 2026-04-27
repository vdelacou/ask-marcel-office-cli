import { z } from 'zod';
import { buildCommand } from './build-command.ts';

const schema = z.object({ siteId: z.string().min(1), driveId: z.string().min(1) });
const { execute } = buildCommand((p) => `/sites/${p.siteId}/drives/${p.driveId}`, schema);

export { execute, schema };
