import { z } from 'zod';
import { buildCommand } from './build-command.ts';
import type { CommandMeta } from './command-types.ts';

const schema = z.object({ teamId: z.string().min(1) });
const { execute } = buildCommand((p) => `/teams/${p.teamId}`, schema);

const meta: CommandMeta = {
  summary: 'Get the metadata of a single Microsoft Team (display name, settings, member-settings, owner group).',
  category: 'teams',
  graphMethod: 'GET',
  graphPathTemplate: '/teams/{team-id}',
  graphDocsUrl: 'https://learn.microsoft.com/en-us/graph/api/team-get',
  options: [{ name: 'team-id', key: 'teamId', required: true, description: 'Microsoft Teams team ID. Returned by `ask-marcel list-joined-teams`.' }],
  example: "ask-marcel get-team --team-id 'abc-1234-...'",
  responseShape: 'single Microsoft Graph `team` resource',
};

export { execute, meta, schema };
