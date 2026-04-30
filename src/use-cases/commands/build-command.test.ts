import { describe, expect, it } from 'bun:test';
import { z } from 'zod';
import { ok } from '../../domain/result.ts';
import type { GraphClient } from '../../infra/graph-client.ts';
import { buildCommand } from './build-command.ts';

const fakeGraph: GraphClient = { get: async () => ok({}), post: async () => ok({}), getBinary: async () => ok({}) };

describe('buildCommand', () => {
  it('throws with descriptive message when schema validation fails', async () => {
    const cmd = buildCommand((p) => `/items/${p.id}`, z.object({ id: z.string().min(1) }));
    await expect(cmd.execute(fakeGraph, {})).rejects.toThrow('validation failed:');
  });

  it('calls graph.get with the constructed path on valid params', async () => {
    let captured = '';
    const graph: GraphClient = {
      get: async (path: string) => {
        captured = path;
        return ok({});
      },
      post: async () => ok({}),
      getBinary: async () => ok({}),
    };
    const cmd = buildCommand((p) => `/items/${p.id}`, z.object({ id: z.string() }));
    const result = await cmd.execute(graph, { id: '42' });
    expect(result).toEqual(ok({}));
    expect(captured).toBe('/items/42');
  });
});
