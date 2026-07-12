import { createEffect } from "../effect/effect.js";
import { signal } from "../signal/signal.js";
export function fromHttp(url, options) {
    const data = signal(undefined);
    const loading = signal(false);
    const error = signal(undefined);
    let controller = null;
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
        (async () => {
            try {
                let request = {
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
                const result = (await response.json());
                if (!requestController.signal.aborted) {
                    data.set(result);
                    loading.set(false);
                }
            }
            catch (err) {
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
function buildUrl(url, params) {
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
