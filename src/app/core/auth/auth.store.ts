import { Injectable, computed, signal } from '@angular/core';

import { ApiError } from '../api/api-error';
import { fetchJson } from '../api/fetch-json';
import { AuthSession } from './auth.models';

const STORAGE_KEY = 'collecta.session';
/** Refresh slightly before expiry so a token never dies mid-request. */
const EXPIRY_MARGIN_MS = 30_000;

/**
 * Signed-in user and their tokens. Persists the session across reloads and keeps the
 * access token fresh. Talks to the auth endpoints with `fetchJson` directly (not
 * `ApiClient`, which depends on this store).
 */
@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly _session = signal<AuthSession | null>(readStoredSession());
  private refreshInFlight: Promise<boolean> | null = null;

  readonly user = computed(() => this._session()?.user ?? null);
  /** Primitive, so consumers re-run only when the account changes — not on every token refresh. */
  readonly userId = computed(() => this._session()?.user.id ?? null);
  readonly isAuthenticated = computed(() => this._session() !== null);

  async login(email: string, password: string): Promise<void> {
    this.setSession(await fetchJson<AuthSession>('POST', '/api/auth/login', { body: { email, password } }));
  }

  async register(email: string, displayName: string, password: string): Promise<void> {
    this.setSession(
      await fetchJson<AuthSession>('POST', '/api/auth/register', { body: { email, displayName, password } }),
    );
  }

  async logout(): Promise<void> {
    const session = this._session();
    this.setSession(null);
    if (session) {
      // Best effort: the local session is already gone even if the server is unreachable.
      await fetchJson('POST', '/api/auth/logout', { body: { refreshToken: session.refreshToken } }).catch(
        () => undefined,
      );
    }
  }

  /** A usable access token, refreshing first if it is about to expire. Null when signed out. */
  async accessToken(): Promise<string | null> {
    const session = this._session();
    if (!session) {
      return null;
    }
    if (Date.parse(session.accessTokenExpiresAt) - EXPIRY_MARGIN_MS > Date.now()) {
      return session.accessToken;
    }
    return (await this.refresh()) ? (this._session()?.accessToken ?? null) : null;
  }

  /**
   * Rotates the tokens. Concurrent callers share one request: the API treats a reused
   * refresh token as stolen and revokes every session, so two parallel refreshes would
   * sign the user out.
   */
  refresh(): Promise<boolean> {
    this.refreshInFlight ??= this.doRefresh().finally(() => (this.refreshInFlight = null));
    return this.refreshInFlight;
  }

  private async doRefresh(): Promise<boolean> {
    const session = this._session();
    if (!session) {
      return false;
    }
    try {
      this.setSession(
        await fetchJson<AuthSession>('POST', '/api/auth/refresh', { body: { refreshToken: session.refreshToken } }),
      );
      return true;
    } catch (error) {
      // Offline is not a rejection: keep the session and let the caller retry later.
      if (error instanceof ApiError && error.status !== 0) {
        this.setSession(null);
      }
      return false;
    }
  }

  private setSession(session: AuthSession | null): void {
    this._session.set(session);
    try {
      if (session) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // Storage unavailable (private mode): the session just won't survive a reload.
    }
  }
}

function readStoredSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as Partial<AuthSession>) : null;
    return parsed &&
      typeof parsed.accessToken === 'string' &&
      typeof parsed.accessTokenExpiresAt === 'string' &&
      typeof parsed.refreshToken === 'string' &&
      typeof parsed.user?.id === 'string'
      ? (parsed as AuthSession)
      : null;
  } catch {
    return null;
  }
}
