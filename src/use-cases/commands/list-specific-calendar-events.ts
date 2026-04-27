import { z } from 'zod';
import { buildCommand } from './build-command.ts';

const schema = z.object({ calendarId: z.string().min(1) });
const { execute } = buildCommand((p) => `/me/calendars/${p.calendarId}/events`, schema);

export { execute, schema };
