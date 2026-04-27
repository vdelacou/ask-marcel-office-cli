import type { Logger } from '../use-cases/ports/logger.ts';

export const createCli = (logger: Logger): { readonly render: () => void } => ({
  render: () => {
    logger.info('cli rendered');
  },
});
