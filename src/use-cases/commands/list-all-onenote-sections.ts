import { z } from 'zod';
import { buildCommand } from './build-command.ts';
import type { CommandMeta } from './command-types.ts';

const schema = z.object({}).strict();
const { execute } = buildCommand(() => '/me/onenote/sections', schema);

const meta: CommandMeta = {
  summary: 'List every OneNote section the signed-in user can see, across all notebooks.',
  category: 'notes',
  graphMethod: 'GET',
  graphPathTemplate: '/me/onenote/sections',
  graphDocsUrl: 'https://learn.microsoft.com/en-us/graph/api/onenote-list-sections',
  options: [],
  example: 'ask-marcel list-all-onenote-sections',
  responseShape: 'collection of Microsoft Graph `onenoteSection` resources under `value[]`',
};

export { execute, meta, schema };
