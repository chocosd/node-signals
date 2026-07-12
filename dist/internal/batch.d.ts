import type { Effect, Observer } from "../types.js";
export declare function isBatching(): boolean;
export declare function startBatch(): void;
export declare function endBatch(): void;
/** Queue an effect to run once the current mark phase settles. */
export declare function scheduleEffect(effect: Effect): void;
/**
 * Mark every observer of a changed source dirty inside a batch boundary, so
 * computeds are all flagged before any effect runs (no glitches / double runs).
 */
export declare function notify(observers: Set<Observer>): void;
export declare function batch(fn: () => void): void;
