import { TestBed } from '@angular/core/testing';

import { AuthSession } from '../auth/auth.models';
import { AuthStore } from '../auth/auth.store';
import { ApiClient } from './api-client';
import { ApiError } from './api-error';

const STORAGE_KEY = 'collecta.session';

function session(accessToken: string, refreshToken: string): AuthSession {
  return {
    accessToken,
    refreshToken,
    accessTokenExpiresAt: new Date(Date.now() + 15 * 60_000).toISOString(),
    user: { id: 'u1', email: 'ana@test.dev', displayName: 'Ana' },
  };
}

function jsonResponse(status: number, body?: unknown): Response {
  return new Response(body === undefined ? null : JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

/** Fake API: `/api/collections` accepts only `validToken`; `/api/auth/refresh` answers with `refreshResult`. */
function stubApi(options: { validToken: string; refreshResult: () => Response }) {
  const calls: string[] = [];
  const fetchMock = vi.fn(async (url: string, init: RequestInit) => {
    const path = new URL(url).pathname;
    calls.push(path);
    if (path === '/api/auth/refresh') {
      await new Promise((resolve) => setTimeout(resolve, 10));
      return options.refreshResult();
    }
    const auth = new Headers(init.headers).get('Authorization');
    return auth === `Bearer ${options.validToken}` ? jsonResponse(200, []) : jsonResponse(401);
  });
  vi.stubGlobal('fetch', fetchMock);
  return { refreshCalls: () => calls.filter((p) => p === '/api/auth/refresh').length };
}

describe('ApiClient', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session('old-access', 'old-refresh')));
  });

  afterEach(() => vi.unstubAllGlobals());

  it('sends the stored access token', async () => {
    const api = stubApi({ validToken: 'old-access', refreshResult: () => jsonResponse(500) });

    await expect(TestBed.inject(ApiClient).get('/api/collections')).resolves.toEqual([]);
    expect(api.refreshCalls()).toBe(0);
  });

  it('refreshes and retries once after a 401', async () => {
    const api = stubApi({
      validToken: 'new-access',
      refreshResult: () => jsonResponse(200, session('new-access', 'new-refresh')),
    });

    await expect(TestBed.inject(ApiClient).get('/api/collections')).resolves.toEqual([]);
    expect(api.refreshCalls()).toBe(1);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}').refreshToken).toBe('new-refresh');
  });

  it('shares a single refresh between concurrent 401s', async () => {
    const api = stubApi({
      validToken: 'new-access',
      refreshResult: () => jsonResponse(200, session('new-access', 'new-refresh')),
    });
    const client = TestBed.inject(ApiClient);

    await Promise.all([client.get('/api/collections'), client.get('/api/collections')]);
    expect(api.refreshCalls()).toBe(1);
  });

  it('signs out when the refresh token is rejected', async () => {
    stubApi({ validToken: 'never', refreshResult: () => jsonResponse(401) });

    const failure = TestBed.inject(ApiClient).get('/api/collections');
    await expect(failure).rejects.toBeInstanceOf(ApiError);
    expect(TestBed.inject(AuthStore).isAuthenticated()).toBe(false);
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});
