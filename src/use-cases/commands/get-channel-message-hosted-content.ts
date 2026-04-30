import { z } from 'zod';
import { buildCommand } from './build-command.ts';
import type { CommandMeta } from './command-types.ts';

const schema = z.object({ teamId: z.string().min(1), channelId: z.string().min(1), chatMessageId: z.string().min(1), chatMessageHostedContentId: z.string().min(1) });
const { execute } = buildCommand((p) => `/teams/${p.teamId}/channels/${p.channelId}/messages/${p.chatMessageId}/hostedContents/${p.chatMessageHostedContentId}/$value`, schema);

const meta: CommandMeta = {
  summary: 'Download the binary bytes of a single inline hosted content (image, GIF, code-snippet) from a Microsoft Teams channel message.',
  category: 'teams',
  graphMethod: 'GET',
  graphPathTemplate: '/teams/{team-id}/channels/{channel-id}/messages/{chat-message-id}/hostedContents/{chat-message-hosted-content-id}/$value',
  graphDocsUrl: 'https://learn.microsoft.com/en-us/graph/api/chatmessagehostedcontent-get',
  options: [
    { name: 'team-id', key: 'teamId', required: true, description: 'Microsoft Teams team ID. Returned by `ask-marcel list-joined-teams`.' },
    { name: 'channel-id', key: 'channelId', required: true, description: 'Channel ID. Returned by `ask-marcel list-team-channels`.' },
    { name: 'chat-message-id', key: 'chatMessageId', required: true, description: 'chatMessage ID. Returned by `ask-marcel list-channel-messages`.' },
    {
      name: 'chat-message-hosted-content-id',
      key: 'chatMessageHostedContentId',
      required: true,
      description: 'Hosted-content ID. Returned by `ask-marcel list-channel-message-hosted-contents`.',
    },
  ],
  example:
    "ask-marcel get-channel-message-hosted-content --team-id 'abc-1234-...' --channel-id '19:def@thread.tacv2' --chat-message-id '1734567890123' --chat-message-hosted-content-id 'aWQ9...'",
  responseShape: 'binary content (image / GIF / file bytes)',
};

export { execute, meta, schema };
