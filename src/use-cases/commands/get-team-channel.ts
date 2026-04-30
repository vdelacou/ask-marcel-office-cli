import { z } from 'zod';
import { buildCommand } from './build-command.ts';
import type { CommandMeta } from './command-types.ts';

const schema = z.object({ teamId: z.string().min(1), channelId: z.string().min(1) });
const { execute } = buildCommand((p) => `/teams/${p.teamId}/channels/${p.channelId}`, schema);

const meta: CommandMeta = {
  summary: 'Get the metadata of a single channel inside a Microsoft Team.',
  category: 'teams',
  graphMethod: 'GET',
  graphPathTemplate: '/teams/{team-id}/channels/{channel-id}',
  graphDocsUrl: 'https://learn.microsoft.com/en-us/graph/api/channel-get',
  options: [
    { name: 'team-id', key: 'teamId', required: true, description: 'Microsoft Teams team ID. Returned by `ask-marcel list-joined-teams`.' },
    { name: 'channel-id', key: 'channelId', required: true, description: 'Channel ID. Returned by `ask-marcel list-team-channels`.' },
  ],
  example: "ask-marcel get-team-channel --team-id 'abc-1234-...' --channel-id '19:def@thread.tacv2'",
  responseShape: 'single Microsoft Graph `channel` resource',
};

export { execute, meta, schema };
