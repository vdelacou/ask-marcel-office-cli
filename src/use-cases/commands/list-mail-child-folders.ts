import { z } from 'zod';
import { buildCommand } from './build-command.ts';

const schema = z.object({ mailFolderId: z.string().min(1) });
const { execute } = buildCommand((p) => `/me/mailFolders/${p.mailFolderId}/childFolders`, schema);

export { execute, schema };
