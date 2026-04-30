import { z } from 'zod';
import { buildCommand } from './build-command.ts';
import type { CommandMeta } from './command-types.ts';

const schema = z.object({}).strict();
const { execute } = buildCommand(() => '/me/calendarView', schema);

const meta: CommandMeta = {
  summary:
    'List the calendar events in the signed-in user’s default calendar with recurrence expanded into individual occurrences. Pass `?startDateTime=…&endDateTime=…` via the URL to filter (not yet exposed as a CLI flag).',
  category: 'calendar',
  graphMethod: 'GET',
  graphPathTemplate: '/me/calendarView',
  graphDocsUrl: 'https://learn.microsoft.com/en-us/graph/api/user-list-calendarview',
  options: [],
  example: 'ask-marcel get-calendar-view',
  responseShape: 'collection of Microsoft Graph `event` resources (single occurrences) under `value[]`',
};

export { execute, meta, schema };
