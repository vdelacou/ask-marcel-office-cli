import { z } from 'zod';
import { buildCommand } from './build-command.ts';

const schema = z.object({ driveId: z.string().min(1), itemId: z.string().min(1), worksheetId: z.string().min(1), address: z.string().min(1) });
const { execute } = buildCommand((p) => `/drives/${p.driveId}/items/${p.itemId}/workbook/worksheets/${p.worksheetId}/range(address='${p.address}')`, schema);

export { execute, schema };
