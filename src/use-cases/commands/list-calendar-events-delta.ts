import { z } from 'zod';
import { buildCommand } from './build-command.ts';
import type { CommandMeta } from './command-types.ts';

const schema = z.object({}).strict();
const { execute } = buildCommand(() => '/me/events/delta()', schema);

const meta: CommandMeta = {
  summary:
    'Get the incremental change set (added / modified / deleted events) for the signed-in user’s default calendar. Use the `@odata.deltaLink` from a previous response to resume.',
  category: 'calendar',
  graphMethod: 'GET',
  graphPathTemplate: '/me/events/delta()',
  graphDocsUrl: 'https://learn.microsoft.com/en-us/graph/api/event-delta',
  options: [],
  example: 'ask-marcel list-calendar-events-delta',
  responseShape: 'collection of changed Microsoft Graph `event` resources under `value[]` plus an `@odata.deltaLink` token',
};

export { execute, meta, schema };
