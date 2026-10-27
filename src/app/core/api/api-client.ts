import { Injectable, inject } from '@angular/core';

import { AuthStore } from '../auth/auth.store';
import { ApiError } from './api-error';
import { fetchJson } from './fetch-json';

/** Authenticated calls to the Collecta API. Retries once with fresh tokens after a 401. */
@Injectable({ providedIn: 'root' })
export class ApiClient {
  private readonly auth = inject(AuthStore);

  get<T>(path: string): Promise<T> {
    return this.send<T>('GET', path);
  }

  post<T>(path: string, body?: unknown): Promise<T> {
    return this.send<T>('POST', path, body);
  }

  put(path: string, body?: unknown): Promise<void> {
    return this.send<void>('PUT', path, body);
  }

  delete(path: string): Promise<void> {
    return this.send<void>('DELETE', path);
  }

  private async send<T>(method: string, path: string, body?: unknown): Promise<T> {
    const accessToken = (await this.auth.accessToken()) ?? undefined;
    try {
      return await fetchJson<T>(method, path, { body, accessToken });
    } catch (error) {
      if (!(error instanceof ApiError) || error.status !== 401 || !(await this.auth.refresh())) {
        throw error;
      }
      return fetchJson<T>(method, path, { body, accessToken: (await this.auth.accessToken()) ?? undefined });
    }
  }
}
