import { z } from 'zod';
import { buildCommand } from './build-command.ts';
import type { CommandMeta } from './command-types.ts';

const schema = z.object({ teamId: z.string().min(1), channelId: z.string().min(1) });
const { execute } = buildCommand((p) => `/teams/${p.teamId}/channels/${p.channelId}/filesFolder`, schema);

const meta: CommandMeta = {
  summary: 'Get the SharePoint files folder (driveItem) backing a Microsoft Teams channel’s `Files` tab.',
  category: 'teams',
  graphMethod: 'GET',
  graphPathTemplate: '/teams/{team-id}/channels/{channel-id}/filesFolder',
  graphDocsUrl: 'https://learn.microsoft.com/en-us/graph/api/channel-get-filesfolder',
  options: [
    { name: 'team-id', key: 'teamId', required: true, description: 'Microsoft Teams team ID. Returned by `ask-marcel list-joined-teams`.' },
    { name: 'channel-id', key: 'channelId', required: true, description: 'Channel ID. Returned by `ask-marcel list-team-channels`.' },
  ],
  example: "ask-marcel get-channel-files-folder --team-id 'abc-1234-...' --channel-id '19:def@thread.tacv2'",
  responseShape: 'single Microsoft Graph `driveItem` resource (the channel’s files folder)',
};

export { execute, meta, schema };
