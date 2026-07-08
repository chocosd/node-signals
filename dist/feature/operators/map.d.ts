import type { Transform } from "../../types.js";
export declare function map<T, U>(fn: (value: T) => U): Transform<T, U>;
