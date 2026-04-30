import type { Result } from '../domain/result.ts';
import { err, ok } from '../domain/result.ts';
import type { AuthManager } from '../infra/auth.ts';

type GraphError = { type: 'api_error'; status: number; message: string } | { type: 'auth_failed'; message: string } | { type: 'network_error'; message: string };

type GraphClient = {
  get: (path: string) => Promise<Result<unknown, GraphError>>;
  post: (path: string, body: unknown) => Promise<Result<unknown, GraphError>>;
  getBinary: (path: string) => Promise<Result<unknown, GraphError>>;
};

type FetchFn = (url: string, init?: RequestInit) => Promise<Response>;

const isJson = (contentType: string | null): boolean => contentType !== null && contentType.toLowerCase().includes('application/json');

const isText = (contentType: string | null): boolean => {
  if (contentType === null) return false;
  const lower = contentType.toLowerCase();
  return lower.startsWith('text/') || lower.includes('+xml') || lower.includes('application/xml') || lower.includes('application/javascript');
};

const toBase64 = (bytes: Uint8Array): string => {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
};

const networkErrorMessage = (e: unknown): string => {
  if (e instanceof Error) return e.message;
  if (typeof e === 'string') return e;
  return 'network request failed';
};

const createGraphClient = (auth: AuthManager, fetchFn: FetchFn = globalThis.fetch): GraphClient => {
  const authHeaders = async (): Promise<Result<{ Authorization: string }, GraphError>> => {
    const tokenResult = await auth.getAccessToken();
    if (!tokenResult.ok) {
      const msg = tokenResult.error.type === 'auth_cancelled' ? 'Auth cancelled' : tokenResult.error.message;
      return err({ type: 'auth_failed', message: msg });
    }
    return ok({ Authorization: `Bearer ${tokenResult.value}` });
  };

  const request = async (method: 'GET' | 'POST', path: string, body?: unknown): Promise<Result<unknown, GraphError>> => {
    const headers = await authHeaders();
    if (!headers.ok) return headers;

    try {
      const res = await fetchFn(`https://graph.microsoft.com/v1.0${path}`, {
        method,
        headers: { ...headers.value, 'content-type': 'application/json' },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      });
      if (!res.ok) {
        const errBody = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
        return err({ type: 'api_error', status: res.status, message: errBody.error?.message ?? res.statusText });
      }
      return ok(await res.json());
    } catch (e: unknown) {
      return err({ type: 'network_error', message: networkErrorMessage(e) });
    }
  };

  const getBinary = async (path: string): Promise<Result<unknown, GraphError>> => {
    const headers = await authHeaders();
    if (!headers.ok) return headers;

    try {
      const res = await fetchFn(`https://graph.microsoft.com/v1.0${path}`, {
        method: 'GET',
        headers: headers.value,
        redirect: 'manual',
      });
      if (res.status >= 300 && res.status < 400) {
        const location = res.headers.get('location');
        if (location !== null) return ok({ '@microsoft.graph.downloadUrl': location });
      }
      if (!res.ok) {
        const errBody = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
        return err({ type: 'api_error', status: res.status, message: errBody.error?.message ?? res.statusText });
      }
      const contentType = res.headers.get('content-type');
      if (isJson(contentType)) return ok(await res.json());
      if (isText(contentType)) {
        const text = await res.text();
        return ok({ contentType: contentType ?? 'text/plain', size: text.length, text });
      }
      const buffer = await res.arrayBuffer();
      return ok({ contentType: contentType ?? 'application/octet-stream', size: buffer.byteLength, base64: toBase64(new Uint8Array(buffer)) });
    } catch (e: unknown) {
      return err({ type: 'network_error', message: networkErrorMessage(e) });
    }
  };

  return {
    get: (path) => request('GET', path),
    post: (path, body) => request('POST', path, body),
    getBinary,
  };
};

export { createGraphClient };
export type { FetchFn, GraphClient, GraphError };
