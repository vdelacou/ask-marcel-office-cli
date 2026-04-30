import { z } from 'zod';
import { buildCommand } from './build-command.ts';
import type { CommandMeta } from './command-types.ts';

const schema = z.object({ calendarId: z.string().min(1) });
const { execute } = buildCommand((p) => `/me/calendars/${p.calendarId}/events`, schema);

const meta: CommandMeta = {
  summary: 'List the events in a specific (non-default) calendar (does not expand recurrences).',
  category: 'calendar',
  graphMethod: 'GET',
  graphPathTemplate: '/me/calendars/{calendar-id}/events',
  graphDocsUrl: 'https://learn.microsoft.com/en-us/graph/api/calendar-list-events',
  options: [{ name: 'calendar-id', key: 'calendarId', required: true, description: 'Calendar ID. Returned by `ask-marcel list-calendars`.' }],
  example: "ask-marcel list-specific-calendar-events --calendar-id 'AAMkAGI2THVS...'",
  responseShape: 'collection of Microsoft Graph `event` resources under `value[]`',
};

export { execute, meta, schema };
