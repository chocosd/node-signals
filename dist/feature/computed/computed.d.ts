import type { Signal } from "../../types.js";
export declare function computed<T>(fn: () => T): Signal<T>;
