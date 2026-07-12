import type { Signal } from "../../types.js";
/**
 * A lazy, memoized derived signal.
 *
 * The body runs on demand (first read, or after a dependency changes) rather
 * than eagerly, so dependencies are re-tracked every recompute. That means a
 * computed picks up sources that did not exist when it was first created.
 */
export declare function computed<T>(fn: () => T): Signal<T>;
