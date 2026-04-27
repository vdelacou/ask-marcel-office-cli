import { z } from 'zod';
import { buildCommand } from './build-command.ts';

const schema = z.object({ messageId: z.string().min(1) });
const { execute } = buildCommand((p) => `/me/messages/${p.messageId}`, schema);

export { execute, schema };
