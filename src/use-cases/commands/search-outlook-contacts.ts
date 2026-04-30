import { z } from 'zod';
import { buildCommand } from './build-command.ts';
import type { CommandMeta } from './command-types.ts';

const schema = z.object({ query: z.string().min(1) });
const { execute } = buildCommand((p) => `/me/contacts?$search="${p.query}"`, schema);

const meta: CommandMeta = {
  summary: 'Search the signed-in user’s Outlook contacts using KQL or free text. Matches name, email, company, and phone fields.',
  category: 'contacts',
  graphMethod: 'GET',
  graphPathTemplate: '/me/contacts?$search="{query}"',
  graphDocsUrl: 'https://learn.microsoft.com/en-us/graph/api/user-list-contacts',
  options: [
    {
      name: 'query',
      key: 'query',
      required: true,
      description:
        'KQL or free-text query. Searches displayName, givenName, surname, emailAddresses, companyName, and phone fields. ' +
        'Examples: `Alice`, `displayName:Alice`, `companyName:Contoso`.',
    },
  ],
  example: "ask-marcel search-outlook-contacts --query 'Alice'",
  responseShape: 'collection of Microsoft Graph `contact` resources under `value[]`, ranked by relevance',
};

export { execute, meta, schema };
