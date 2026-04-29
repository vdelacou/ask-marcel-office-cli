import { describe, expect, it } from 'bun:test';
import { createWinstonLogger } from './logger.ts';

const captureStdout = async (run: () => void | Promise<void>): Promise<string> => {
  const original = process.stdout.write.bind(process.stdout);
  let captured = '';
  const swap = (chunk: string | Uint8Array): boolean => {
    captured += typeof chunk === 'string' ? chunk : new TextDecoder().decode(chunk);
    return true;
  };
  process.stdout.write = swap;
  try {
    await run();
  } finally {
    process.stdout.write = original;
  }
  return captured;
};

describe('winston logger adapter', () => {
  it('exposes info, warn, and error methods that conform to the Logger port', () => {
    const logger = createWinstonLogger({ logLevel: 'error' });
    expect(typeof logger.info).toBe('function');
    expect(typeof logger.warn).toBe('function');
    expect(typeof logger.error).toBe('function');
  });

  it('emits an info event as JSON to stdout', async () => {
    const logger = createWinstonLogger({ logLevel: 'info' });
    const out = await captureStdout(() => logger.info('user_logged_in', { userId: 'u-1' }));
    expect(out).toContain('user_logged_in');
    expect(out).toContain('u-1');
  });

  it('redacts secret-shaped meta keys before emitting', async () => {
    const logger = createWinstonLogger({ logLevel: 'info' });
    const out = await captureStdout(() => logger.info('inbound_request', { token: 'super-secret-jwt' }));
    expect(out).not.toContain('super-secret-jwt');
    expect(out).toContain('[REDACTED]');
  });

  it('emits warn and error levels', async () => {
    const logger = createWinstonLogger({ logLevel: 'warn' });
    const out = await captureStdout(() => {
      logger.warn('disk_almost_full');
      logger.error('disk_full');
    });
    expect(out).toContain('disk_almost_full');
    expect(out).toContain('disk_full');
  });

  it('falls back to LOG_LEVEL env var, then to info, when no config is given', async () => {
    const previous = process.env.LOG_LEVEL;
    delete process.env.LOG_LEVEL;
    try {
      const logger = createWinstonLogger();
      const out = await captureStdout(() => logger.info('default_level_event'));
      expect(out).toContain('default_level_event');
    } finally {
      if (previous === undefined) delete process.env.LOG_LEVEL;
      else process.env.LOG_LEVEL = previous;
    }
  });
});
