import type { Result } from '../domain/result.ts';
import { err, ok } from '../domain/result.ts';
import type { AuthManager } from '../infra/auth.ts';

type GraphError = { type: 'api_error'; status: number; message: string } | { type: 'auth_failed'; message: string } | { type: 'network_error'; message: string };

type GraphClient = {
  get: (path: string) => Promise<Result<unknown, GraphError>>;
  post: (path: string, body: unknown) => Promise<Result<unknown, GraphError>>;
};

type FetchFn = (url: string, init?: RequestInit) => Promise<Response>;

const createGraphClient = (auth: AuthManager, fetchFn: FetchFn = globalThis.fetch): GraphClient => {
  const request = async (method: 'GET' | 'POST', path: string, body?: unknown): Promise<Result<unknown, GraphError>> => {
    const tokenResult = await auth.getAccessToken();
    if (!tokenResult.ok) {
      const msg = tokenResult.error.type === 'auth_cancelled' ? 'Auth cancelled' : tokenResult.error.message;
      return err({ type: 'auth_failed', message: msg });
    }

    try {
      const res = await fetchFn(`https://graph.microsoft.com/v1.0${path}`, {
        method,
        headers: { Authorization: `Bearer ${tokenResult.value}`, 'content-type': 'application/json' },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      });
      if (!res.ok) {
        const errBody = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
        return err({ type: 'api_error', status: res.status, message: errBody.error?.message ?? res.statusText });
      }
      return ok(await res.json());
    } catch (e: unknown) {
      let msg: string;
      if (e instanceof Error) msg = e.message;
      else if (typeof e === 'string') msg = e;
      else msg = 'network request failed';
      return err({ type: 'network_error', message: msg });
    }
  };

  return {
    get: (path) => request('GET', path),
    post: (path, body) => request('POST', path, body),
  };
};

export { createGraphClient };
export type { FetchFn, GraphClient, GraphError };
