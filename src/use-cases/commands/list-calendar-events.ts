import { z } from 'zod';
import { buildCommand } from './build-command.ts';
import type { CommandMeta } from './command-types.ts';

const schema = z.object({}).strict();
const { execute } = buildCommand(() => '/me/events', schema);

const meta: CommandMeta = {
  summary: 'List the events in the signed-in user’s default calendar (does not expand recurrences).',
  category: 'calendar',
  graphMethod: 'GET',
  graphPathTemplate: '/me/events',
  graphDocsUrl: 'https://learn.microsoft.com/en-us/graph/api/user-list-events',
  options: [],
  example: 'ask-marcel list-calendar-events',
  responseShape: 'collection of Microsoft Graph `event` resources under `value[]`',
};

export { execute, meta, schema };
