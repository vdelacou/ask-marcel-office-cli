import { z } from 'zod';
import { buildCommand } from './build-command.ts';

const schema = z.object({ onenotePageId: z.string().min(1) });
const { execute } = buildCommand((p) => `/me/onenote/pages/${p.onenotePageId}/content`, schema);

export { execute, schema };
