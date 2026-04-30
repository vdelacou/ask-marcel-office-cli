import { z } from 'zod';
import { buildCommand } from './build-command.ts';
import type { CommandMeta } from './command-types.ts';

const PREFIX = 'https://graph.microsoft.com/v1.0';

const schema = z.object({
  url: z
    .string()
    .min(1)
    .refine((v) => v.startsWith(`${PREFIX}/`), { message: `must be a Microsoft Graph v1.0 URL starting with ${PREFIX}/` }),
});

const { execute } = buildCommand((p) => p.url.slice(PREFIX.length), schema);

const meta: CommandMeta = {
  summary: 'Fetch the next page of a paginated Graph response. Pass the `@odata.nextLink` value returned by any list / search / delta command to walk pagination yourself.',
  category: 'meta',
  graphMethod: 'GET',
  graphPathTemplate: '{url}',
  graphDocsUrl: 'https://learn.microsoft.com/en-us/graph/paging',
  options: [
    {
      name: 'url',
      key: 'url',
      required: true,
      description:
        'Full Graph v1.0 URL — copy the `@odata.nextLink` field from the previous response. ' +
        'Example: `https://graph.microsoft.com/v1.0/me/messages?$skiptoken=AKDsfg...`. ' +
        'Loop: keep calling until the response no longer contains `@odata.nextLink`. ' +
        'Also handles `@odata.deltaLink` if you want to resume a delta query.',
    },
  ],
  example: "ask-marcel next-page --url 'https://graph.microsoft.com/v1.0/me/messages?$skip=10'",
  responseShape: 'same shape as the originating endpoint (typically `{ value: [...], "@odata.nextLink": "..." }`)',
};

export { execute, meta, schema };
