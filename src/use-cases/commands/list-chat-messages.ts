import { z } from 'zod';
import { buildCommand } from './build-command.ts';

const schema = z.object({ chatId: z.string().min(1) });
const { execute } = buildCommand((p) => `/chats/${p.chatId}/messages`, schema);

export { execute, schema };
