import { describe, expect, it } from 'bun:test';
import { accessTokenUnsafe } from '../domain/access-token.ts';
import type { AuthError, AuthManager } from '../infra/auth.ts';
import type { GraphClient, GraphError } from '../infra/graph-client.ts';
import { createLoggerFake } from '../test-helpers/logger-fake.ts';
import { buildCli } from './cli.ts';

const captureStream = async (stream: 'stdout' | 'stderr', run: () => void | Promise<unknown>): Promise<string> => {
  const target = process[stream];
  const original = target.write.bind(target);
  let captured = '';
  const swap = (chunk: string | Uint8Array): boolean => {
    captured += typeof chunk === 'string' ? chunk : new TextDecoder().decode(chunk);
    return true;
  };
  target.write = swap;
  try {
    await run();
  } finally {
    target.write = original;
  }
  return captured;
};

const okAuth = (): AuthManager => ({
  getAccessToken: async () => ({ ok: true, value: accessTokenUnsafe('tok') }),
  logout: async () => ({ ok: true, value: undefined }),
});

const cancelledAuth = (): AuthManager => ({
  getAccessToken: async () => ({ ok: false, error: { type: 'auth_cancelled' } as AuthError }),
  logout: async () => ({ ok: false, error: { type: 'auth_cancelled' } as AuthError }),
});

const failedAuth = (): AuthManager => ({
  getAccessToken: async () => ({ ok: false, error: { type: 'auth_failed', message: 'browser launch failed' } as AuthError }),
  logout: async () => ({ ok: false, error: { type: 'auth_failed', message: 'rm denied' } as AuthError }),
});

const okGraph = (value: unknown): GraphClient => ({
  get: async () => ({ ok: true, value }),
});

const errGraph = (error: GraphError): GraphClient => ({
  get: async () => ({ ok: false, error }),
});

describe('buildCli command surface', () => {
  it('renders an authenticated envelope when login succeeds', async () => {
    const logger = createLoggerFake();
    const cli = buildCli({ auth: okAuth(), graph: okGraph({}), logger });
    const out = await captureStream('stdout', () => cli.parseAsync(['node', 'ask-marcel', 'login']));
    expect(out).toContain('"status":"authenticated"');
  });

  it('renders an Authentication cancelled error when the user closes the browser', async () => {
    const logger = createLoggerFake();
    const cli = buildCli({ auth: cancelledAuth(), graph: okGraph({}), logger });
    const out = await captureStream('stderr', () => cli.parseAsync(['node', 'ask-marcel', 'login']));
    expect(out).toContain('Authentication cancelled');
  });

  it('renders the underlying message when login fails for a non-cancellation reason', async () => {
    const logger = createLoggerFake();
    const cli = buildCli({ auth: failedAuth(), graph: okGraph({}), logger });
    const out = await captureStream('stderr', () => cli.parseAsync(['node', 'ask-marcel', 'login']));
    expect(out).toContain('browser launch failed');
  });

  it('renders a logged_out envelope when logout succeeds', async () => {
    const logger = createLoggerFake();
    const cli = buildCli({ auth: okAuth(), graph: okGraph({}), logger });
    const out = await captureStream('stdout', () => cli.parseAsync(['node', 'ask-marcel', 'logout']));
    expect(out).toContain('"status":"logged_out"');
  });

  it('renders the underlying message when logout fails', async () => {
    const logger = createLoggerFake();
    const cli = buildCli({ auth: failedAuth(), graph: okGraph({}), logger });
    const out = await captureStream('stderr', () => cli.parseAsync(['node', 'ask-marcel', 'logout']));
    expect(out).toContain('rm denied');
  });

  it('runs a generic Graph command and renders the value as JSON', async () => {
    const logger = createLoggerFake();
    const cli = buildCli({ auth: okAuth(), graph: okGraph({ displayName: 'Vincent' }), logger });
    const out = await captureStream('stdout', () => cli.parseAsync(['node', 'ask-marcel', 'get-current-user']));
    expect(out).toContain('Vincent');
  });

  it('renders the Graph error message when a generic Graph command fails', async () => {
    const logger = createLoggerFake();
    const cli = buildCli({
      auth: okAuth(),
      graph: errGraph({ type: 'api_error', status: 404, message: 'not found' }),
      logger,
    });
    const out = await captureStream('stderr', () => cli.parseAsync(['node', 'ask-marcel', 'get-current-user']));
    expect(out).toContain('not found');
  });
});
