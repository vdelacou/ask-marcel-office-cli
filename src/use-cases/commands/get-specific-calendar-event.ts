import { z } from 'zod';
import { buildCommand } from './build-command.ts';
import type { CommandMeta } from './command-types.ts';

const schema = z.object({ calendarId: z.string().min(1), eventId: z.string().min(1) });
const { execute } = buildCommand((p) => `/me/calendars/${p.calendarId}/events/${p.eventId}`, schema);

const meta: CommandMeta = {
  summary: 'Fetch a single calendar event by ID from a specific (non-default) calendar.',
  category: 'calendar',
  graphMethod: 'GET',
  graphPathTemplate: '/me/calendars/{calendar-id}/events/{event-id}',
  graphDocsUrl: 'https://learn.microsoft.com/en-us/graph/api/event-get',
  options: [
    { name: 'calendar-id', key: 'calendarId', required: true, description: 'Calendar ID. Returned by `ask-marcel list-calendars`.' },
    { name: 'event-id', key: 'eventId', required: true, description: 'Event ID. Returned by `ask-marcel list-specific-calendar-events`.' },
  ],
  example: "ask-marcel get-specific-calendar-event --calendar-id 'AAMkAGI2THVS...' --event-id 'AAMkABC...'",
  responseShape: 'single Microsoft Graph `event` resource',
};

export { execute, meta, schema };
