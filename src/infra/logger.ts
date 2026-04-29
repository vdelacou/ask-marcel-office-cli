import { createLogger, format, transports } from 'winston';
import type { Logger } from '../use-cases/ports/logger.ts';

const REDACTED_KEYS = new Set(['password', 'token', 'authorization', 'apikey', 'secret']);

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
    level: config.logLevel ?? process.env.LOG_LEVEL ?? 'info',
    format: format.combine(redactFormat(), format.json()),
    transports: [new transports.Console()],
  });
  return {
    info: (event, meta) => winston.info(event, meta),
    warn: (event, meta) => winston.warn(event, meta),
    error: (event, meta) => winston.error(event, meta),
  };
};
