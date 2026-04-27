import { z } from 'zod';
import { buildCommand } from './build-command.ts';

const schema = z.object({ driveId: z.string().min(1), itemId: z.string().min(1), tableId: z.string().min(1) });
const { execute } = buildCommand((p) => `/drives/${p.driveId}/items/${p.itemId}/workbook/tables/${p.tableId}`, schema);

export { execute, schema };
