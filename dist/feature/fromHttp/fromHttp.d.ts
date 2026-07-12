import type { Signal } from "../../types.js";
/** The outgoing request, as seen by request interceptors. */
export type HttpRequest = {
    url: string;
    init: RequestInit;
};
/** Transform the request before it is sent (e.g. add auth headers). */
export type RequestInterceptor = (request: HttpRequest) => HttpRequest | Promise<HttpRequest>;
/** Transform the response before it is parsed (e.g. unwrap, throw on codes). */
export type ResponseInterceptor = (response: Response) => Response | Promise<Response>;
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
export declare function fromHttp<T>(url: string | (() => string), options?: FromHttpOptions): FromHttpResult<T>;
