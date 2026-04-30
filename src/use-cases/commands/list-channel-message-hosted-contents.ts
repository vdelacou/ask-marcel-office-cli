import { z } from 'zod';
import { buildCommand } from './build-command.ts';
import type { CommandMeta } from './command-types.ts';

const schema = z.object({ teamId: z.string().min(1), channelId: z.string().min(1), chatMessageId: z.string().min(1) });
const { execute } = buildCommand((p) => `/teams/${p.teamId}/channels/${p.channelId}/messages/${p.chatMessageId}/hostedContents`, schema);

const meta: CommandMeta = {
  summary: 'List the inline hosted contents (image, GIF, code-snippet) attached to a Microsoft Teams channel message.',
  category: 'teams',
  graphMethod: 'GET',
  graphPathTemplate: '/teams/{team-id}/channels/{channel-id}/messages/{chat-message-id}/hostedContents',
  graphDocsUrl: 'https://learn.microsoft.com/en-us/graph/api/chatmessage-list-hostedcontents',
  options: [
    { name: 'team-id', key: 'teamId', required: true, description: 'Microsoft Teams team ID. Returned by `ask-marcel list-joined-teams`.' },
    { name: 'channel-id', key: 'channelId', required: true, description: 'Channel ID. Returned by `ask-marcel list-team-channels`.' },
    { name: 'chat-message-id', key: 'chatMessageId', required: true, description: 'chatMessage ID. Returned by `ask-marcel list-channel-messages`.' },
  ],
  example: "ask-marcel list-channel-message-hosted-contents --team-id 'abc-1234-...' --channel-id '19:def@thread.tacv2' --chat-message-id '1734567890123'",
  responseShape: 'collection of Microsoft Graph `chatMessageHostedContent` resources under `value[]`',
};

export { execute, meta, schema };
