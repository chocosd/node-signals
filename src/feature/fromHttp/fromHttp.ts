import { createEffect } from "../effect/effect";
import { signal } from "../signal/signal";
import type { Signal } from "../../types";

export type FromHttpOptions = {
  params?: () => Record<string, string | number | boolean | undefined | null>;
};

export type FromHttpResult<T> = {
  data: Signal<T | undefined>;
  loading: Signal<boolean>;
  error: Signal<Error | undefined>;
};

export function fromHttp<T>(
  url: string,
  options?: FromHttpOptions,
): FromHttpResult<T> {
  const data = signal<T | undefined>(undefined);
  const loading = signal(false);
  const error = signal<Error | undefined>(undefined);

  createEffect(() => {
    let cancelled = false;

    loading.set(true);
    error.set(undefined);

    const params = options?.params?.();
    const requestUrl = buildUrl(url, params);

    void fetch(requestUrl)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status} for ${requestUrl}`);
        }

        return response.json() as Promise<T>;
      })
      .then((result) => {
        if (!cancelled) {
          data.set(result);
          loading.set(false);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          error.set(err instanceof Error ? err : new Error(String(err)));
          loading.set(false);
        }
      });

    return () => {
      cancelled = true;
    };
  });

  return { data, loading, error };
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
