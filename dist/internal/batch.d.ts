import type { Effect } from "../types.js";
export declare function isBatching(): boolean;
export declare function scheduleEffect(effect: Effect): void;
export declare function batch(fn: () => void): void;
