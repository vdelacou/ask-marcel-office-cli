import { z } from 'zod';
import { buildCommand } from './build-command.ts';
import type { CommandMeta } from './command-types.ts';

const schema = z.object({}).strict();
const { execute } = buildCommand(() => '/me/mailboxSettings', schema);

const meta: CommandMeta = {
  summary: 'Get the signed-in user’s Outlook mailbox settings (timezone, working hours, automatic replies).',
  category: 'mail',
  graphMethod: 'GET',
  graphPathTemplate: '/me/mailboxSettings',
  graphDocsUrl: 'https://learn.microsoft.com/en-us/graph/api/user-get-mailboxsettings',
  options: [],
  example: 'ask-marcel get-mailbox-settings',
  responseShape: 'single Microsoft Graph `mailboxSettings` resource',
};

export { execute, meta, schema };
