import { z } from 'zod';
import { buildCommand } from './build-command.ts';

const schema = z.object({ todoTaskListId: z.string().min(1) });
const { execute } = buildCommand((p) => `/me/todo/lists/${p.todoTaskListId}/tasks`, schema);

export { execute, schema };
