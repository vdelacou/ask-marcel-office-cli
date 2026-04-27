import { z } from 'zod';
import { buildCommand } from './build-command.ts';

const schema = z.object({ onenoteSectionId: z.string().min(1) });
const { execute } = buildCommand((p) => `/me/onenote/sections/${p.onenoteSectionId}/pages`, schema);

export { execute, schema };
