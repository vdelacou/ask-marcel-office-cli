import { z } from 'zod';
import { buildCommand } from './build-command.ts';

const schema = z.object({ eventId: z.string().min(1) });
const { execute } = buildCommand((p) => `/me/events/${p.eventId}`, schema);

export { execute, schema };
