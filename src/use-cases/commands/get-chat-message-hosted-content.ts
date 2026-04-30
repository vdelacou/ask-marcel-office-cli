import { z } from 'zod';
import { buildCommand } from './build-command.ts';
import type { CommandMeta } from './command-types.ts';

const schema = z.object({ chatId: z.string().min(1), chatMessageId: z.string().min(1), chatMessageHostedContentId: z.string().min(1) });
const { execute } = buildCommand((p) => `/chats/${p.chatId}/messages/${p.chatMessageId}/hostedContents/${p.chatMessageHostedContentId}/$value`, schema);

const meta: CommandMeta = {
  summary: 'Download the binary bytes of a single inline hosted content (image, GIF, code-snippet) from a Microsoft Teams chat message.',
  category: 'chats',
  graphMethod: 'GET',
  graphPathTemplate: '/chats/{chat-id}/messages/{chat-message-id}/hostedContents/{chat-message-hosted-content-id}/$value',
  graphDocsUrl: 'https://learn.microsoft.com/en-us/graph/api/chatmessagehostedcontent-get',
  options: [
    { name: 'chat-id', key: 'chatId', required: true, description: 'Microsoft Teams chat ID. Returned by `ask-marcel list-chats`.' },
    { name: 'chat-message-id', key: 'chatMessageId', required: true, description: 'chatMessage ID. Returned by `ask-marcel list-chat-messages`.' },
    {
      name: 'chat-message-hosted-content-id',
      key: 'chatMessageHostedContentId',
      required: true,
      description: 'Hosted-content ID. Returned by `ask-marcel list-chat-message-hosted-contents`.',
    },
  ],
  example: "ask-marcel get-chat-message-hosted-content --chat-id '19:abc...@thread.v2' --chat-message-id '1734567890123' --chat-message-hosted-content-id 'aWQ9...'",
  responseShape: 'binary content (image / GIF / file bytes)',
};

export { execute, meta, schema };
