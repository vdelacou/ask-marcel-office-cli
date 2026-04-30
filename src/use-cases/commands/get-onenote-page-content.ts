import { z } from 'zod';
import { buildCommand } from './build-command.ts';
import type { CommandMeta } from './command-types.ts';

const schema = z.object({ onenotePageId: z.string().min(1) });
const { execute } = buildCommand((p) => `/me/onenote/pages/${p.onenotePageId}/content`, schema);

const meta: CommandMeta = {
  summary: 'Get the HTML body of a single OneNote page.',
  category: 'notes',
  graphMethod: 'GET',
  graphPathTemplate: '/me/onenote/pages/{onenote-page-id}/content',
  graphDocsUrl: 'https://learn.microsoft.com/en-us/graph/api/page-get',
  options: [{ name: 'onenote-page-id', key: 'onenotePageId', required: true, description: 'OneNote page ID. Returned by `ask-marcel list-onenote-section-pages`.' }],
  example: "ask-marcel get-onenote-page-content --onenote-page-id '1-abc...'",
  responseShape: 'HTML string (the rendered page body)',
};

export { execute, meta, schema };
