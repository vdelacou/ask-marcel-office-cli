export const decodeJwtPayload = (token: string): Record<string, unknown> => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return {};
    const b64 = parts[1].replaceAll(/-/g, '+').replaceAll(/_/g, '/');
    const padded = b64.padEnd(b64.length + ((4 - (b64.length % 4)) % 4), '=');
    return JSON.parse(Buffer.from(padded, 'base64').toString('utf-8')) as Record<string, unknown>;
  } catch {
    return {};
  }
};

export const isTokenFresh = (token: string, bufferSeconds = 300): boolean => {
  const claims = decodeJwtPayload(token);
  const exp = claims.exp as number | undefined;
  if (typeof exp !== 'number') return false;
  return Date.now() / 1000 < exp - bufferSeconds;
};

export const isGraphToken = (token: string): boolean => {
  const claims = decodeJwtPayload(token);
  const aud = claims.aud;
  if (typeof aud === 'string') return aud.includes('graph.microsoft.com');
  if (Array.isArray(aud)) return aud.some((a) => typeof a === 'string' && a.includes('graph.microsoft.com'));
  return false;
};
