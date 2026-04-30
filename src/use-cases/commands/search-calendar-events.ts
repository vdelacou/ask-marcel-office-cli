import { z } from 'zod';
import { buildCommand } from './build-command.ts';
import type { CommandMeta } from './command-types.ts';

const schema = z.object({ query: z.string().min(1) });
const { execute } = buildCommand((p) => `/me/events?$search="${p.query}"`, schema);

const meta: CommandMeta = {
  summary: 'Search the signed-in user’s calendar events using KQL or free text. Matches subject, body, and location.',
  category: 'calendar',
  graphMethod: 'GET',
  graphPathTemplate: '/me/events?$search="{query}"',
  graphDocsUrl: 'https://learn.microsoft.com/en-us/graph/api/user-list-events',
  options: [
    {
      name: 'query',
      key: 'query',
      required: true,
      description:
        'KQL or free-text query. Searches event subject, body, and location across every calendar of the signed-in user. ' +
        'Examples: `quarterly review`, `subject:1:1`, `location:Paris`.',
    },
  ],
  example: "ask-marcel search-calendar-events --query 'quarterly review'",
  responseShape: 'collection of Microsoft Graph `event` resources under `value[]`, ranked by relevance',
};

export { execute, meta, schema };
