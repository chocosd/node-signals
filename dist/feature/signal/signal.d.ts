import type { Signal } from "../../types.js";
export declare function createToMethod<T>(source: Signal<T>): Signal<T>["to"];
export declare function signal<T>(initial: T): Signal<T>;
