import { z } from 'zod';
import { buildCommand } from './build-command.ts';
import type { CommandMeta } from './command-types.ts';

const schema = z.object({ notebookId: z.string().min(1) });
const { execute } = buildCommand((p) => `/me/onenote/notebooks/${p.notebookId}/sections`, schema);

const meta: CommandMeta = {
  summary:
    'List the top-level sections of a single OneNote notebook (flat — does NOT recurse into section groups; use `list-all-onenote-sections` to flatten every notebook the user has access to).',
  category: 'notes',
  graphMethod: 'GET',
  graphPathTemplate: '/me/onenote/notebooks/{notebook-id}/sections',
  graphDocsUrl: 'https://learn.microsoft.com/en-us/graph/api/notebook-list-sections',
  options: [{ name: 'notebook-id', key: 'notebookId', required: true, description: 'OneNote notebook ID. Returned by `ask-marcel list-onenote-notebooks`.' }],
  example: "ask-marcel list-onenote-notebook-sections --notebook-id '1-12abc...'",
  responseShape: 'collection of Microsoft Graph `onenoteSection` resources under `value[]`',
};

export { execute, meta, schema };
