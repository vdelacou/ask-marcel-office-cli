import { z } from 'zod';
import { buildCommand } from './build-command.ts';

const schema = z.object({ contactId: z.string().min(1) });
const { execute } = buildCommand((p) => `/me/contacts/${p.contactId}`, schema);

export { execute, schema };
