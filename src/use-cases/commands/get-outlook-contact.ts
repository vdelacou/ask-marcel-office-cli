import { z } from 'zod';
import { buildCommand } from './build-command.ts';
import type { CommandMeta } from './command-types.ts';

const schema = z.object({ contactId: z.string().min(1) });
const { execute } = buildCommand((p) => `/me/contacts/${p.contactId}`, schema);

const meta: CommandMeta = {
  summary: 'Get a single personal Outlook contact by its ID.',
  category: 'contacts',
  graphMethod: 'GET',
  graphPathTemplate: '/me/contacts/{contact-id}',
  graphDocsUrl: 'https://learn.microsoft.com/en-us/graph/api/contact-get',
  options: [{ name: 'contact-id', key: 'contactId', required: true, description: 'Outlook contact ID. Returned by `ask-marcel list-outlook-contacts`.' }],
  example: "ask-marcel get-outlook-contact --contact-id 'AAMkAGI2...'",
  responseShape: 'single Microsoft Graph `contact` resource',
};

export { execute, meta, schema };
