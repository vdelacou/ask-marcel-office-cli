import { z } from 'zod';
import { buildCommand } from './build-command.ts';
import type { CommandMeta } from './command-types.ts';

const schema = z.object({}).strict();
const { execute } = buildCommand(() => '/me/photo/$value', schema);

const meta: CommandMeta = {
  summary: 'Download the binary content of the signed-in user’s profile photo (largest available size).',
  category: 'user',
  graphMethod: 'GET',
  graphPathTemplate: '/me/photo/$value',
  graphDocsUrl: 'https://learn.microsoft.com/en-us/graph/api/profilephoto-get',
  options: [],
  example: 'ask-marcel get-my-profile-photo',
  responseShape: 'binary image bytes (typically image/jpeg)',
};

export { execute, meta, schema };
