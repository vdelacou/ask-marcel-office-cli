import type { z } from 'zod';
import type { Result } from '../../domain/result.ts';
import type { GraphClient } from '../../infra/graph-client.ts';

type CommandSchema = z.ZodType;
type CommandExecute = (graph: GraphClient, params: Record<string, string>) => Promise<Result<unknown, import('../../infra/graph-client.ts').GraphError>>;

type CommandCategory = 'auth' | 'drive' | 'excel' | 'sharepoint' | 'tasks' | 'mail' | 'notes' | 'user' | 'calendar' | 'contacts' | 'chats' | 'teams' | 'meta';

type CommandHttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

type CommandOptionMeta = {
  readonly name: string;
  readonly key: string;
  readonly description: string;
  readonly required: true;
};

type CommandMeta = {
  readonly summary: string;
  readonly category: CommandCategory;
  readonly graphMethod: CommandHttpMethod;
  readonly graphPathTemplate: string;
  readonly graphDocsUrl: string;
  readonly options: ReadonlyArray<CommandOptionMeta>;
  readonly example: string;
  readonly responseShape?: string;
  readonly bodyTemplate?: string;
};

type Command = {
  readonly schema: CommandSchema;
  readonly execute: CommandExecute;
  readonly meta: CommandMeta;
};

export type { Command, CommandCategory, CommandExecute, CommandHttpMethod, CommandMeta, CommandOptionMeta, CommandSchema };
