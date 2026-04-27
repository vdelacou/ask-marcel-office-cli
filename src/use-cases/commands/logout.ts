import { z } from 'zod';
import type { Result } from '../../domain/result.ts';
import type { AuthManager } from '../../infra/auth.ts';

const schema = z.object({}).strict();

const execute = async (auth: AuthManager): Promise<Result<void, import('../../infra/auth.ts').AuthError>> => auth.logout();

export { execute, schema };
