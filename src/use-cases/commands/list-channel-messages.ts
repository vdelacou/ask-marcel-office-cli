import { z } from 'zod';
import { buildCommand } from './build-command.ts';
import type { CommandMeta } from './command-types.ts';

const schema = z.object({ teamId: z.string().min(1), channelId: z.string().min(1) });
const { execute } = buildCommand((p) => `/teams/${p.teamId}/channels/${p.channelId}/messages`, schema);

const meta: CommandMeta = {
  summary: 'List the root messages in a Microsoft Teams channel.',
  category: 'teams',
  graphMethod: 'GET',
  graphPathTemplate: '/teams/{team-id}/channels/{channel-id}/messages',
  graphDocsUrl: 'https://learn.microsoft.com/en-us/graph/api/channel-list-messages',
  options: [
    { name: 'team-id', key: 'teamId', required: true, description: 'Microsoft Teams team ID. Returned by `ask-marcel list-joined-teams`.' },
    { name: 'channel-id', key: 'channelId', required: true, description: 'Channel ID. Returned by `ask-marcel list-team-channels`.' },
  ],
  example: "ask-marcel list-channel-messages --team-id 'abc-1234-...' --channel-id '19:def@thread.tacv2'",
  responseShape: 'collection of Microsoft Graph `chatMessage` resources under `value[]`',
};

export { execute, meta, schema };
