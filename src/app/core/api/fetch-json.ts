import { environment } from '../../../environments/environment';
import { ApiError } from './api-error';

export interface FetchJsonOptions {
  readonly body?: unknown;
  readonly accessToken?: string;
}

/** Low-level JSON call against the Collecta API. Throws `ApiError` on network failure or non-2xx. */
export async function fetchJson<T>(method: string, path: string, options: FetchJsonOptions = {}): Promise<T> {
  const headers = new Headers({ Accept: 'application/json' });
  if (options.body !== undefined) {
    headers.set('Content-Type', 'application/json');
  }
  if (options.accessToken) {
    headers.set('Authorization', `Bearer ${options.accessToken}`);
  }

  let response: Response;
  try {
    response = await fetch(`${environment.apiUrl}${path}`, {
      method,
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });
  } catch {
    throw new ApiError(0, 'No hay conexión con el servidor.');
  }

  if (!response.ok) {
    throw await ApiError.fromResponse(response);
  }
  return response.status === 204 ? (undefined as T) : ((await response.json()) as T);
}
