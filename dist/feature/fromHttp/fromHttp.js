import { createEffect } from "../effect/effect.js";
import { signal } from "../signal/signal.js";
export function fromHttp(url, options) {
    const data = signal(undefined);
    const loading = signal(false);
    const error = signal(undefined);
    createEffect(() => {
        let cancelled = false;
        loading.set(true);
        error.set(undefined);
        const baseUrl = typeof url === "function" ? url() : url;
        if (!baseUrl) {
            data.set(undefined);
            loading.set(false);
            return;
        }
        const requestUrl = buildUrl(baseUrl, options?.params?.());
        void fetch(requestUrl)
            .then(async (response) => {
            if (!response.ok) {
                throw new Error(`HTTP ${response.status} for ${requestUrl}`);
            }
            return response.json();
        })
            .then((result) => {
            if (!cancelled) {
                data.set(result);
                loading.set(false);
            }
        })
            .catch((err) => {
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
