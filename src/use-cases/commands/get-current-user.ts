import { z } from 'zod';
import { buildCommand } from './build-command.ts';
import type { CommandMeta } from './command-types.ts';

const schema = z.object({}).strict();
const { execute } = buildCommand(() => '/me', schema);

const meta: CommandMeta = {
  summary: 'Return the signed-in user’s Microsoft Graph profile (id, displayName, mail, jobTitle, etc.).',
  category: 'user',
  graphMethod: 'GET',
  graphPathTemplate: '/me',
  graphDocsUrl: 'https://learn.microsoft.com/en-us/graph/api/user-get',
  options: [],
  example: 'ask-marcel get-current-user',
  responseShape: 'single Microsoft Graph `user` resource',
};

export { execute, meta, schema };
