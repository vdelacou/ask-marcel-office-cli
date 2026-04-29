import { describe, expect, it } from 'bun:test';
import { createLoggerFake } from '../test-helpers/logger-fake.ts';
import { render, renderError } from './output.ts';

const captureStream = async (stream: 'stdout' | 'stderr', run: () => void | Promise<void>): Promise<string> => {
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

describe('presenter output', () => {
  it('renders a JSON line to stdout and logs an info event', async () => {
    const logger = createLoggerFake();
    const out = await captureStream('stdout', () => render({ status: 'authenticated' }, logger));
    expect(out.trim()).toBe(JSON.stringify({ status: 'authenticated' }));
    expect(logger.calls.some((c) => c.event === 'output_rendered')).toBe(true);
  });

  it('renders an error envelope to stderr and logs an error event with the message', async () => {
    const logger = createLoggerFake();
    const out = await captureStream('stderr', () => renderError('Authentication cancelled', logger));
    expect(out.trim()).toBe(JSON.stringify({ error: 'Authentication cancelled' }));
    const errorCall = logger.calls.find((c) => c.event === 'output_error');
    expect(errorCall?.level).toBe('error');
    expect(errorCall?.meta?.message).toBe('Authentication cancelled');
  });
});
