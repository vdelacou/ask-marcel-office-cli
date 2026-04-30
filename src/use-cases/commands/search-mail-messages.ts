import { z } from 'zod';
import { buildCommand } from './build-command.ts';
import type { CommandMeta } from './command-types.ts';

const schema = z.object({ query: z.string().min(1) });
const { execute } = buildCommand((p) => `/me/messages?$search="${p.query}"`, schema);

const meta: CommandMeta = {
  summary: 'Search the signed-in user’s entire Outlook mailbox using KQL or free text. Results are ranked by Graph relevance.',
  category: 'mail',
  graphMethod: 'GET',
  graphPathTemplate: '/me/messages?$search="{query}"',
  graphDocsUrl: 'https://learn.microsoft.com/en-us/graph/api/user-list-messages',
  options: [
    {
      name: 'query',
      key: 'query',
      required: true,
      description:
        'KQL or free-text query. Searches subject, body, sender, and recipients. ' + 'Examples: `Q3 budget`, `from:alice@contoso.com`, `subject:invoice received>=2026-01-01`.',
    },
  ],
  example: "ask-marcel search-mail-messages --query 'from:alice subject:Q3'",
  responseShape: 'collection of Microsoft Graph `message` resources under `value[]`, ranked by relevance',
};

export { execute, meta, schema };
