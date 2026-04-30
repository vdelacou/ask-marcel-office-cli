import { z } from 'zod';
import { buildCommand } from './build-command.ts';
import type { CommandMeta } from './command-types.ts';

const schema = z.object({ teamId: z.string().min(1) });
const { execute } = buildCommand((p) => `/teams/${p.teamId}/channels`, schema);

const meta: CommandMeta = {
  summary: 'List the channels (standard, private, shared) inside a single Microsoft Team.',
  category: 'teams',
  graphMethod: 'GET',
  graphPathTemplate: '/teams/{team-id}/channels',
  graphDocsUrl: 'https://learn.microsoft.com/en-us/graph/api/channel-list',
  options: [{ name: 'team-id', key: 'teamId', required: true, description: 'Microsoft Teams team ID. Returned by `ask-marcel list-joined-teams`.' }],
  example: "ask-marcel list-team-channels --team-id 'abc-1234-...'",
  responseShape: 'collection of Microsoft Graph `channel` resources under `value[]`',
};

export { execute, meta, schema };
