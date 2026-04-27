import { z } from 'zod';
import { buildCommand } from './build-command.ts';

const schema = z.object({ plannerBucketId: z.string().min(1) });
const { execute } = buildCommand((p) => `/planner/buckets/${p.plannerBucketId}`, schema);

export { execute, schema };
