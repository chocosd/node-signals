import type { Signal } from "../../types.js";
export type FromHttpOptions = {
    params?: () => Record<string, string | number | boolean | undefined | null>;
};
export type FromHttpResult<T> = {
    data: Signal<T | undefined>;
    loading: Signal<boolean>;
    error: Signal<Error | undefined>;
};
export declare function fromHttp<T>(url: string | (() => string), options?: FromHttpOptions): FromHttpResult<T>;
