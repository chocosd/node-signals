import type { Transform } from "../../types.js";

export function map<T, U>(fn: (value: T) => U): Transform<T, U> {
  return (src) => fn(src());
}
