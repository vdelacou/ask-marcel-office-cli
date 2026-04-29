import type { Result } from './result.ts';
import { err, ok } from './result.ts';
import { isGraphToken, isTokenFresh } from './jwt-utils.ts';

export type AccessToken = string & { readonly __brand: 'AccessToken' };

export type AccessTokenError = { type: 'malformed_jwt' } | { type: 'expired' } | { type: 'wrong_audience' };

export const accessToken = (raw: string): Result<AccessToken, AccessTokenError> => {
  if (!raw.startsWith('eyJ')) return err({ type: 'malformed_jwt' });
  if (!isTokenFresh(raw)) return err({ type: 'expired' });
  if (!isGraphToken(raw)) return err({ type: 'wrong_audience' });
  return ok(raw as AccessToken);
};

export const accessTokenUnsafe = (raw: string): AccessToken => raw as AccessToken;
