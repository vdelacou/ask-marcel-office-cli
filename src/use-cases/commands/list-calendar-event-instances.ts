import { z } from 'zod';
import { buildCommand } from './build-command.ts';
import type { CommandMeta } from './command-types.ts';

const schema = z.object({ calendarId: z.string().min(1), eventId: z.string().min(1) });
const { execute } = buildCommand((p) => `/me/calendars/${p.calendarId}/events/${p.eventId}/instances`, schema);

const meta: CommandMeta = {
  summary:
    'List the individual occurrences of a recurring calendar event over a date range. Pass `?startDateTime=…&endDateTime=…` via the URL to filter (not yet exposed as a CLI flag).',
  category: 'calendar',
  graphMethod: 'GET',
  graphPathTemplate: '/me/calendars/{calendar-id}/events/{event-id}/instances',
  graphDocsUrl: 'https://learn.microsoft.com/en-us/graph/api/event-list-instances',
  options: [
    { name: 'calendar-id', key: 'calendarId', required: true, description: 'Calendar ID. Returned by `ask-marcel list-calendars`.' },
    { name: 'event-id', key: 'eventId', required: true, description: 'Recurring event ID. Returned by `ask-marcel list-specific-calendar-events`.' },
  ],
  example: "ask-marcel list-calendar-event-instances --calendar-id 'AAMkAGI2THVS...' --event-id 'AAMkABC...'",
  responseShape: 'collection of Microsoft Graph `event` resources (single occurrences) under `value[]`',
};

export { execute, meta, schema };
