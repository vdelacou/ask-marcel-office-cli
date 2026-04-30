import { z } from 'zod';
import { buildCommand } from './build-command.ts';
import type { CommandMeta } from './command-types.ts';

const schema = z.object({ query: z.string().min(1) });
const { execute } = buildCommand((p) => `/me/onenote/pages?$search=${p.query}`, schema);

const meta: CommandMeta = {
  summary: 'Search the signed-in user’s OneNote pages by free-text. Matches page title and visible text content across every notebook.',
  category: 'notes',
  graphMethod: 'GET',
  graphPathTemplate: '/me/onenote/pages?$search={query}',
  graphDocsUrl: 'https://learn.microsoft.com/en-us/graph/api/onenote-list-pages',
  options: [
    {
      name: 'query',
      key: 'query',
      required: true,
      description:
        'Free-text query. Searches OneNote page titles and visible text content across every notebook the signed-in user owns or follows. ' +
        'Note: unlike mail/calendar/contacts, OneNote `$search` does not use double quotes and does not accept KQL field syntax. ' +
        'Use `list-onenote-section-pages` if you already know the section.',
    },
  ],
  example: "ask-marcel search-onenote-pages --query 'meeting notes'",
  responseShape: 'collection of Microsoft Graph `onenotePage` resources under `value[]`',
};

export { execute, meta, schema };
