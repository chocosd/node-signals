import type { Transform } from "../../types.js";
export declare function distinctUntilChanged<T>(equals?: (previous: T, current: T) => boolean): Transform<T, T>;
