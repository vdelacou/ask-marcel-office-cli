import { z } from 'zod';
import { buildCommand } from './build-command.ts';
import type { CommandMeta } from './command-types.ts';

const schema = z.object({}).strict();
const { execute } = buildCommand(() => '/me/joinedTeams', schema);

const meta: CommandMeta = {
  summary: 'List the Microsoft Teams the signed-in user is a member of.',
  category: 'teams',
  graphMethod: 'GET',
  graphPathTemplate: '/me/joinedTeams',
  graphDocsUrl: 'https://learn.microsoft.com/en-us/graph/api/user-list-joinedteams',
  options: [],
  example: 'ask-marcel list-joined-teams',
  responseShape: 'collection of Microsoft Graph `team` resources under `value[]`',
};

export { execute, meta, schema };
