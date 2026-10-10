import { test, type APIRequestContext, type APIResponse } from '@playwright/test';
import { config } from '../config';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
type FetchOptions = NonNullable<Parameters<APIRequestContext['fetch']>[1]>;
export type RequestOptions = Pick<FetchOptions, 'data' | 'params' | 'headers'>;

/**
 * Shared HTTP plumbing for every resource client (the API counterpart of a
 * BasePage). Each request is wrapped in a boxed `test.step`, so reports show
 * "POST pet" instead of client internals.
 */
export abstract class BaseApiClient {
  constructor(protected readonly request: APIRequestContext) {}

  protected get(path: string, options?: RequestOptions): Promise<APIResponse> {
    return this.send('GET', path, options);
  }

  protected post(path: string, options?: RequestOptions): Promise<APIResponse> {
    return this.send('POST', path, options);
  }

  protected put(path: string, options?: RequestOptions): Promise<APIResponse> {
    return this.send('PUT', path, options);
  }

  protected delete(path: string, options?: RequestOptions): Promise<APIResponse> {
    return this.send('DELETE', path, options);
  }

  private send(method: HttpMethod, path: string, options: RequestOptions = {}): Promise<APIResponse> {
    if (path.startsWith('/')) {
      // A leading slash resolves against the host root and silently drops
      // the base URL path (e.g. "/v2"), so fail fast instead.
      throw new Error(`Endpoint path must be relative to baseURL, got "${path}"`);
    }
    return test.step(
      `${method} ${path}`,
      () => this.request.fetch(path, { ...options, method, timeout: config.timeoutMs }),
      { box: true },
    );
  }
}
