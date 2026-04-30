import { z } from 'zod';
import { buildCommand } from './build-command.ts';
import type { CommandMeta } from './command-types.ts';

const schema = z.object({}).strict();
const { execute } = buildCommand(() => '/me/calendarView/delta()', schema);

const meta: CommandMeta = {
  summary:
    'Get the incremental change set of expanded calendar-view occurrences over a date range. Pass `?startDateTime=…&endDateTime=…` via the URL on the first call (not yet exposed as a CLI flag).',
  category: 'calendar',
  graphMethod: 'GET',
  graphPathTemplate: '/me/calendarView/delta()',
  graphDocsUrl: 'https://learn.microsoft.com/en-us/graph/api/event-delta',
  options: [],
  example: 'ask-marcel list-calendar-view-delta',
  responseShape: 'collection of changed Microsoft Graph `event` occurrences under `value[]` plus an `@odata.deltaLink` token',
};

export { execute, meta, schema };
