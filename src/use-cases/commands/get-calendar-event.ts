import { z } from 'zod';
import { buildCommand } from './build-command.ts';
import type { CommandMeta } from './command-types.ts';

const schema = z.object({ eventId: z.string().min(1) });
const { execute } = buildCommand((p) => `/me/events/${p.eventId}`, schema);

const meta: CommandMeta = {
  summary: 'Fetch a single calendar event by ID from the signed-in user’s default calendar.',
  category: 'calendar',
  graphMethod: 'GET',
  graphPathTemplate: '/me/events/{event-id}',
  graphDocsUrl: 'https://learn.microsoft.com/en-us/graph/api/event-get',
  options: [
    {
      name: 'event-id',
      key: 'eventId',
      required: true,
      description: 'Microsoft Graph event ID. Returned by `ask-marcel list-calendar-events` in the `id` field of each event.',
    },
  ],
  example: "ask-marcel get-calendar-event --event-id 'AAMkAGI2THVS...'",
  responseShape: 'single Microsoft Graph `event` resource',
};

export { execute, meta, schema };
