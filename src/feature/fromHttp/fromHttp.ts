import { createEffect } from "../effect/effect.js";
import { signal } from "../signal/signal.js";
import type { Signal } from "../../types.js";

/** The outgoing request, as seen by request interceptors. */
export type HttpRequest = {
  url: string;
  init: RequestInit;
};

/** Transform the request before it is sent (e.g. add auth headers). */
export type RequestInterceptor = (
  request: HttpRequest,
) => HttpRequest | Promise<HttpRequest>;

/** Transform the response before it is parsed (e.g. unwrap, throw on codes). */
export type ResponseInterceptor = (
  response: Response,
) => Response | Promise<Response>;

export type FromHttpInterceptors = {
  request?: RequestInterceptor[];
  response?: ResponseInterceptor[];
};

export type FromHttpOptions = {
  params?: () => Record<string, string | number | boolean | undefined | null>;
  /** Base fetch init merged into every request (method, headers, etc.). */
  init?: RequestInit;
  interceptors?: FromHttpInterceptors;
};

export type FromHttpResult<T> = {
  data: Signal<T | undefined>;
  loading: Signal<boolean>;
  error: Signal<Error | undefined>;
  /** Abort the in-flight request and stop reacting to url/param changes. */
  abort(): void;
  /** Pipe operators over the response `data` signal. */
  to: Signal<T | undefined>["to"];
};

export function fromHttp<T>(
  url: string | (() => string),
  options?: FromHttpOptions,
): FromHttpResult<T> {
  const data = signal<T | undefined>(undefined);
  const loading = signal(false);
  const error = signal<Error | undefined>(undefined);

  let controller: AbortController | null = null;

  const dispose = createEffect(() => {
    loading.set(true);
    error.set(undefined);

    const baseUrl = typeof url === "function" ? url() : url;

    if (!baseUrl) {
      data.set(undefined);
      loading.set(false);
      return;
    }

    // Read reactive inputs synchronously so dependency tracking works before
    // any async interceptor/fetch runs.
    const requestUrl = buildUrl(baseUrl, options?.params?.());
    const requestController = new AbortController();
    controller = requestController;

    (async (): Promise<void> => {
      try {
        let request: HttpRequest = {
          url: requestUrl,
          init: { ...options?.init },
        };

        for (const interceptor of options?.interceptors?.request ?? []) {
          request = await interceptor(request);
        }

        // Our abort signal always wins so aborting works regardless of init.
        let response = await fetch(request.url, {
          ...request.init,
          signal: requestController.signal,
        });

        for (const interceptor of options?.interceptors?.response ?? []) {
          response = await interceptor(response);
        }

        if (!response.ok) {
          throw new Error(`HTTP ${response.status} for ${request.url}`);
        }

        const result = (await response.json()) as T;

        if (!requestController.signal.aborted) {
          data.set(result);
          loading.set(false);
        }
      } catch (err: unknown) {
        // A deliberate abort is not a real error.
        if (requestController.signal.aborted) {
          return;
        }

        error.set(err instanceof Error ? err : new Error(String(err)));
        loading.set(false);
      }
    })();

    // Cancel a stale request when the url/params change and we refetch.
    return () => {
      requestController.abort();
    };
  });

  const abort = () => {
    controller?.abort();
    dispose();
    loading.set(false);
  };

  return { data, loading, error, abort, to: data.to };
}

function buildUrl(
  url: string,
  params?: Record<string, string | number | boolean | undefined | null>,
): string {
  if (!params) {
    return url;
  }

  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      search.set(key, String(value));
    }
  }

  const query = search.toString();

  if (!query) {
    return url;
  }

  return url.includes("?") ? `${url}&${query}` : `${url}?${query}`;
}
