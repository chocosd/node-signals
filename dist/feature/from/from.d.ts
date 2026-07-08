import type { Cleanup, Signal } from "../../types.js";
type EmitFactory<T> = (emit: (value: T) => void) => Cleanup;
type ValueFactory<T> = () => T | Promise<T>;
export declare function from<T>(factory: ValueFactory<T>): Signal<T | undefined>;
export declare function from<T>(factory: EmitFactory<T>): Signal<T | undefined>;
export {};
