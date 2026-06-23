import type { Transform } from "../../types";

export function map<T, U>(fn: (value: T) => U): Transform<T, U> {
  return (src) => fn(src());
}
