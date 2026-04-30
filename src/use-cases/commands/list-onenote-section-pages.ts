import { z } from 'zod';
import { buildCommand } from './build-command.ts';
import type { CommandMeta } from './command-types.ts';

const schema = z.object({ onenoteSectionId: z.string().min(1) });
const { execute } = buildCommand((p) => `/me/onenote/sections/${p.onenoteSectionId}/pages`, schema);

const meta: CommandMeta = {
  summary: 'List the pages inside a single OneNote section.',
  category: 'notes',
  graphMethod: 'GET',
  graphPathTemplate: '/me/onenote/sections/{onenote-section-id}/pages',
  graphDocsUrl: 'https://learn.microsoft.com/en-us/graph/api/section-list-pages',
  options: [
    {
      name: 'onenote-section-id',
      key: 'onenoteSectionId',
      required: true,
      description: 'OneNote section ID. Returned by `ask-marcel list-onenote-notebook-sections` or `list-all-onenote-sections`.',
    },
  ],
  example: "ask-marcel list-onenote-section-pages --onenote-section-id '1-abc...'",
  responseShape: 'collection of Microsoft Graph `onenotePage` resources under `value[]`',
};

export { execute, meta, schema };
