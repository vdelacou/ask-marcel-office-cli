import type { z } from 'zod';
import type { Result } from '../../domain/result.ts';
import type { GraphClient } from '../../infra/graph-client.ts';

type CommandSchema = z.ZodType;
type CommandExecute = (graph: GraphClient, params: Record<string, string>) => Promise<Result<unknown, import('../../infra/graph-client.ts').GraphError>>;

type Command = {
  readonly schema: CommandSchema;
  readonly execute: CommandExecute;
};

export type { Command, CommandExecute, CommandSchema };
