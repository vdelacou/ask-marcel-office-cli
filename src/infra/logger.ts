import { createLogger, format, transports } from 'winston';
import type { Logger } from '../use-cases/ports/logger.ts';

const REDACTED_KEYS = new Set(['password', 'token', 'authorization', 'apikey', 'secret']);

const ALL_LEVELS = ['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly'];

const redactFormat = format((info) => {
  for (const key of Object.keys(info)) {
    if (REDACTED_KEYS.has(key.toLowerCase())) info[key] = '[REDACTED]';
  }
  return info;
});

export type WinstonLoggerConfig = {
  readonly logLevel?: string;
};

export const createWinstonLogger = (config: WinstonLoggerConfig = {}): Logger => {
  const winston = createLogger({
    // Default to `error` so stdout stays clean for piping. Override with
    // LOG_LEVEL=info (or debug) for verbose troubleshooting output.
    level: config.logLevel ?? process.env.LOG_LEVEL ?? 'error',
    format: format.combine(redactFormat(), format.json()),
    // Route ALL log levels to stderr so stdout is reserved for the
    // command's actual JSON output (LLM-friendly piping).
    transports: [new transports.Console({ stderrLevels: ALL_LEVELS })],
  });
  return {
    info: (event, meta) => winston.info(event, meta),
    warn: (event, meta) => winston.warn(event, meta),
    error: (event, meta) => winston.error(event, meta),
  };
};
