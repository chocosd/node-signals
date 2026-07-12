import type { Dependency, Observer } from "../types.js";
export declare let activeObserver: Observer | null;
export declare function setActiveObserver(observer: Observer | null): void;
/** Run `fn` with no active observer so signal reads inside are not tracked. */
export declare function untracked<T>(fn: () => T): T;
/** Subscribe the currently running observer (if any) to a dependency. */
export declare function track(dep: Dependency): void;
/** Detach an observer from every dependency it currently reads. */
export declare function clearDeps(observer: Observer): void;
