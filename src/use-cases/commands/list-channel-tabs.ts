import { z } from 'zod';
import { buildCommand } from './build-command.ts';

const schema = z.object({ teamId: z.string().min(1), channelId: z.string().min(1) });
const { execute } = buildCommand((p) => `/teams/${p.teamId}/channels/${p.channelId}/tabs`, schema);

export { execute, schema };
