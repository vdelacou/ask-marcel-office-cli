import { z } from 'zod';
import { buildCommand } from './build-command.ts';
import type { CommandMeta } from './command-types.ts';

const schema = z.object({}).strict();
const { execute } = buildCommand(() => '/me/calendars', schema);

const meta: CommandMeta = {
  summary: 'List the calendars in the signed-in user’s mailbox (default + secondary calendars + shared calendars).',
  category: 'calendar',
  graphMethod: 'GET',
  graphPathTemplate: '/me/calendars',
  graphDocsUrl: 'https://learn.microsoft.com/en-us/graph/api/user-list-calendars',
  options: [],
  example: 'ask-marcel list-calendars',
  responseShape: 'collection of Microsoft Graph `calendar` resources under `value[]`',
};

export { execute, meta, schema };
