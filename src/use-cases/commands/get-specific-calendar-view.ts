import { z } from 'zod';
import { buildCommand } from './build-command.ts';
import type { CommandMeta } from './command-types.ts';

const schema = z.object({ calendarId: z.string().min(1) });
const { execute } = buildCommand((p) => `/me/calendars/${p.calendarId}/calendarView`, schema);

const meta: CommandMeta = {
  summary: 'List the events in a specific (non-default) calendar with recurrence expanded into individual occurrences.',
  category: 'calendar',
  graphMethod: 'GET',
  graphPathTemplate: '/me/calendars/{calendar-id}/calendarView',
  graphDocsUrl: 'https://learn.microsoft.com/en-us/graph/api/calendar-list-calendarview',
  options: [{ name: 'calendar-id', key: 'calendarId', required: true, description: 'Calendar ID. Returned by `ask-marcel list-calendars`.' }],
  example: "ask-marcel get-specific-calendar-view --calendar-id 'AAMkAGI2THVS...'",
  responseShape: 'collection of Microsoft Graph `event` resources (single occurrences) under `value[]`',
};

export { execute, meta, schema };
