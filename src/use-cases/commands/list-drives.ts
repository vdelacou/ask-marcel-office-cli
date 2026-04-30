import { z } from 'zod';
import { buildCommand } from './build-command.ts';
import type { CommandMeta } from './command-types.ts';

const schema = z.object({}).strict();
const { execute } = buildCommand(() => '/me/drives', schema);

const meta: CommandMeta = {
  summary: 'List all OneDrive / SharePoint drives the signed-in user has access to.',
  category: 'drive',
  graphMethod: 'GET',
  graphPathTemplate: '/me/drives',
  graphDocsUrl: 'https://learn.microsoft.com/en-us/graph/api/drive-list',
  options: [],
  example: 'ask-marcel list-drives',
  responseShape: 'collection of Microsoft Graph `drive` resources under `value[]`',
};

export { execute, meta, schema };
